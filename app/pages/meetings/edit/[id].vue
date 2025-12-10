<template>
  <UDashboardPanel id="meeting-edit">
    <template #header>
      <UDashboardNavbar title="Editar reunião">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            variant="solid"
            block
            :to="`/meetings/play/${route.params.id}`"
          >
            Iniciar reunião
            <UIcon
              name="i-lucide-square-play"
              class="size-6 text-center"
            />
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="w-full max-w-3xl mx-auto">
        <UPageCard variant="subtle">
          <MeetingsEditBasicInfo
            v-model="meeting"
          />

          <MeetingsEditParticipants
            v-model="participants"
          />
        </UPageCard>

        <div class="flex gap-4">
          <UButton to="/" size="xl" block class="mt-4" variant="soft">Cancelar</UButton>
          <UButton @click="saveEditMeeting" size="xl" block class="mt-4">Salvar</UButton>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup>
const route = useRoute()
const toast = useToast()

const loading = ref(true)
const participants = ref([])
const meeting = ref({
  title: '',
  date: null,
  start_time: '',
  end_time: '',
  location: '',
  meeting_url: '',
  meeting_type: '',
  attachment_url: '',
  agendas: [],
})

async function getMeettingWithParticipantAndAgenda() {
  loading.value = true
  
  try {
    const data = await $fetch(`/api/meetings/${route.params.id}`)

    meeting.value.title = data.title || ''
    meeting.value.date = toUCalendarDate(data.start_time) || null
    meeting.value.start_time = convertTimestampToTimeStringWithTZ(data.start_time) || ''
    meeting.value.end_time = convertTimestampToTimeStringWithTZ(data.end_time) || ''
    meeting.value.location = data.location || ''
    meeting.value.meeting_url = data.meeting_url || ''
    meeting.value.meeting_type = data.meeting_type || ''
    meeting.value.attachment_url = data.attachment_url || ''
    meeting.value.agendas = data.meeting_agendas || []
    participants.value = data.meeting_participants || []
  } catch (err) {
    console.error(err)
    alert('Erro ao buscar a reunião')
  } finally {
    loading.value = false
  }
}

async function saveEditMeeting () {
  try {
    loading.value = true

    const { error } = await $fetch(`/api/meetings/${route.params.id}`, {
      method: 'PUT',
      body: {
        meeting: {
          title: meeting.value.title,
          date: meeting.value.date,
          start_time: meeting.value.start_time,
          end_time: meeting.value.end_time,
          location: meeting.value.location,
          meeting_url: meeting.value.meeting_url,
          meeting_type: meeting.value.meeting_type,
          attachment_url: meeting.value.attachment_url,
          agendas: meeting.value.agendas,
        },
        participants: participants.value
      }
    })

    if (error) throw error

    await getMeettingWithParticipantAndAgenda()

    feedbackCreatedMeeting()
  } catch (err) {
    console.error(err)
    alert('Erro ao criar a reunião')
  } finally {
    loading.value = false
  }
}

function feedbackCreatedMeeting () {
  toast.add({
    title: 'Reunião alterada com sucesso!',
    color: 'success',
    icon: 'i-lucide-badge-check'
  })
}

onMounted(async () => {
  await getMeettingWithParticipantAndAgenda()
})
</script>