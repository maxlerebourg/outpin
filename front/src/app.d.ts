declare namespace App {
  interface Locals {
    pb: import('pocketbase').default
    user: import('pocketbase').default['authStore']['record']
  }
}

declare global {
  interface User {
    id: string
    username: string
    email: string
  }

  interface Adventure {
    id: string
    user_id: string | null
    name: string
    day_duration: number | null
    start_date: string | null
    end_date: string | null
    activity_types?: string[] | null
    description?: string | null
    rating: number | null
    category_id: string | null
    category?: Category | null
    visits?: Visit[]
    activities?: Activity[]
    lodgings?: Lodging[]
    transportations?: Transportation[]
    // link?: string | null
    // images: {
    //   id: string
    //   image: string
    //   is_primary: boolean
    // }[]
    // collection?: string | null
    // created_at?: string | null
    // updated_at?: string | null
    // attachments: Array<{
    //   id: string
    //   file: string
    //   adventure: string
    //   extension: string
    //   user_id: string
    //   name: string
    // }>
  }

  interface Category {
    id: string
    name: string | null
    display_name: string
    icon: string
    user_id: string
    num_adventures?: number | null
  }

  interface Visit {
    id: string
    adventure_id: string
    day_duration: number | null
    start_date: string | null
    end_date: string | null
    notes: string | null
    location: string
    latitude: number
    longitude: number
    rating: number | null
    order: number
    status?: 'past' | 'current' | 'future'
    category_id: string | null
    category?: Category | null
  }

  interface Activity {
    id: string
    adventure_id: string
    name: string
    location: string | null
    cost: number | null
    at: string | null
  }

  interface Lodging {
    id: string
    adventure_id: string
    company: string
    location: string | null
    reservation: string | null
    cost: number | null
    from_at: string | null
    to_at: string | null
  }

  interface Transportation {
    id: string
    adventure_id: string
    type: 'car' | 'boat' | 'velo' | 'bus' | 'flight' | 'train'
    company: string | null
    reservation: string | null
    cost: number | null
    from: string | null
    from_at: string | null
    to: string | null
    to_at: string | null
  }

  interface Address {
    city: string
    state: string
    postCode: string
    country: string
    latitude: number
    longitude: number
  }

  interface LngLat {
    lat: number
    lng: number
  }

  interface Auth {
    email: string
    password: string
  }
}

export {}
