import { z } from 'zod';

export const InviteSchema = z.object({
  id: z.uuid(),
  householdId: z.uuid(),
  email: z.email(),
  inviteBy: z.uuid(),
  expiresAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
  usedAt: z.iso.datetime().nullable(),
});

export const CreateInviteSchema = z.object({
  email: z.email(),
});

export type Invite = z.infer<typeof InviteSchema>;
