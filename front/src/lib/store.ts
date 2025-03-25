import { writable } from 'svelte/store'

export const toast = writable({
  show: false,
  message: '',
  type: '',
})

export const currentUserStore = writable<User | null>(null)

export const adventuresStore = writable<Adventure[]>([])

export const categoriesStore = writable<Category[]>([])
