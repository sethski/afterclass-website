import { z } from 'zod'

export const partnerSchema = z.object({
  businessName: z.string().min(2, 'Enter your business name'),
  location: z.string().min(2, 'Enter your location or campus area'),
  email: z.string().email('Enter a valid email address'),
  message: z.string().max(1000).optional(),
})

export type PartnerInput = z.infer<typeof partnerSchema>
