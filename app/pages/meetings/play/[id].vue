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
      <div class="w-full mx-auto">
        <div class="mb-4">
          <h3 class="text-lg font-bold">{{ meeting.title }}</h3>
          <p class="my-2">
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
          <UButton @click="() => {}">FInalizar Reunião</UButton>
        </div>
        
        <!-- Agendas -->
        <UAccordion type="multiple" :items="agendas">
          <template #content="{ item }">
            <UPageCard variant="soft">
              <div class="flex gap-2 items-center">
                <UIcon name="i-lucide-lightbulb" />
                <span>Resumo</span>
              </div>

              <UTextarea
                v-model="item.content"
                class="w-full ml-6"
                autoresize
                placeholder="Síntise da pauta"
                @update:model-value="saveAgendaContentDebounced($event, item.id)"
              />

              <!-- Lista de encaminhamentos -->
              <div class="flex gap-2 items-center mt-4">
                <UIcon name="i-lucide-lightbulb" />
                <span>
                  Encaminhamentos
                </span>
              </div>
              <div class="ml-6">
                <div  v-if="item.edit">
                  <UTextarea placeholder="Adicionar encaminhamento" class="w-full" />
                  <div class="my-4">
                    Atribuir: <UInput placeholder="Atribuir ..." />
                    Data de entrega: <UInput placeholder="Data entrega" />
                  </div>
                  <div class="flex gap-2">
                    <UButton>Adicionar</UButton>
                    <UButton variant="outline" @click="() => item.edit = false">Cancelar</UButton>
                  </div>
                </div>

                <UButton
                  v-else
                  color="primary"
                  variant="soft"
                  icon="i-lucide-plus"
                  @click="() => item.edit = true"
                >
                  Adicionar encaminhamento
                </UButton>
              </div>
            </UPageCard>
          </template>
        </UAccordion>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup>
const route = useRoute()

const loading = ref(true)

const agendas = ref([])

const meeting = ref({
  title: 'Título da reunião',
  date: '20/12/2025',
  start_time: '9:00',
  end_time: '10:00',
  location: 'Centro',
  meeting_url: '',
  meeting_type: 'presencial',
  attachment_url: '',
})

async function getMeetingWithAgenda() {
  loading.value = true
  
  try {
    const data = await $fetch(`/api/meetings/${route.params.id}`, {
      params: { include: 'agendas' }
    })

    // Popula as informações da reunião
    meeting.value.title = data.title || ''
    meeting.value.date = toUCalendarDate(data.start_time) || null
    meeting.value.start_time = convertTimestampToTimeStringWithTZ(data.start_time) || ''
    meeting.value.end_time = convertTimestampToTimeStringWithTZ(data.end_time) || ''
    meeting.value.location = data.location || ''
    meeting.value.meeting_url = data.meeting_url || ''
    meeting.value.meeting_type = data.meeting_type || ''
    meeting.value.attachment_url = data.attachment_url || ''

    debugger

    // Popula as agendas no formato esperado pelo accordion
    if (data.meeting_agendas && data.meeting_agendas.length > 0) {
      agendas.value = data.meeting_agendas.map(agenda => {
        return {
          id: agenda.id || '',
          label: agenda.title || '',
          content: agenda.content || '',
          agendaPoints: agenda.agenda_points || [],
          edit: false
        }
      })
    }
  } catch (err) {
    console.error(err)
    alert('Erro ao buscar a reunião')
  } finally {
    loading.value = false
  }
}

async function saveAgendaContent (content, agendaId) {
  await $fetch(`/api/agendas/${agendaId}`, {
    method: "PATCH",
    body: {
      content: content,
      meeting_id: route.params.id,
    }
  })
}

const { debouncedFn: saveAgendaContentDebounced } = useDebounce(saveAgendaContent, 5000)

onMounted(async () => {
  await getMeetingWithAgenda()
})
</script>