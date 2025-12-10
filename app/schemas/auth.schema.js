import { z } from 'zod'

const { emailField, passwordField, requiredString } = useValidationSchema()

export const loginSchema = z.object({
  email: emailField(),
  password: passwordField()
})

export const registerSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  email: emailField(),
  phone: z.string().regex(/^\d{11}$/, 'O telefone deve ter 11 dígitos'),
  password: passwordField(),
  confirmPassword: passwordField(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword']
})

export const resetPasswordSchema = z.object({
  email: emailField()
})

export const newPasswordSchema = z.object({
  password: passwordField(),
  confirmPassword: passwordField(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword']
})