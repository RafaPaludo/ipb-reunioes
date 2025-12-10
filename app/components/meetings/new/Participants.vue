<template>
  <UForm :state="formState" @submit="onSubmit" class="space-y-4">
    <!-- Campo de adicionar participante -->
    <UFormField
      name="participant"
      label="Adicionar participantes"
      required
      class="flex flex-col max-sm:flex-col justify-between gap-4"
      :ui="{ container: 'flex items-center gap-2' }"
    >
      <USelectMenu
        v-model="selectedParticipants"
        v-model:search-term="searchTerm"
        :items="contacts"
        :searchInput="{ placeholder: 'Procurar...', variant: 'none' }"
        icon="i-lucide-search"
        multiple
        option-attribute="name"
        value-attribute="id"
        placeholder="Digite para buscar contatos..."
        class="w-full"
      >
        <template #item-label="{ item }">
          {{ item.name }}

          <span class="text-muted pl-1">
            {{ unFormatPhoneNumber(item.phone) }}
          </span>
        </template>
      </USelectMenu>
    </UFormField>

    <!-- Lista de participantes -->
    <div v-if="selectedParticipants.length" class="space-y-2">
      <ul role="list" class="divide-y divide-default">
        <li
          v-for="(p, i) in selectedParticipants"
          :key="i"
          class="flex items-center justify-between gap-3 py-3 px-4"
        >
          <div class="flex gap-3">
            <div>{{ p.name }}</div>
            <div class="text-muted">{{ p.email }}</div>
            <div class="text-muted">{{ unFormatPhoneNumber(p.phone) }}</div>
          </div>
          <UButton
            color="error"
            type="button"
            size="md"
            variant="soft"
            icon="i-lucide-trash"
            @click="removeParticipant(i)"
          />
        </li>
      </ul>
    </div>

    <!-- Botão de salvar/avançar -->
    <div class="flex justify-between pt-4 mt-10">
      <UButton type="submit" icon="i-lucide-arrow-left" @click="emit('previous')">
        Anterior
      </UButton>

      <UButton type="submit" trailing-icon="i-lucide-arrow-right">
        Salvar e continuar
      </UButton>
    </div>
  </UForm>
</template>

<script setup>
const toast = useToast()
const emit = defineEmits(['completed', 'previous'])

// Estado do formulário
const formState = reactive({})

// Lista de participantes adicionados
// Estado com os contatos escolhidos
const selectedParticipants = defineModel({ default: [] })
const contacts = ref([]) // guarda os objetos, não só ids
const searchTerm = ref('')

// Remover participante
function removeParticipant(index) {
  selectedParticipants.value.splice(index, 1)
}

// Submeter step
function onSubmit() {
  if (!selectedParticipants.value.length) {
    toast.add({
      title: 'Ops!',
      description: 'Adicione pelo menos um participante',
      color: 'error',
      icon: 'i-lucide-triangle-alert'
    })
    return
  }

  emit('completed', [...selectedParticipants.value])
}

async function getContacts() {
  const data = await $fetch('/api/contacts')

  return contacts.value = data
}

onMounted(() => {
  getContacts()
})
</script>
