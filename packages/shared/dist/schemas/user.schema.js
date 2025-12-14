import { z } from 'zod';
export const createUserBodySchema = z.object({
    email: z.email(),
    password: z.string().min(8),
});
