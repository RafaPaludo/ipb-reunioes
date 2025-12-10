<template>
  <UForm :state="meetingState" @submit="onSubmitBasicInfo" class="space-y-4">
    <!-- Título -->
    <UFormField
      name="title"
      label="Título da reunião"
      required
      class="flex max-sm:flex-col justify-between items-center gap-4"
      :ui="{ container: 'flex-1', label: 'min-w-35' }"
    >
      <UInput v-model="meetingState.title" autocomplete="off" class="w-full" />
    </UFormField>
    <USeparator />

    <!-- Data -->
    <UFormField
      name="date"
      label="Data da reunião"
      required
      class="flex max-sm:flex-col justify-between items-center gap-4"
      :ui="{ container: 'flex-1', label: 'min-w-30' }"
    > 
      <template #hint>
        <UTooltip text="Necessário marcar com ao menos 5 dias de antecedência" :ui="{ content: '' }">
          <UIcon name="i-lucide-badge-alert" class="size-5" />
        </UTooltip>
      </template>
      <UPopover>
        <UButton color="primary" variant="subtle" icon="i-lucide-calendar" class="w-full">
          {{ meetingState.date ? df.format(meetingState.date.toDate(getLocalTimeZone())) : 'Selecione uma data' }}
        </UButton>

        <template #content>
          <UCalendar
            v-model="meetingState.date"
            :is-date-unavailable="isDateUnavailable"
            :year-controls="false"
            class="p-2"
          />
        </template>
      </UPopover>
    </UFormField>
    <USeparator />

    <!-- Hora início -->
    <UFormField
      name="start_time"
      label="Hora de início"
      required
      class="flex max-sm:flex-col justify-between items-center gap-4"
      :ui="{ container: 'flex-1', label: 'min-w-35' }"
    >
      <UInput v-model="meetingState.start_time" type="time" autocomplete="off" class="w-full" />
    </UFormField>
    <USeparator />

    <!-- Hora fim -->
    <UFormField
      name="end_time"
      label="Hora de fim"
      required
      class="flex max-sm:flex-col justify-between items-center gap-4"
      :ui="{ container: 'flex-1', label: 'min-w-35' }"
    >
      <UInput v-model="meetingState.end_time" type="time" autocomplete="off" class="w-full" />
    </UFormField>
    <USeparator />

    <!-- Modalidade -->
    <UFormField
      name="location_type"
      label="Modalidade"
      required
      class="flex max-sm:flex-col justify-between items-center gap-4"
      :ui="{ container: 'flex-1', label: 'min-w-35' }"
    >
      <URadioGroup
        v-model="meetingState.meeting_type"
        indicator="end"
        variant="card"
        default-value="presencial"
        orientation="horizontal"
        class="capitalize"
        :items="localTypes"
      />
    </UFormField>
    
    <!-- Local -->
    <UFormField
      v-if="meetingState.meeting_type === 'presencial'"
      name="location"
      label="Local"
      required
      class="flex max-sm:flex-col justify-between items-center gap-4"
      :ui="{ container: 'flex-1', label: 'min-w-35' }"
    >
      <UInput v-model="meetingState.location" autocomplete="off" class="w-full" />
    </UFormField>

    <UFormField
      v-else
      name="meeting_url"
      label="Link da reunião"
      required
      class="flex max-sm:flex-col justify-between items-center gap-4"
      :ui="{ container: 'flex-1', label: 'min-w-35' }"
    >
      <UInput v-model="meetingState.meeting_url" autocomplete="off" class="w-full" />
    </UFormField>
    <USeparator />

    <!-- Pautas -->
    <div>
      <label class="block text-sm font-medium">Pautas</label>
      <div class="space-y-2 mt-2">
        <div
          v-for="(agenda, index) in meetingState.agendas"
          :key="index"
          class="flex items-center gap-2"
        >
          <UInput
            v-model="agenda.title"
            placeholder="Título da pauta"
            class="flex-1"
            autocomplete="off"
          />
          <UButton
            color="error"
            variant="soft"
            icon="i-lucide-trash"
            @click="removeAgenda(index)"
          />
        </div>
      </div>

      <UButton
        class="mt-3"
        color="primary"
        variant="soft"
        icon="i-lucide-plus"
        @click="addAgenda"
      >
        Adicionar pauta
      </UButton>
    </div>
    <USeparator />

    <!-- Botão de salvar/avançar -->
    <div class="flex justify-end mt-10">
      <UButton type="submit" trailing-icon="i-lucide-arrow-right">
        Salvar e continuar
      </UButton>
    </div>
  </UForm>
</template>

<script setup>
import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date'

const toast = useToast()

const df = new DateFormatter('pt-BR', { dateStyle: 'medium' })

const emit = defineEmits(['completed'])

const props = defineProps({
  meeting: Object
})

const localTypes = ref(['presencial', 'online'])

const isValidLocal = computed(() => {
  switch (meetingState.meeting_type) {
    case 'presencial':
      return Boolean(meetingState.location)

    case 'online':
      return Boolean(meetingState.meeting_url)
  
    default:
      return false
  }
})

// Estado reativo inicial
const meetingState = reactive({
  title: props.meeting.title ?? '',
  date: props.meeting.date ?? today(getLocalTimeZone()),
  start_time: props.meeting.start_time ?? '',
  end_time: props.meeting.end_time ?? '',
  location: props.meeting.location ?? '',
  meeting_url: props.meeting.meeting_url ?? '',
  meeting_type: props.meeting.meeting_type ?? 'presencial',
  agendas: props.meeting.agendas ?? [] // array de pautas
})

// Bloqueia de datas < hoje + 5 dias
function isDateUnavailable (date) {
  const currentDate = today(getLocalTimeZone())
  const minDate = currentDate.add({ days: 5})

  // Bloqueia se a data for menor que "hoje + 5 dias"
  return date.compare(minDate) < 0
}

// Métodos para gerenciar pautas
function addAgenda() {
  meetingState.agendas.push({ title: '' })
}

function removeAgenda(index) {
  meetingState.agendas.splice(index, 1)
}

// Reseta o valor do lugar, caso seja presencial não precisa ter meeting_url.
// Caso seja online não precisa ter location.
function resetLocalTypeSelection() {
  if (meetingState.meeting_type === 'online') {
    meetingState.location = ''
  } else {
    meetingState.meeting_url = ''
  }
}

function onSubmitBasicInfo() {
  if (
    !meetingState.title ||
    !meetingState.date ||
    !meetingState.start_time ||
    !meetingState.end_time ||
    meetingState.agendas.length === 0 ||
    meetingState.agendas.some(a => !a.title.trim()) ||
    !isValidLocal.value
  ) {
    toast.add({
      title: 'Ops!',
      description: 'Preencha todos os campos obrigatórios e adicione pelo menos uma pauta',
      color: 'error',
      icon: 'i-lucide-triangle-alert'
    })
    return
  }

  resetLocalTypeSelection()

  emit('completed', { ...meetingState })
}
</script>
