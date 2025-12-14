import { z } from 'zod';

export const createUserBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
