<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-lg max-w-md">
      <UAuthForm
        :schema="resetPasswordSchema"
        :fields="fields"
        title="Esqueci a senha"
        icon="i-lucide-lock"
        @submit="onSignUpNewUser"
      >
        <template #description>
          Já possui conta? <ULink to="/login" class="text-primary font-medium">Fazer login</ULink>
        </template>
        <template #validation>
          <UAlert v-if="alert" color="error" icon="i-lucide-info" :title="alert" />
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>

<script setup>
import { resetPasswordSchema } from '~/schemas/auth.schema'

definePageMeta({
  layout: 'authentication'
})

// Hooks
const { getErrorMessage } = useErrorMessages()
const supabase = useSupabaseClient()
const toast = useToast()

// Schema

// Data
const fields = [{
  name: 'email',
  type: 'text',
  label: 'E-mail',
  placeholder: 'Digite seu e-mail',
  required: true,
}]
const alert = ref("")

// Functions
async function onSignUpNewUser(payload) {
  alert.value = ""

  try {
    await supabase.auth.resetPasswordForEmail(payload.data.email, {
      redirectTo: 'http://localhost:3000/new-password',
    })
  } catch (error) {
    alert.value = getErrorMessage(error)
  }
}
</script>