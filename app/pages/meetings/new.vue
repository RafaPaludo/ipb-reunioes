<template>
  <UDashboardPanel id="new-meeting">
    <template #header>
      <UDashboardNavbar title="Nova reunião">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="w-full max-w-3xl mx-auto">
        <UPageCard variant="subtle">
          <UStepper ref="stepper" :items="items" :ui="{ content: 'mt-10' }" disabled>
            <template #basicInfo>
              <MeetingsNewBasicInfo
                :meeting="meeting"
                @completed="onBasicInfoCompleted"
              />
            </template>

            <template #participants>
              <MeetingsNewParticipants
                v-model="participants"
                @previous="goPrevious"
                @completed="onParticipantsCompleted"
              />
            </template>

            <template #review>
              <MeetingsNewReview
                :meeting="meeting"
                :participants="participants"
                @previous="goPrevious"
                @created="feedbackCreatedMeeting"
              />
            </template>
          </UStepper>
        </UPageCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup>
const toast = useToast()

const items = [
  {
    slot: 'basicInfo',
    title: 'Passo 1',
    description: 'Informações básicas',
    icon: 'i-lucide-notebook-pen'
  },{
    slot: 'participants',
    title: 'Passo 2',
    description: 'Participantes',
    icon: 'i-lucide-users'
  }, {
    slot: 'review',
    title: 'Passo 3',
    description: 'Revisão e confirmação',
    icon: 'i-lucide-circle-check-big'
  }
]

const stepper = useTemplateRef('stepper')

const initialMeeting = {
  title: 'Diretoria',
  date: null,
  start_time: '02:00',
  end_time: '15:00',
  location: 'Centro',
  meeting_url: '',
  meeting_type: 'presencial',
  agendas: [{ title: 'Pagamento' }, { title: 'Candidatura 2026' }],
}

const meeting = reactive({ ...initialMeeting })

const participants = ref([])

function onBasicInfoCompleted(data) {
  Object.assign(meeting, data) // salva no estado central
  stepper.value?.next()
}

function onParticipantsCompleted(data) {
  participants.value = [...data] // substitui mantendo reatividade
  stepper.value?.next()
}

function goPrevious() { stepper.value?.prev ? stepper.value.prev() : '' }

function feedbackCreatedMeeting () {
  toast.add({
    title: 'Reunião criada com sucesso!',
    color: 'success',
    icon: 'i-lucide-badge-check'
  })

  Object.assign(meeting, initialMeeting)
  Object.assign(participants, [])
  meeting.agendas = []

  goPrevious()
  goPrevious()
}
</script>
