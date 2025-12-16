import { z } from 'zod';

export const UserSchema = z.object({
  id: z.uuid(),
  householdId: z.uuid(),
  email: z.email(),
  name: z.string(),
  avatarUrl: z.url().nullable(),
  authProvider: z.enum(['google', 'apple', 'email']),
  providerId: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const PublicUserSchema = UserSchema.pick({
  id: true,
  householdId: true,
  email: true,
  name: true,
  avatarUrl: true,
});

export type User = z.infer<typeof UserSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
