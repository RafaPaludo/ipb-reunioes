<template>
  <UModal v-model:open="open" title="Novo contato" description="Adicione um novo contato à base de dados">
    <UButton label="Novo contato" icon="i-lucide-plus" />

    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Nome" name="name">
          <UInput v-model="state.name" placeholder="Nome completo" class="w-full" />
        </UFormField>
        <UFormField label="E-mail" name="email">
          <UInput v-model="state.email" placeholder="nome@exemplo.com" class="w-full" />
        </UFormField>
        <UFormField label="Telefone" placeholder="(00) 0 0000-0000" name="phone">
          <SMInputPhone v-model="state.phone" class="w-full" />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancelar"
            color="neutral"
            variant="subtle"
            @click="open = false"
          />
          <UButton
            :loading="loading"
            label="Adicionar"
            color="primary"
            variant="solid"
            type="submit"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup>
import * as z from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Poucos caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().regex(/^\d{11}$/, 'O telefone deve ter 11 dígitos'),
})
const open = ref(false)
const loading = ref(false)

const state = reactive({
  name: undefined,
  email: undefined,
  phone: undefined
})

const toast = useToast()

async function onSubmit(event) {
  try {
    loading.value = true

    const { error } = await $fetch('/api/contacts', {
      method: 'POST',
      body: {
        name: event.data.name,
        email: event.data.email,
        phone: formatPhoneNumber(event.data.phone)
      }
    })

    if (error) throw error

    toast.add({ title: 'Sucesso', description: `Novo contato ${event.data.name} cadastrado`, color: 'success' })
    
    state.name = ''
    state.email = ''
    state.phone = ''
  } catch (err) {
    console.error(err)
    alert('Erro ao cadastrar um novo contato')
  } finally {
    loading.value = false
  }
}
</script>