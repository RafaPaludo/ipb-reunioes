<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-lg max-w-md">
      <UAuthForm
        :schema="loginSchema"
        :fields="fields"
        title="Olá novamente!"
        icon="i-lucide-lock"
        @submit="onSubmit"
      >
        <template #description>
          Não possui uma conta? <ULink to="/register" class="text-primary font-medium">Inscreva-se</ULink>
        </template>
        <template #password-hint>
          <ULink to="/reset-password" class="text-primary font-medium" tabindex="-1">Esqueceu a senha?</ULink>
        </template>
        <template #validation>
          <UAlert v-if="alert" color="error" icon="i-lucide-info" :title="alert" />
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>

<script setup>
import { loginSchema } from '~/schemas/auth.schema'

definePageMeta({
  layout: 'authentication'
})

// Hooks
const { getErrorMessage } = useErrorMessages()
const supabaseClient = useSupabaseClient()

// Data
const fields = [{
  name: 'email',
  type: 'text',
  label: 'E-mail',
  placeholder: 'Digite seu e-mail',
  required: true,
}, {
  name: 'password',
  label: 'Senha',
  type: 'password',
  placeholder: 'Digite sua senha',
  required: true,
}]
const alert = ref("")

async function onSubmit(payload) {
  alert.value = ""

  try {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: payload.data.email,
      password: payload.data.password,
    })

    if (error) throw error
  
    navigateTo('/')
  } catch (error) {
    alert.value = getErrorMessage(error)
  }
}
</script>