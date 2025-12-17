<template>
  <UCheckbox
    :disabled="waitingChangeResolve"
    :defaultValue="isResolved"
    @update:modelValue="toggleAgendaPointStatus(currentAgendaPoint.status)"
  />

  <span :class="{ 'line-through': isResolved }">
    {{ currentAgendaPoint.content }}
  </span>
</template>

<script setup>
const props = defineProps({
  agendaPoint: {
    type: Object,
    required: true
  }
})

// Cópia local do encaminhamento para permitir alterações otimistas na UI
const currentAgendaPoint = ref({ ...props.agendaPoint })

// Flag de loading para evitar múltiplas ações simultâneas
const waitingChangeResolve = ref(false)

// ================================

// Indica se o encaminhamento está resolvido
const isResolved = computed(() => currentAgendaPoint.value.status === 'resolved')

// ================================
// Constants / Config
// ================================
const statusTransition = Object.freeze({
  pending: 'resolved',
  resolved: 'pending',
})

// ================================
// Watchers
// ================================
// Mantém o estado local sincronizado caso o prop mude externamente
watch(
  () => props.agendaPoint,
  (newValue) => {
    currentAgendaPoint.value = { ...newValue }
  }
)

// ================================
// Actions (API)
// ================================
async function updateAgendaPointStatus () {
  waitingChangeResolve.value = true

  try {
    await $fetch(`/api/agenda-points/${currentAgendaPoint.value.id}`, {
      method: 'PATCH',
      body: {
        status: currentAgendaPoint.value.status,
      }
    })
  } catch (error) {
    console.error(error)
    alert('Erro ao salvar o encaminhamento.')
  } finally {
    waitingChangeResolve.value = false
  }
}

// ================================
// UI Handlers
// ================================
// Alterna o status do encaminhamento (pending <-> resolved)
async function toggleAgendaPointStatus () {
  const currentStatus = currentAgendaPoint.value.status
  currentAgendaPoint.value.status = statusTransition[currentStatus]

  await updateAgendaPointStatus()
}
</script>