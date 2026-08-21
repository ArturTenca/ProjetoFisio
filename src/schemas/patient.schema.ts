import { z } from 'zod'
import type { PatientStatus } from '@/types/patient'

const optionalText = (max: number, minWhenFilled = 0) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres`)
    .superRefine((value, ctx) => {
      if (value !== '' && value.length < minWhenFilled) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Mínimo de ${minWhenFilled} caracteres`,
        })
      }
    })

const optionalEmail = z
  .string()
  .trim()
  .max(254)
  .refine((value) => value === '' || z.string().email().safeParse(value).success, {
    message: 'E-mail inválido',
  })

const optionalDate = z
  .string()
  .trim()
  .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: 'Data inválida',
  })

const patientStatusSchema = z.enum(['em_tratamento', 'avaliacao', 'alta', 'inativo'])

export const createPatientSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(120, 'Nome muito longo'),
  phone: optionalText(30),
  email: optionalEmail,
  birthDate: optionalDate,
  profession: optionalText(80),
  emergencyName: optionalText(120, 2),
  emergencyPhone: optionalText(30),
  emergencyRelation: optionalText(60),
  adminNotes: optionalText(2000),
  referralSource: optionalText(120),
  therapistName: optionalText(120),
})

export const updatePatientSchema = createPatientSchema.extend({
  status: patientStatusSchema,
  code: z
    .string()
    .trim()
    .min(3, 'Código muito curto')
    .max(20, 'Código muito longo'),
})

export type CreatePatientFormData = z.infer<typeof createPatientSchema>
export type UpdatePatientFormData = z.infer<typeof updatePatientSchema>

export const patientStatusOptions: Array<{ value: PatientStatus; label: string }> = [
  { value: 'avaliacao', label: 'Avaliação' },
  { value: 'em_tratamento', label: 'Em tratamento' },
  { value: 'alta', label: 'Alta' },
  { value: 'inativo', label: 'Inativo' },
]
