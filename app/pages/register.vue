<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-lg max-w-md">
      <div class="flex flex-col text-center">
        <div>
          <UIcon
            name="i-lucide-lock"
            class="iconify i-lucide:lock size-8 shrink-0 inline-block mb-2"
          />
        </div>
        <h2 class="text-xl text-pretty font-semibold text-highlighted">Registre-se</h2>
        <p class="mt-1 text-base text-pretty text-muted ">
          Já possui conta?
          <UButton variant="link" to="/login" class="p-0 hover:text-default transition-colors text-base">
            Fazer login
          </UButton>
        </p>
      </div>

      <UForm :state="formData" :schema="registerSchema" @submit="onSignUpNewUser" class="space-y-4">
        <!-- Nome -->
        <UFormField
          name="name"
          label="Nome"
          
          required
        >
          <UInput v-model="formData.name" autocomplete="off" class="w-full" placeholder="Digite seu nome" />
        </UFormField>

        <!-- Email -->
        <UFormField
          name="email"
          label="E-mail"
          required
        >
          <UInput v-model="formData.email" autocomplete="off" class="w-full" placeholder="email@exemplo.com" />
        </UFormField>

        <!-- Telefone -->
        <UFormField
          name="phone"
          label="Telefone"
          required
        >
          <SMInputPhone
            v-model="formData.phone"
            name="phone"
            label="Telefone"
            required
          />
        </UFormField>

        <!-- Senha -->
        <UFormField
          name="password"
          label="Senha"
          required
        >
          <UInput
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            :ui="{ trailing: 'pe-1' }"
            placeholder="Digite sua senha"
            autocomplete="off"
            class="w-full"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                :aria-pressed="showPassword"
                aria-controls="password"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <!-- Confirmação da senha -->
        <UFormField
          name="confirmPassword"
          label="Confirmação da senha"
          required
        >
          <UInput
            v-model="formData.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            :ui="{ trailing: 'pe-1' }"
            autocomplete="off"
            class="w-full"
            placeholder="Digite sua senha novamente"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                :icon="showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
                :aria-pressed="showConfirmPassword"
                aria-controls="password"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <!-- Botão de salvar/avançar -->
        <div class="flex justify-center mt-10">
          <UButton type="submit" block size="xl">
            Continuar
          </UButton>
        </div>
      </UForm>
    </UPageCard>
  </div>
</template>

<script setup>
import { registerSchema } from '~/schemas/auth.schema'

definePageMeta({
  layout: 'authentication'
})

// Hooks
const { getErrorMessage } = useErrorMessages()
const supabaseClient = useSupabaseClient()
const toast = useToast()

// Data
const alert = ref("")
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const formData = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

// Functions
async function onSignUpNewUser({ data }) {
  alert.value = ""

  try {
    const { data: authData, error } = await supabaseClient.auth.signUp({
      email: data.email,
      password: data.password
    })

    if (error) throw error
    if (!authData.user?.id) throw new Error('Erro ao criar usuário')

    const { error: insertError } = await supabaseClient
      .from('users')
      .insert({
        id: authData.user.id,
        name: data.name,
        phone: formatPhoneNumber(data.phone)
      })

    if (insertError) throw insertError

    toast.add({
      title: 'Cadastro realizado',
      description: 'Verifique seu e-mail para ativar sua conta.',
      color: 'success'
    })

    Object.assign(data, formData)
  } catch (error) {
    alert.value = getErrorMessage(error)
  }
}
</script>