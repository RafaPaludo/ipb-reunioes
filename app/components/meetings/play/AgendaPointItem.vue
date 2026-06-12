<template>
  <div v-if="!isDeleted">
    <UCard
      :variant="isResolved ? 'soft' : 'subtle'"
      :ui="{ body: 'p-2 sm:p-2' }"
    >
      <div class="flex items-center gap-4">
        <UCheckbox
          :disabled="disabledActions"
          :model-value="isResolved"
          @update:modelValue="toggleAgendaPointStatus"
        />

        <span
          class="font-semibold"
          :class="{ 'line-through text-muted': isResolved }"
        >
          {{ currentAgendaPoint.content }}
        </span>

        <UButton
          label="Deletar"
          icon="i-lucide-trash"
          color="error"
          variant="ghost"
          size="xs"
          class="ml-auto"
          :disabled="disabledActions"
          @click="deleteAgendaPoint"
        />
      </div>

      <div
        class="ml-8 text-[14px] text-muted"
        :class="{ 'line-through opacity-70': isResolved }"
      >
        <div class="flex gap-6 my-1">
          <div class="flex items-center gap-1">
            <UIcon
              name="i-lucide-user"
              class="size-4"
            />
            <span>
              {{ participantAssignedToAgendaPoint.name }}
            </span>
          </div>

          <div class="flex items-center gap-1">
            <UIcon
              name="i-lucide-calendar-clock"
              class="size-4"
            />
            {{ convertTimeStampzToLocalDate(currentAgendaPoint.due_date) }}
          </div>
        </div>

        <UBadge
          class="font-bold rounded-full"
          size="sm"
          :color="isResolved ? 'warning' : 'success'"
        >
          {{ isResolved ? 'Resolvido' : 'Pendente' }}
        </UBadge>
      </div>
    </UCard>
  </div>
</template>

<script setup>
// ================================
// Imports / Composables
// ================================
const toast = useToast()

// ================================
// Props
// ================================
const props = defineProps({
  agendaPoint: {
    type: Object,
    required: true,
  },
  participants: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: true
  },
})

// ================================
// State (Local / Optimistic UI)
// ================================
// Cópia local para permitir atualizações otimistas
const currentAgendaPoint = ref({ ...props.agendaPoint })

// Controla remoção visual após delete
const isDeleted = ref(false)

// Evita múltiplas ações simultâneas
const waitingChangeResolve = ref(false)

// ================================
// Computed
// ================================
// Verifica se o encaminhamento está resolvido
const isResolved = computed(() => currentAgendaPoint.value.status === 'resolved')
const disabledActions = computed(() => props.disabled || waitingChangeResolve.value)

// Participante responsável pelo encaminhamento
const participantAssignedToAgendaPoint = computed(() => {
  return (
    props.participants.find(
      participant => participant.id === currentAgendaPoint.value?.participant_id
    ) ?? { name: 'Não atribuído' }
  )
})

// ================================
// Constants
// ================================
// Mapeia transição de status
const statusTransition = Object.freeze({
  pending: 'resolved',
  resolved: 'pending',
})

// ================================
// Watchers
// ================================
// Mantém estado local sincronizado com mudanças externas
watch(
  () => props.agendaPoint,
  (newValue) => {
    currentAgendaPoint.value = { ...newValue }
  }
)

// ================================
// API Actions
// ================================
async function updateAgendaPointStatus () {
  waitingChangeResolve.value = true

  try {
    await $fetch(`/api/agenda-points/${currentAgendaPoint.value.id}`, {
      method: 'PATCH',
      body: {
        status: currentAgendaPoint.value.status,
      },
    })
  } catch (error) {
    console.error(error)

    toast.add({
      title: 'Erro ao salvar',
      description: 'Não foi possível atualizar o status do encaminhamento.',
      color: 'error',
    })

    throw error
  } finally {
    waitingChangeResolve.value = false
  }
}

async function deleteAgendaPoint () {
  if (waitingChangeResolve.value) return

  waitingChangeResolve.value = true

  try {
    await $fetch(`/api/agenda-points/${currentAgendaPoint.value.id}`, {
      method: 'DELETE',
    })

    toast.add({
      title: 'Encaminhamento deletado',
      description: 'O encaminhamento foi removido com sucesso.',
    })

    isDeleted.value = true
  } catch (error) {
    console.error(error)

    toast.add({
      title: 'Erro ao deletar',
      description: 'Não foi possível deletar o encaminhamento.',
      color: 'error',
    })
  } finally {
    waitingChangeResolve.value = false
  }
}

// ================================
// UI Handlers
// ================================
// Alterna status (pending <-> resolved) com fallback em erro
async function toggleAgendaPointStatus () {
  if (waitingChangeResolve.value) return

  const previousStatus = currentAgendaPoint.value.status
  currentAgendaPoint.value.status = statusTransition[previousStatus]

  try {
    await updateAgendaPointStatus()
  } catch {
    // Reverte UI se a API falhar
    currentAgendaPoint.value.status = previousStatus
  }
}
</script>