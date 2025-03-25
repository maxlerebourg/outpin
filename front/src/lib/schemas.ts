import { z } from 'zod'

const zDate = () =>
  z
    .string()
    .transform((str: string) =>
      str !== '' ? new Date(str).toISOString().replace('T', ' ') : null,
    )

const zCategoryId = () =>
  z
    .string()
    .min(1)
    .max(200)
    .transform((str) => (str === '__add' ? undefined : str))

export const loginUserSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Email must be a valid email.' }),
  password: z.string({ required_error: 'Password is required' }),
})

export const registerUserSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Email must be a valid email' }),
  password: z
    .string({ required_error: 'Password is required' })
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
      message:
        'Password must be a minimum of 8 characters & contain at least one letter, one number, and one special character',
    }),
})

export const patchEmailSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Email must be a valid email' }),
})

export const patchUsernameSchema = z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(24, { message: 'Username must be 24 characters or less' })
    .regex(/^[a-zA-Z0-9]*$/, {
      message: 'Username can only contain letters or numbers',
    }),
})

export const patchPasswordSchema = z.object({
  oldPassword: z.string({ required_error: 'Old password is required' }),
  password: z
    .string({ required_error: 'Password is required' })
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
      message:
        'Password must be a minimum of 8 characters & contain at least one letter, one number, and one special character',
    }),
})

export const postCategorySchema = z.object({
  display_name: z
    .string({ required_error: 'Name is required' })
    .min(3)
    .max(200),
  icon: z.string().min(1).max(4).nullable(),
})

export const postVisitSchema = z.object({
  adventure_id: z.string().min(1).max(200),
  category_id: zCategoryId().nullable(),
  day_duration: z.number().min(0).nullable(),
  notes: z.string().min(3).nullable(),
  latitude: z.number(),
  longitude: z.number(),
  location: z
    .string({ required_error: 'Location is required' })
    .min(3)
    .max(200),
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
  location: z
    .string({ required_error: 'Location is required' })
    .min(3)
    .max(200)
    .optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
  order: z.number().min(0).max(100).optional(),
})

export const postAdventureSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(3).max(200),
  description: z.string().nullable(),
  start_date: zDate().nullable(),
  rating: z.number().min(0).max(5).nullable(),
  category_id: zCategoryId().nullable(),
})

export const patchAdventureSchema = z.object({
  id: z.string().min(1).max(200),
  name: z
    .string({ required_error: 'Name is required' })
    .min(3)
    .max(200)
    .optional(),
  start_date: zDate().nullable().optional(),
  description: z.string().nullable().optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
  category_id: zCategoryId().nullable().optional(),
})
