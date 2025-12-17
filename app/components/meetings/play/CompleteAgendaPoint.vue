<template>
  <UCheckbox
    :defaultValue="isResolved"
    @update:modelValue="changeAgendaPointStatus(currentAgendaPoint.status)"
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

const currentAgendaPoint = ref(props.agendaPoint)

const isResolved = computed(() => currentAgendaPoint.value.status === 'resolved')

const statusConfig = Object.freeze({
  pending: 'resolved',
  resolved: 'pending',
})

async function changeAgendaPointStatus (status) {
  currentAgendaPoint.value.status = statusConfig[status]

  await updateAgendaPoint(currentAgendaPoint.value)
}


async function updateAgendaPoint (agendaPoint) {
  try {
    await $fetch(`/api/agenda-points/${agendaPoint.id}`, {
      method: "PATCH",
      body: {
        status: currentAgendaPoint.value.status,
      }
    })
  } catch (error) {
    console.error(error)
    alert('Erro ao salvar o encaminhamento.')
  }
}
</script>