<template>
  <UForm :state="meeting" class="space-y-4">
    <!-- Título -->
    <UFormField
      name="title"
      label="Título da reunião"
      required
      class="flex max-sm:flex-col justify-between items-center gap-4"
      :ui="{ container: 'flex-1', label: 'min-w-35' }"
    >
      <UInput v-model="meeting.title" autocomplete="off" class="w-full" />
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
          {{ meeting.date ? df.format(meeting.date.toDate(getLocalTimeZone())) : 'Selecione uma data' }}
        </UButton>

        <template #content>
          <UCalendar
            v-model="meeting.date"
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
      <UInput v-model="meeting.start_time" type="time" autocomplete="off" class="w-full" />
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
      <UInput v-model="meeting.end_time" type="time" autocomplete="off" class="w-full" />
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
        v-model="meeting.meeting_type"
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
      v-if="meeting.meeting_type === 'presencial'"
      name="location"
      label="Local"
      required
      class="flex max-sm:flex-col justify-between items-center gap-4"
      :ui="{ container: 'flex-1', label: 'min-w-35' }"
    >
      <UInput v-model="meeting.location" autocomplete="off" class="w-full" />
    </UFormField>

    <UFormField
      v-else
      name="meeting_url"
      label="Link da reunião"
      required
      class="flex max-sm:flex-col justify-between items-center gap-4"
      :ui="{ container: 'flex-1', label: 'min-w-35' }"
    >
      <UInput v-model="meeting.meeting_url" autocomplete="off" class="w-full" />
    </UFormField>
    <USeparator />

    <!-- Pautas -->
    <div>
      <label class="block text-sm font-medium">Pautas</label>
      <div class="space-y-2 mt-2">
        <div
          v-for="(agenda, index) in meeting.agendas"
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
  </UForm>
</template>

<script setup>
import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date'

const df = new DateFormatter('pt-BR', { dateStyle: 'medium' })

const meeting = defineModel()

const localTypes = ref(['presencial', 'online'])

// Bloqueia de datas < hoje + 5 dias
function isDateUnavailable (date) {
  const currentDate = today(getLocalTimeZone())
  const minDate = currentDate.add({ days: 5})

  // Bloqueia se a data for menor que "hoje + 5 dias"
  return date.compare(minDate) < 0
}

// Métodos para gerenciar pautas
function addAgenda() {
  meeting.value.agendas.push({ title: '' })
}

function removeAgenda(index) {
  meeting.value.agendas.splice(index, 1)
}
</script>
