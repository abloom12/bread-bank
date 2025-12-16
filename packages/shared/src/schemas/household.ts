import { z } from 'zod';

export const HouseholdSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1, { message: 'Household name cannot be empty' }),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Household = z.infer<typeof HouseholdSchema>;
