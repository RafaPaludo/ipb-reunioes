<template>
  <UModal
    v-if="props.contact"
    v-model:open="open"
    :title="`Deletar o contato ${props.contact.name}`"
    description="Você tem certeza? Essa ação não pode ser desfeita"
  >
    <template #body>
      <div class="flex justify-end gap-2">
        <UButton
          label="Cancelar"
          color="neutral"
          variant="subtle"
          @click="open = false"
        />
        <UButton
          label="Deletar"
          color="error"
          variant="solid"
          loading-auto
          @click="onSubmit"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup>

const props = defineProps({
  contact: Object,
  openModal: Boolean
})

const emit = defineEmits(['update:openModal'])

const open = ref(false)

const toast = useToast()

async function onSubmit() {
  try {
    await $fetch(`/api/contacts/${props.contact.id}`, {
      method: 'DELETE'
    })

    toast.add({
      title: 'Contato deletado',
      description: 'O contato foi deletado com sucesso.'
    })
    open.value = false
  } catch (err) {
    console.error(err)
    alert('Erro ao deletar o contato')
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