<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-lg max-w-md">
      <UAuthForm
        :schema="newPasswordSchema"
        :fields="fields"
        title="Esqueci a senha"
        icon="i-lucide-lock"
        @submit="onSignUpNewUser"
      >
        <template #validation>
          <UAlert v-if="alert" color="error" icon="i-lucide-info" :title="alert" />
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>

<script setup>
import { newPasswordSchema } from '~/schemas/auth.schema'

definePageMeta({
  layout: 'authentication'
})

// Hooks
const { getErrorMessage } = useErrorMessages()
const supabase = useSupabaseClient()
const toast = useToast()

// Data
const fields = [{
  name: 'password',
  label: 'Senha',
  type: 'password',
  placeholder: 'Digite sua senha',
  required: true,
},
{
  name: 'confirmPassword',
  label: 'Confirmação da senha',
  type: 'password',
  placeholder: 'Digite sua senha novamente',
  required: true,
}]
const alert = ref("")

// Functions
async function onSignUpNewUser(payload) {
  alert.value = ""

  try {
    return
  } catch (error) {
    alert.value = getErrorMessage(error)
  }
}
</script>