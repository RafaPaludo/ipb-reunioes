<script setup>
import * as z from 'zod'

const passwordSchema = z.object({
  current: z.string().min(8, 'Must be at least 8 characters'),
  new: z.string().min(8, 'Must be at least 8 characters')
})

const password = reactive({
  current: undefined,
  new: undefined
})

const validate = (state) => {
  const errors = []
  if (state.current && state.new && state.current === state.new) {
    errors.push({ name: 'new', message: 'Passwords must be different' })
  }
  return errors
}
</script>

<template>
  <UPageCard
    title="Senha"
    description="Confirme a senha atual antes de cadastrar uma nova."
    variant="subtle"
  >
    <UForm
      :schema="passwordSchema"
      :state="password"
      :validate="validate"
      class="flex flex-col gap-4 max-w-xs"
    >
      <UFormField name="current">
        <UInput
          v-model="password.current"
          type="password"
          placeholder="Senha atual"
          class="w-full"
        />
      </UFormField>

      <UFormField name="new">
        <UInput
          v-model="password.new"
          type="password"
          placeholder="Nova senha"
          class="w-full"
        />
      </UFormField>

      <UButton label="Atualizar" class="w-fit" type="submit" />
    </UForm>
  </UPageCard>

  <UPageCard
    title="Conta"
    description="Não deseja mais utilizar nossos serviços? Você pode deletar sua conta aqui. Essa ação é IRREVERSÍVEL. Toda informação da conta será deletada permanentemente."
    class="bg-gradient-to-tl from-error/10 from-5% to-default"
  >
    <template #footer>
      <UButton label="Deletar conta" color="error" />
    </template>
  </UPageCard>
</template>
