import { z } from 'zod';

export const createShareLinkSchema = z.object({
  expiresAt: z
    .string()
    .datetime({ offset: true })
    .refine((value) => new Date(value) > new Date(), {
      message: 'expiresAt must be in the future',
    })
    .optional(),
});

export type CreateShareLinkRequest = z.infer<typeof createShareLinkSchema>;

const shareTokenPattern = /^[a-f0-9]{64}$/i;

export const isValidShareToken = (token: string): boolean =>
  shareTokenPattern.test(token);
