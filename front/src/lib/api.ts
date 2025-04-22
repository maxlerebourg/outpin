import { PUBLIC_POCKETBASE_URL } from '$env/static/public'
import PocketBase from 'pocketbase'
import { toSlug } from './utils'
import {
  loginUserSchema,
  patchUsernameSchema,
  postAdventureSchema,
  registerUserSchema,
  patchEmailSchema,
  patchPasswordSchema,
  postCategorySchema,
  postVisitSchema,
  patchAdventureSchema,
  patchVisitSchema,
} from './schemas'
import { adventuresStore, categoriesStore } from './store'

export class FormError extends Error {
  constructor(readonly errors: unknown) {
    super()
  }
}

function createInstance() {
  return new PocketBase(PUBLIC_POCKETBASE_URL || 'http://localhost:8090')
}

function validateData(body: any, schema: any) {
  try {
    const data = schema.parse(body)
    return { formData: data, errors: null }
  } catch (err: any) {
    console.log(body, err)
    const errors = err.flatten()
    return { formData: body, errors }
  }
}

export class ApiClass {
  pb = createInstance()

  users = this.pb.collection<User>('users')
  adventures = this.pb.collection<Adventure>('adventures')
  categories = this.pb.collection<Category>('categories')
  visits = this.pb.collection<Visit>('visits')

  adventuresResponse: Adventure[] = []
  visitsResponse: Visit[] = []
  categoriesResponse: Category[] = []

  async getGeocodingReverse(lngLat: LngLat): Promise<Address> {
    return await this.pb.send<Address>('/api/geocoding/reverse', {
      query: { lat: lngLat.lat, lng: lngLat.lng },
    })
  }

  async getGeocodingSearch(search: { q: string }): Promise<Address> {
    return await this.pb.send<Address>('/api/geocoding/search', {
      query: { q: encodeURIComponent(search.q) },
    })
  }

  async refreshUser() {
    try {
      if (!this.pb.authStore.isValid) throw new Error()
      await this.users.authRefresh()
      await this.load()
    } catch (err: any) {
      await this.logout()
    }
  }

  async login(data: Auth) {
    const { formData, errors } = validateData(data, loginUserSchema)
    if (errors) throw new FormError(errors.fieldErrors)
    try {
      await this.users.authWithPassword(formData.email, formData.password)
      await this.load()
    } catch (err: any) {
      throw new FormError({ email: err.response.message })
    }
  }

  async logout() {
    this.pb.authStore.clear()
    await this.load()
  }

  async forgotPassword(data: Partial<Auth>) {
    const { formData, errors } = validateData(data, patchEmailSchema)
    if (errors) throw new FormError(errors.fieldErrors)
    try {
      await this.users.requestPasswordReset(String(formData.email))
    } catch (err: any) {
      throw new FormError({ email: err.response.message })
    }
  }

  async register(data: Auth) {
    const { formData, errors } = validateData(data, registerUserSchema)
    if (errors) throw new FormError(errors.fieldErrors)
    const emailHandle = formData.email?.split('@')[0].toLowerCase() ?? ''
    const randomDigits = Math.floor(1000 + Math.random() * 8999) // Generate random 4 digit number
    const username = `${emailHandle}${randomDigits}`
    try {
      await this.users.create({
        username,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.password,
      })
      await this.users.requestVerification(formData.email)
    } catch (err: any) {
      throw new FormError({ email: err.response.message })
    }
  }

  async patchUserEmail(data: { email: string }) {
    const { formData, errors } = validateData(data, patchEmailSchema)
    if (errors) throw new FormError(errors.fieldErrors)
    try {
      await this.users.requestEmailChange(formData.email)
    } catch (err: any) {
      throw new FormError({ email: err.response.message })
    }
  }

  async patchUserUsername(data: { username: string }) {
    const { formData, errors } = validateData(data, patchUsernameSchema)
    if (errors) throw new FormError(errors.fieldErrors)
    try {
      await this.users.update(this.pb.authStore.record?.id ?? '', {
        name: formData.username,
      })
    } catch (err: any) {
      throw new FormError({ username: err.response.message })
    }
  }

  async patchUserPassword(data: { oldPassword: string; password: string }) {
    const { formData, errors } = validateData(data, patchPasswordSchema)
    if (errors) throw new FormError(errors.fieldErrors)
    try {
      await this.users.update(this.pb.authStore.record?.id ?? '', {
        ...formData,
        passwordConfirm: formData.password,
      })
      this.logout()
    } catch (err: any) {
      throw new FormError({ oldPassword: err.response.message })
    }
  }

  async reloadAdventures() {
    const adventures = await this.getUserAdventures()
    this.adventuresResponse = adventures
    this.computeStore()
  }

  async reloadCategories() {
    const categories = await this.getUserCategories()
    this.categoriesResponse = categories
    this.computeStore()
  }

  async reloadVisits() {
    const visits = await this.getUserVisits()
    this.visitsResponse = visits
    this.computeStore()
  }

  async load() {
    let adventures: Adventure[]
    let categories: Category[]
    let visits: Visit[]
    try {
      ;[adventures, categories, visits] = await Promise.all([
        this.getUserAdventures(),
        this.getUserCategories(),
        this.getUserVisits(),
      ])
    } catch (err) {
      adventures = []
      categories = []
      visits = []
    }
    this.adventuresResponse = adventures
    this.categoriesResponse = categories
    this.visitsResponse = visits

    this.computeStore()
  }

  async computeStore() {
    const categoryById = this.categoriesResponse.reduce<
      Record<string, Category>
    >((acc, cat) => ({ ...acc, [cat.id]: cat }), {})
    const adventureById = this.adventuresResponse.reduce<
      Record<string, Adventure>
    >((acc, adv) => ({ ...acc, [adv.id]: adv }), {})

    const now = new Date().toISOString().split('T')[0]
    const computedVisits = this.visitsResponse
      .map((v: Visit) => ({
        ...formatVisit(v),
        category: categoryById[v.category_id ?? ''] ?? null,
      }))
      .sort((a: Visit, b: Visit) => a.order - b.order)
    const visitByAdventureId = computedVisits.reduce<Record<string, Visit[]>>(
      (acc, visit) => {
        ;(acc[visit.adventure_id] ??= []).push(visit)
        return acc
      },
      {},
    )
    categoriesStore.set(this.categoriesResponse)
    adventuresStore.set(
      this.adventuresResponse.map((a: Adventure) => {
        let visits: Visit[] = visitByAdventureId[a.id ?? ''] ?? []
        let currentDate: Date
        let day_duration: number = 0
        if (visits.length && a.start_date) {
          currentDate = new Date(a.start_date)
          visits = visits?.map((v: Visit) => {
            const startDate = currentDate
            day_duration += v.day_duration ?? 0
            if (v.day_duration) {
              const d = new Date(currentDate)
              d.setDate(d.getDate() + v.day_duration)
              currentDate = d
            }
            const start_date = startDate?.toISOString().split('T')[0]
            const end_date = currentDate?.toISOString().split('T')[0]
            return {
              ...v,
              start_date,
              end_date,
              status:
                ((start_date || '1900') < now &&
                  ((end_date || '2999') >= now ? 'current' : 'past')) ||
                'future',
            }
          })
        } else {
          currentDate = new Date()
          visits = visits.map((v) => {
            day_duration += v.day_duration ?? 0
            return { ...v, status: 'past' }
          })
        }
        return {
          ...formatAdventure(a),
          visits,
          end_date: a.start_date
            ? currentDate?.toISOString().split('T')[0]
            : null,
          day_duration,
          category: categoryById[a.category_id ?? ''] ?? null,
        }
      }),
    )
  }

  getUserAdventures() {
    return this.adventures.getFullList()
  }

  getUserCategories() {
    return this.categories.getFullList()
  }

  getUserVisits() {
    return this.visits.getFullList()
  }

  async deleteAdventure(data: { id: string }) {
    await this.adventures.delete(data.id)
    await this.reloadAdventures()
  }

  async deleteCategory(data: { id: string }) {
    await this.categories.delete(data.id)
    await this.reloadCategories()
  }

  async deleteVisit(data: { id: string }) {
    await this.visits.delete(data.id)
    await this.reloadVisits()
  }

  async postCategory(data: Category) {
    const { formData, errors } = validateData(data, postCategorySchema)
    if (errors) throw new FormError(errors.fieldErrors)
    try {
      const category = await this.categories.create({
        user_id: this.pb.authStore.record?.id,
        name: toSlug(formData?.display_name ?? ''),
        display_name: formData.display_name,
        icon: formData.icon,
      })
      await this.reloadCategories()
      return category
    } catch (err: any) {
      console.log(err)
      throw new FormError({ error: err.response.message })
    }
  }

  async postAdventure(data: Adventure) {
    const { formData, errors } = validateData(data, postAdventureSchema)
    if (errors) throw new FormError(errors.fieldErrors)
    try {
      const adventure = await this.adventures.create({
        user_id: [this.pb.authStore.record?.id],
        category_id: formData.category_id,
        rating: formData.rating,
        name: formData.name,
        description: formData.description,
        start_date: formData.start_date,
      })
      await this.reloadAdventures()
      return formatAdventure(adventure)
    } catch (err: any) {
      throw new FormError({ error: err.response.message })
    }
  }

  async patchAdventure(data: Partial<Adventure>) {
    const { formData, errors } = validateData(data, patchAdventureSchema)
    if (errors) throw new FormError(errors.fieldErrors)
    try {
      const adventure = await this.adventures.update(formData.id, {
        user_id: [this.pb.authStore.record?.id],
        category_id: formData.category_id,
        rating: formData.rating,
        name: formData.name,
        description: formData.description,
        start_date: formData.start_date,
      })
      await this.reloadAdventures()
      return formatAdventure(adventure)
    } catch (err: any) {
      throw new FormError({ error: err.response.message })
    }
  }

  async postVisit(data: Visit) {
    const { formData, errors } = validateData(data, postVisitSchema)
    console.log(errors, formData)
    if (errors) throw new FormError(errors.fieldErrors)
    try {
      const visit = await this.visits.create({
        adventure_id: formData.adventure_id,
        category_id: formData.category_id,
        day_duration: formData.day_duration,
        notes: formData.notes,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        rating: formData.rating,
        order: formData.order,
      })
      await this.reloadVisits()
      return formatVisit(visit)
    } catch (err: any) {
      throw new FormError({ error: err.response.message })
    }
  }

  async patchVisit(data: Partial<Visit>) {
    const { formData, errors } = validateData(data, patchVisitSchema)
    if (errors) throw new FormError(errors.fieldErrors)
    try {
      const visit = await this.visits.update(formData.id, {
        adventure_id: formData.adventure_id,
        category_id: formData.category_id,
        day_duration: formData.day_duration,
        notes: formData.notes,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        rating: formData.rating,
        order: formData.order,
      })
      await this.reloadVisits()
      return formatVisit(visit)
    } catch (err: any) {
      throw new FormError({ error: err.response.message })
    }
  }
}

function formatAdventure(adventure: Adventure): Adventure {
  return {
    id: adventure.id,
    user_id: adventure.user_id,
    category_id: adventure.category_id || null,
    description: adventure.description || null,
    rating: adventure.rating,
    name: adventure.name,
    start_date: adventure.start_date
      ? new Date(adventure.start_date).toISOString().split('T')[0]
      : null,
    end_date: null,
    day_duration: null,
  }
}

function formatVisit(visit: Visit): Visit {
  return {
    id: visit.id,
    adventure_id: visit.adventure_id,
    category_id: visit.category_id || null,
    notes: visit.notes || null,
    day_duration: visit.day_duration,
    start_date: null,
    end_date: null,
    location: visit.location,
    latitude: visit.latitude,
    longitude: visit.longitude,
    rating: visit.rating,
    order: visit.order,
  }
}

export const Api = new ApiClass()
export const pb = Api.pb
