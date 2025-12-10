<template>
  <div class="space-y-6">
    <!-- Card com informações -->
    <UCard>
      <h3 class="text-lg font-semibold mb-2">📋 Informações da reunião</h3>
      <div class="space-y-2">
        <p><strong>Título:</strong> {{ meeting.title }}</p>
        <p><strong>Data:</strong> {{ meeting.date }}</p>
        <p><strong>Hora início:</strong> {{ meeting.start_time }}</p>
        <p><strong>Hora fim:</strong> {{ meeting.end_time }}</p>
        <p class="capitalize"><strong>Modalidade:</strong> {{ meeting.meeting_type }}</p>
        <p v-if="meeting.location"><strong>Local:</strong> {{ meeting.location }}</p>
        <p v-if="meeting.meeting_url"><strong>Link da reunião:</strong> {{ meeting.meeting_url }}</p>
        <p>
          <strong>Pautas:</strong>
          <ul v-for="agenda in meeting.agendas" :key="agenda.title" class="list-disc pl-6 space-y-1">
            <li>{{ agenda.title }}</li>
          </ul>
        </p>
      </div>
    </UCard>

    <UCard>
      <h3 class="text-lg font-semibold mb-2">👥 Participantes</h3>
      <ul class="list-disc pl-6 space-y-1">
        <li v-for="(p, i) in participants" :key="i">
          <div class="flex gap-3">
            <div>{{ p.name }}</div>
            <div class="text-muted">{{ p.email }}</div>
            <div class="text-muted">{{ unFormatPhoneNumber(p.phone) }}</div>
          </div>
        </li>
      </ul>
    </UCard>

    <!-- Botões -->
    <div class="flex justify-between">
      <UButton type="submit" icon="i-lucide-arrow-left" @click="emit('previous')">
        Anterior
      </UButton>

      <UButton :loading="loading" @click="confirmMeeting" trailing-icon="i-lucide-circle-check-big">
        Confirmar e criar
      </UButton>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['created', 'previous'])


const props = defineProps({
  meeting: Object,
  participants: Array
})

const loading = ref(false)
const authUser = useSupabaseUser()

async function confirmMeeting() {
  try {
    loading.value = true

    const { error } = await $fetch('/api/meetings', {
      method: 'POST',
      body: {
        title: props.meeting.title,
        date: props.meeting.date,
        start_time: props.meeting.start_time,
        end_time: props.meeting.end_time,
        location: props.meeting.location,
        meeting_type: props.meeting.meeting_type,
        meeting_url: props.meeting.meeting_url,
        created_by: authUser.value?.id,
        agendas: props.meeting.agendas,
        participants: props.participants
      }
    })

    if (error) throw error

    emit('created')
  } catch (err) {
    console.error(err)
    alert('Erro ao criar a reunião')
  } finally {
    loading.value = false
  }
}
</script>
