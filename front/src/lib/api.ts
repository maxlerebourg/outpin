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
  postActivitySchema,
  patchActivitySchema,
  postLodgingSchema,
  patchLodgingSchema,
  postTransportationSchema,
  patchTransportationSchema,
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
  activities = this.pb.collection<Activity>('activities')
  lodgings = this.pb.collection<Lodging>('lodgings')
  transportations = this.pb.collection<Transportation>('transportations')

  adventuresResponse: Adventure[] = []
  visitsResponse: Visit[] = []
  categoriesResponse: Category[] = []
  activitiesResponse: Activity[] = []
  lodgingsResponse: Lodging[] = []
  transportationsResponse: Transportation[] = []

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

  async getSelf() {
    return await this.pb.send('/api/self', {})
  }

  async refreshUser() {
    try {
      const data = await this.getSelf()
      if (data.token) {
        this.pb.authStore.save(data.token, data.record)
      } else {
        if (!this.pb.authStore.isValid) throw new Error()
        await this.users.authRefresh()
      }
    } catch {
      return await this.logout()
    }
    await this.load()
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
    const items = await this.getUserAdventures()
    this.adventuresResponse = items
    this.computeStore()
  }

  async reloadCategories() {
    const items = await this.getUserCategories()
    this.categoriesResponse = items
    this.computeStore()
  }

  async reloadVisits() {
    const items = await this.getUserVisits()
    this.visitsResponse = items
    this.computeStore()
  }

  async reloadActivities() {
    const items = await this.getUserActivities()
    this.activitiesResponse = items
    this.computeStore()
  }

  async reloadLodgings() {
    const items = await this.getUserLodgings()
    this.lodgingsResponse = items
    this.computeStore()
  }

  async reloadTransportations() {
    const items = await this.getUserTransportations()
    this.transportationsResponse = items
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
    const activityByAdventureId = this.activitiesResponse.reduce<
      Record<string, Activity[]>
    >((acc, item) => {
      ;(acc[item.adventure_id] ??= []).push(formatActivity(item))
      return acc
    }, {})
    const lodgingByAdventureId = this.lodgingsResponse.reduce<
      Record<string, Lodging[]>
    >((acc, item) => {
      ;(acc[item.adventure_id] ??= []).push(formatLodging(item))
      return acc
    }, {})
    const transportationByAdventureId = this.transportationsResponse.reduce<
      Record<string, Transportation[]>
    >((acc, item) => {
      ;(acc[item.adventure_id] ??= []).push(formatTransportation(item))
      return acc
    }, {})
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
          end_date: a.start_date
            ? currentDate?.toISOString().split('T')[0]
            : null,
          day_duration,
          category: categoryById[a.category_id ?? ''] ?? null,
          visits,
          activities: activityByAdventureId[a.id ?? ''] ?? [],
          lodgings: lodgingByAdventureId[a.id ?? ''] ?? [],
          transportations: transportationByAdventureId[a.id ?? ''] ?? [],
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

  getUserActivities() {
    return this.activities.getFullList()
  }

  getUserLodgings() {
    return this.lodgings.getFullList()
  }

  getUserTransportations() {
    return this.transportations.getFullList()
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

  async deleteActivity(data: { id: string }) {
    await this.activities.delete(data.id)
    await this.reloadActivities()
  }

  async deleteLodging(data: { id: string }) {
    await this.lodgings.delete(data.id)
    await this.reloadLodgings()
  }

  async deleteTransportation(data: { id: string }) {
    await this.transportations.delete(data.id)
    await this.reloadTransportations()
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

  async postActivity(data: Activity) {
    const { formData, errors } = validateData(data, postActivitySchema)
    if (errors) throw new FormError(errors.fieldErrors)
    try {
      const activity = await this.activities.create({
        adventure_id: formData.adventure_id,
        location: formData.location,
        name: formData.name,
        cost: formData.cost,
        at: formData.at,
      })
      await this.reloadActivities()
      return activity
    } catch (err: any) {
      throw new FormError({ error: err.response.message })
    }
  }

  async patchActivity(data: Partial<Activity>) {
    const { formData, errors } = validateData(data, patchActivitySchema)
    if (errors) throw new FormError(errors.fieldErrors)
    try {
      const activity = await this.activities.update(formData.id, {
        adventure_id: formData.adventure_id,
        location: formData.location,
        name: formData.name,
        cost: formData.cost,
        at: formData.at,
      })
      await this.reloadActivities()
      return activity
    } catch (err: any) {
      throw new FormError({ error: err.response.message })
    }
  }

  async postLodging(data: Lodging) {
    const { formData, errors } = validateData(data, postLodgingSchema)
    if (errors) throw new FormError(errors.fieldErrors)
    try {
      const lodging = await this.lodgings.create({
        adventure_id: formData.adventure_id,
        location: formData.location,
        company: formData.company,
        reservation: formData.reservation,
        cost: formData.cost,
        from_at: formData.from_at,
        to_at: formData.to_at,
      })
      await this.reloadLodgings()
      return lodging
    } catch (err: any) {
      throw new FormError({ error: err.response.message })
    }
  }

  async patchLodging(data: Partial<Lodging>) {
    const { formData, errors } = validateData(data, patchLodgingSchema)
    if (errors) throw new FormError(errors.fieldErrors)
    try {
      const lodging = await this.lodgings.update(formData.id, {
        adventure_id: formData.adventure_id,
        location: formData.location,
        company: formData.company,
        reservation: formData.reservation,
        cost: formData.cost,
        from_at: formData.from_at,
        to_at: formData.to_at,
      })
      await this.reloadLodgings()
      return lodging
    } catch (err: any) {
      throw new FormError({ error: err.response.message })
    }
  }

  async postTransportation(data: Transportation) {
    const { formData, errors } = validateData(data, postTransportationSchema)
    if (errors) throw new FormError(errors.fieldErrors)
    try {
      const transportation = await this.transportations.create({
        adventure_id: formData.adventure_id,
        type: formData.type,
        company: formData.company,
        reservation: formData.reservation,
        cost: formData.cost,
        from: formData.from,
        from_at: formData.from_at,
        to: formData.to,
        to_at: formData.to_at,
      })
      await this.reloadTransportations()
      return transportation
    } catch (err: any) {
      throw new FormError({ error: err.response.message })
    }
  }

  async patchTransportation(data: Partial<Transportation>) {
    const { formData, errors } = validateData(data, patchTransportationSchema)
    if (errors) throw new FormError(errors.fieldErrors)
    try {
      const transportation = await this.transportations.update(formData.id, {
        adventure_id: formData.adventure_id,
        type: formData.type,
        company: formData.company,
        reservation: formData.reservation,
        cost: formData.cost,
        from: formData.from,
        from_at: formData.from_at,
        to: formData.to,
        to_at: formData.to_at,
      })
      await this.reloadTransportations()
      return transportation
    } catch (err: any) {
      throw new FormError({ error: err.response.message })
    }
  }
}

function formatAdventure(item: Adventure): Adventure {
  return {
    id: item.id,
    user_id: item.user_id,
    category_id: item.category_id || null,
    description: item.description || null,
    rating: item.rating,
    name: item.name,
    start_date: item.start_date
      ? new Date(item.start_date).toISOString().split('T')[0]
      : null,
    end_date: null,
    day_duration: null,
  }
}

function formatVisit(item: Visit): Visit {
  return {
    id: item.id,
    adventure_id: item.adventure_id,
    category_id: item.category_id || null,
    notes: item.notes || null,
    day_duration: item.day_duration,
    start_date: null,
    end_date: null,
    location: item.location,
    latitude: item.latitude,
    longitude: item.longitude,
    rating: item.rating,
    order: item.order,
  }
}

function formatActivity(item: Activity): Activity {
  return {
    id: item.id,
    adventure_id: item.adventure_id,
    at: item.at
      ? new Date(item.at).toISOString().replace('T', ' ').replace('Z', '')
      : null,
    location: item.location,
    name: item.name,
    cost: item.cost,
  }
}

function formatLodging(item: Lodging): Lodging {
  return {
    id: item.id,
    adventure_id: item.adventure_id,
    from_at: item.from_at
      ? new Date(item.from_at).toISOString().replace('T', ' ').replace('Z', '')
      : null,
    to_at: item.to_at
      ? new Date(item.to_at).toISOString().replace('T', ' ').replace('Z', '')
      : null,
    location: item.location,
    company: item.company,
    reservation: item.reservation,
    cost: item.cost,
  }
}

function formatTransportation(item: Transportation): Transportation {
  return {
    id: item.id,
    adventure_id: item.adventure_id,
    type: item.type,
    from: item.from,
    from_at: item.from_at
      ? new Date(item.from_at).toISOString().replace('T', ' ').replace('Z', '')
      : null,
    to: item.to,
    to_at: item.to_at
      ? new Date(item.to_at).toISOString().replace('T', ' ').replace('Z', '')
      : null,
    company: item.company,
    reservation: item.reservation,
    cost: item.cost,
  }
}

export const Api = new ApiClass()
export const pb = Api.pb
