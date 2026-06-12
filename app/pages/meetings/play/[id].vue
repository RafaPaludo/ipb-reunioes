<template>
  <UDashboardPanel id="meeting-play">
    <template #header>
      <UDashboardNavbar title="Andamento da reunião">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="w-full max-w-screen-2xl mx-auto">
        <div class="mb-4" v-if="!loading">
          <h3 class="text-lg font-bold">{{ meeting.title }}</h3>
          <p class="my-2" >
            {{ meeting.date }} •
            {{ meeting.start_time }} / {{ meeting.end_time }} •
            <span v-if="meeting.meeting_type === 'presencial'">{{ meeting.location }}</span>
            <div v-else class="inline-block">
              <UButton
                :to="meeting.meeting_url"
                variant="link"
                target="_blank"
              >{{ meeting.meeting_url }}</UButton>
            </div>
          </p>
        </div>
        
        <!-- Agendas -->

        <div class="mx-auto grid gap-6 lg:grid-cols-3">
          <section class="col-span-2">
            <!-- TODO: NO FUTURO FAZER UM FORMULÁRIO PARA EDITAR AS INFOS BÁSICAS DA REUNIÃO -->
            <!-- <UCard>
              Titulo
              Inicio
              Fim
              Localização

            </UCard> -->

            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-lg font-semibold">Pautas</h2>
                <p class="text-sm text-muted-foreground">{{ agendas.length }} pautas · 0 encaminhamentos</p>
              </div>

              <UButton label="Nova Pauta" icon="i-lucide-plus"/>
            </div>

            <UAccordion type="multiple" :items="agendas">
              <template #content="{ item }">
                <UPageCard variant="subtle">
                  <!-- Descrição da Pauta -->
                  <div>
                    <span>Descrição</span>
  
                    <UTextarea
                      v-model="item.content"
                      class="w-full my-2"
                      autoresize
                      placeholder="Use este campo para registrar os principais pontos discutidos"
                      :disabled="!canEdit"
                    />
                    
                    <UButton
                      @click="saveAgendaContent(item.content, item.id)"
                    >
                      Salvar
                    </UButton>
                  </div>

                  <USeparator />

                  <!-- Lista de encaminhamentos -->
                  <span>
                    Encaminhamentos ({{ item.agendaPoints.length }})
                  </span>

                  <MeetingsPlayAgendaPointItem
                    v-for="agendaPoint in item.agendaPoints"
                    :key="agendaPoint.id"
                    :agendaPoint="agendaPoint"
                    :participants="participants"
                    :disabled="!canEdit"
                  />
                  
                  <MeetingsPlayAgendaPointAdd
                    :agenda="item"
                    :meetingId="route.params.id"
                    :participants="participants"
                    :disabled="!canEdit"
                    @update:agendas="(agendaPoint) => addAgendaPointIntoAgenda(agendaPoint, item)"
                  />
                </UPageCard>
              </template>
            </UAccordion>
          </section>

          <aside>
            <UCard variant="subtle">
              <template #header>
                <UIcon name="i-lucide-calendar" />
                Controle
              </template>

              <div class="flex flex-col items-center gap-2">
                <div>00:00:00</div>
                <div>
                  Tempo decorrido
                </div>
              </div>

              <div class="mt-6 flex flex-col gap-2">
                <UButton
                  v-if="meetingInitialized"
                  color="primary"
                  icon="i-lucide-play"
                  block
                  @click="startMeeting"
                >Iniciar a Reunião</UButton>

                <UButton
                  v-if="meetingInProgress"
                  color="primary"
                  icon="material-symbols:check-circle"
                  block
                  @click="finishMeeting"
                >Finalizar Reunião</UButton>

                <UButton
                  v-if="meetingFinished"
                  color="neutral"
                  icon="material-symbols:restart-alt"
                  variant="subtle"
                  block
                  @click="startMeeting"
                >Reabrir Reunião</UButton>

                <UButton
                  v-if="meetingFinished"
                  color="primary"
                  icon="i-tabler-file-type-pdf"
                  block
                  @click="generateMeetingPDF"
                >Gerar PDF</UButton>
              </div>
            </UCard>
          </aside>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup>
const route = useRoute()
const toast = useToast()

const loading = ref(true)
const agendas = ref([])
const participants = ref([])
const meeting = ref({
  title: '',
  date: '',
  start_time: '',
  end_time: '',
  location: '',
  meeting_url: '',
  meeting_type: '',
  attachment_url: '',
  meeting_status: 'scheduled',
})

const editPermission = Object.freeze({
  scheduled: false,
  in_progress: true,
  paused: true,
  finished: false,
})

const meetingInitialized = computed(() => meeting.value.meeting_status === 'scheduled')
const meetingInProgress = computed(() => meeting.value.meeting_status === 'in_progress')
const meetingFinished = computed(() => meeting.value.meeting_status === 'finished')
const canEdit = computed(() => editPermission[meeting.value.meeting_status])

async function getMeetingWithAgenda() {
  loading.value = true
  
  try {
    const data = await $fetch(`/api/meetings/${route.params.id}`, {
      params: { include: 'agendas,participants' }
    })

    // Popula as informações da reunião
    meeting.value.title = data.title || ''
    meeting.value.date = convertTimeStampzToLocalDate(data.start_time) || null
    meeting.value.start_time = convertTimestampToTimeStringWithTZ(data.start_time) || ''
    meeting.value.end_time = convertTimestampToTimeStringWithTZ(data.end_time) || ''
    meeting.value.location = data.location || ''
    meeting.value.meeting_url = data.meeting_url || ''
    meeting.value.meeting_type = data.meeting_type || ''
    meeting.value.attachment_url = data.attachment_url || ''
    meeting.value.meeting_status = data.meeting_status || 'scheduled'
    
    // Popula os participantes contatos + user
    participants.value = data.meeting_participants

    // Popula as agendas no formato esperado pelo accordion
    if (data.meeting_agendas && data.meeting_agendas.length > 0) {
      agendas.value = data.meeting_agendas.map((agenda, idx) => {
        return {
          id: agenda.id || '',
          label:  agenda.title || '',
          icon: 'material-symbols:counter-' + (idx + 1) + '-outline',
          content: agenda.content || '',
          agendaPoints: agenda.agenda_points || []
        }
      })
    }
  } catch (err) {
    console.error(err)
    alert('Erro ao buscar dados da reunião')
  } finally {
    loading.value = false
  }
}

async function startMeeting () {
  try {
    await $fetch(`/api/meetings/${route.params.id}/status`, {
      method: 'PATCH',
      body: { meeting_status: 'in_progress' }
    })
    
    await getMeetingWithAgenda()

    toast.add({ title: 'Sucesso', description: `Reunião iniciada`, color: 'success' })
  } catch (error) {
    console.error(error)
    alert('Erro ao iniciar a reunião.')
  }
}

async function finishMeeting() {
  try {
    await $fetch(`/api/meetings/${route.params.id}/status`, {
      method: 'PATCH',
      body: { meeting_status: 'finished' }
    })
    
    await getMeetingWithAgenda()

    toast.add({ title: 'Sucesso', description: `Reunião finalizada`, color: 'success' })
  } catch (error) {
    console.error(error)
    alert('Erro ao finalizar a reunião.')
  }
}

async function saveAgendaContent (content, agendaId) {
  try {
    await $fetch(`/api/agendas/${agendaId}`, {
      method: "PATCH",
      body: {
        content: content,
        meeting_id: route.params.id,
      }
    })

    toast.add({ title: 'Sucesso', description: `Pauta atualizada`, color: 'success' })
  } catch (error) {
    console.error(error)
    alert('Erro ao salvar o conteúdo da pauta.')
  }
}

async function generateMeetingPDF () {
  try {
    const pdfUrl = await $fetch(`/api/meetings/${route.params.id}/pdf`, {
      method: 'GET'
    })
    
    if (pdfUrl) {
      window.open(pdfUrl, '_blank')
    }

    toast.add({ title: 'Sucesso', description: `PDF gerado com sucesso.`, color: 'success' })
  } catch (error) {
    console.error(error)
    alert('Erro ao gerar o PDF da reunião.')
  }
}

function addAgendaPointIntoAgenda (agendaPoint, item) {
  const modifiedAgenda = agendas.value.find(agenda => agenda.id === item.id)
  modifiedAgenda.agendaPoints.push(agendaPoint)
}

onMounted(async () => {
  await getMeetingWithAgenda()
})
</script>