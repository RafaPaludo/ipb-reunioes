import { z } from 'zod'

const { requiredString } = useValidationSchema()

export const meetingSchema = z.object({
  title: requiredString('Título').min(5, "Título deve possuir ao menos 5 letras."),
  description: requiredString('Descrição').min(2, "Descrição deve possuir ao menos 2 letras."),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  is_recurring: z.string().optional(),
  recurrence_rule: z.string().optional(),
  location: z.string().optional(),
  created_by: z.string().optional(),
})