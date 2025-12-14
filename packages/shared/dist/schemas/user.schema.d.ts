import { z } from 'zod';
export declare const createUserBodySchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export type CreateUserBody = z.infer<typeof createUserBodySchema>;
