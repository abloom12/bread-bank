import { z } from 'zod';
import { PublicUserSchema } from './user';
import { HouseholdSchema } from './household';

export const AuthMeResponseSchema = z.object({
  user: PublicUserSchema,
  household: HouseholdSchema,
});

export type AuthMeResponse = z.infer<typeof AuthMeResponseSchema>;
