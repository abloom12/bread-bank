import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8).max(32),
  image: z.string().optional(),
  callbackURL: z.string().optional(),
});

export type SignupSchema = z.infer<typeof signupSchema>;
