import { z } from 'zod'

export const feedbackSchema = z.object({
  token: z.string().trim().min(16, 'This feedback link is not valid.'),
  showedUp: z.enum(['yes', 'no'], { error: 'Tell us if you showed up.' }),
  feltSafe: z.enum(['yes', 'no'], { error: 'Tell us if you felt safe.' }),
  wouldUseAgain: z.enum(['yes', 'no'], {
    error: 'Tell us if you would use After Class again.',
  }),
  rating: z
    .union([z.literal(''), z.coerce.number().int().min(1).max(5)])
    .optional()
    .transform((value) => (value === '' || value == null ? undefined : value)),
  comments: z.string().trim().max(2000).optional().default(''),
})

export type FeedbackPayload = z.infer<typeof feedbackSchema>
