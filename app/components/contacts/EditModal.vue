<template>
  <UModal v-model:open="open" title="Editar contato" description="Edite o contato selecionado">
    <template #body>
      <UForm
        v-if="props.contact"
        :schema="schema"
        :state="props.contact"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Nome" name="name">
          <UInput v-model="props.contact.name" placeholder="Nome completo" class="w-full" />
        </UFormField>
        <UFormField label="E-mail" name="email">
          <UInput v-model="props.contact.email" placeholder="nome@exemplo.com" class="w-full" />
        </UFormField>
        <UFormField label="Telefone" placeholder="(00) 0 0000-0000" name="phone">
          <SMInputPhone v-model="props.contact.phone" class="w-full" />
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
            label="Atualizar"
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

const props = defineProps({
  contact: Object,
  openModal: Boolean
})

const emit = defineEmits(['update:openModal'])
const open = ref(false)
const loading = ref(false)

const toast = useToast()

async function onSubmit(event) {
  try {
    loading.value = true

    const { error } = await $fetch(`/api/contacts/${props.contact.id}`, {
      method: 'PATCH',
      body: {
        name: event.data.name,
        email: event.data.email,
        phone: formatPhoneNumber(event.data.phone)
      }
    })

    if (error) throw error

    toast.add({ title: 'Sucesso', description: `Contato ${event.data.name} atualizado com sucesso`, color: 'success' })
    open.value = false
  } catch (err) {
    console.error(err)
    alert('Erro ao editar o contato')
  } finally {
    loading.value = false
  }
}

watch(
  () => props.openModal,
  (val) => {
    open.value = val // quando o pai muda a prop, abre/fecha o modal
  }
)

watch(open, (val) => {
  if (val !== props.openModal) {
    emit('update:openModal', val)
  }
})
</script>