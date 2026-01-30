import { z } from 'zod'

const zDate = () =>
  z
    .string()
    .transform((str: string) =>
      str !== '' ? new Date(str).toISOString().replace('T', ' ') : null,
    )

const zPassword = () =>
  z
    .string('Password is required')
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      'Password must be a minimum of 8 characters & contain at least one letter, one number, and one special character',
    )

const zCategoryId = () =>
  z
    .string()
    .min(1)
    .max(200)
    .transform((str) => (str === '__add' ? undefined : str))

export const loginUserSchema = z.object({
  email: z.email('Email must be a valid email'),
  password: z.string('Password is required'),
})

export const registerUserSchema = z.object({
  email: z.email('Email must be a valid email'),
  password: zPassword(),
})

export const patchEmailSchema = z.object({
  email: z.email('Email must be a valid email'),
})

export const patchUsernameSchema = z.object({
  username: z
    .string('Username is required')
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9]*$/, 'Username can only contain letters or numbers'),
})

export const patchPasswordSchema = z.object({
  oldPassword: z.string('Old password is required'),
  password: zPassword(),
})

export const postCategorySchema = z.object({
  display_name: z.string('Name is required').min(3).max(200),
  icon: z.string().min(1).max(4).nullable(),
})

export const postAdventureSchema = z.object({
  name: z.string('Name is required').min(3).max(200),
  description: z.string().nullable(),
  start_date: zDate().nullable(),
  rating: z.number().min(0).max(5).nullable(),
  category_id: zCategoryId().nullable(),
})

export const patchAdventureSchema = z.object({
  id: z.string().min(1).max(200),
  name: z.string('Name is required').min(3).max(200).optional(),
  start_date: zDate().nullable().optional(),
  description: z.string().nullable().optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
  category_id: zCategoryId().nullable().optional(),
})

export const postVisitSchema = z.object({
  adventure_id: z.string().min(1).max(200),
  category_id: zCategoryId().nullable(),
  day_duration: z.number().min(0).nullable(),
  notes: z.string().min(3).nullable(),
  latitude: z.number(),
  longitude: z.number(),
  location: z.string('Location is required').min(3).max(200),
  rating: z.number().min(0).max(5).nullable(),
  order: z.number().min(0).max(100),
})

export const patchVisitSchema = z.object({
  id: z.string().min(1).max(200),
  adventure_id: z.string().min(1).max(200).optional(),
  category_id: zCategoryId().nullable().optional(),
  day_duration: z.number().min(0).nullable().optional(),
  notes: z.string().min(3).nullable().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  location: z.string('Location is required').min(3).max(200).optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
  order: z.number().min(0).max(100).optional(),
})

export const postActivitySchema = z.object({
  name: z.string().min(1).max(200),
  adventure_id: z.string().min(1).max(200),
  location: z.string().nullable(),
  cost: z.number().min(0).nullable(),
  at: zDate().nullable(),
})

export const patchActivitySchema = z.object({
  id: z.string().min(1).max(200),
  adventure_id: z.string().min(1).max(200),
  name: z.string().max(200).nullable().optional(),
  location: z.string().nullable().optional(),
  cost: z.number().min(0).nullable().optional(),
  at: zDate().nullable().optional(),
})

export const postLodgingSchema = z.object({
  adventure_id: z.string().min(1).max(200),
  location: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  reservation: z.string().max(200).nullable(),
  cost: z.number().min(0).nullable(),
  from_at: zDate().nullable(),
  to_at: zDate().nullable(),
})

export const patchLodgingSchema = z.object({
  id: z.string().min(1).max(200),
  adventure_id: z.string().min(1).max(200),
  location: z.string().max(200).nullable(),
  company: z.string().max(200).nullable().optional(),
  reservation: z.string().max(200).nullable().optional(),
  cost: z.number().min(0).nullable().optional(),
  from_at: zDate().nullable().optional(),
  to_at: zDate().nullable().optional(),
})

export const postTransportationSchema = z.object({
  adventure_id: z.string().min(1).max(200),
  company: z.string().max(200).nullable(),
  reservation: z.string().max(200).nullable(),
  type: z.enum(['car', 'boat', 'bike', 'bus', 'flight', 'train']),
  cost: z.number().min(0).nullable(),
  from: z.string().max(200).nullable(),
  from_at: zDate().nullable(),
  to: z.string().max(200).nullable(),
  to_at: zDate().nullable(),
})

export const patchTransportationSchema = z.object({
  id: z.string().min(1).max(200),
  adventure_id: z.string().min(1).max(200),
  company: z.string().max(200).nullable().optional(),
  reservation: z.string().max(200).nullable().optional(),
  type: z.enum(['car', 'boat', 'bike', 'bus', 'flight', 'train']).optional(),
  cost: z.number().min(0).nullable().optional(),
  from: z.string().max(200).nullable().optional(),
  from_at: zDate().nullable().optional(),
  to: z.string().max(200).nullable().optional(),
  to_at: zDate().nullable().optional(),
})
