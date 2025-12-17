<template>
  <div>
    <UForm
      v-if="isEditting"
      :schema="schema"
      :state="state"
      @submit="($event) => addAgendaPoint($event, props.agenda)"
    >
      <UFormField name="agendaPoint">
        <UTextarea
          v-model="state.agendaPoint"
          placeholder="Adicionar encaminhamento"
          class="w-full"
          :rows="1"
          autoresize
          autofocus
        />
      </UFormField>
  
      <div class="mt-3 mb-5 flex items-center gap-6">
        <UFormField
          name="assigned"
          label="Responsável"
          required
          class="flex max-sm:flex-col justify-between items-center gap-4"
          :ui="{ container: 'flex-1',  }"
        >
          <USelectMenu
            v-model="state.assigned"
            :items="props.participants"
            value-key="id"
            size="lg"
            class="min-w-50"
          >
            <template #item-label="{ item }">
              {{ item.name }}
    
              <span class="text-muted pl-1">
                {{ unFormatPhoneNumber(item.phone) }}
              </span>
            </template>
    
            <template #default="{ modelValue }">
              {{ props.participants.find(contact => contact.id === modelValue)?.name || 'Selecione um responsável' }}
            </template>
          </USelectMenu>
        </UFormField>

        <UFormField
          name="dueDate"
          label="Data"
          required
          class="flex max-sm:flex-col justify-between items-center gap-4"
          :ui="{ container: 'flex-1' }"
        >
          <UPopover>
            <UButton variant="subtle" icon="i-lucide-calendar" size="lg">
              {{ state.dueDate ? df.format(state.dueDate.toDate(getLocalTimeZone())) : 'Selecione a data' }}
            </UButton>
    
            <template #content>
              <UCalendar v-model="state.dueDate" class="p-2"  />
            </template>
          </UPopover>
        </UFormField>
      </div>
  
      <div class="flex gap-2">
        <UButton type="submit">Adicionar</UButton>
        <UButton variant="outline" @click="resetForwardingForm">Cancelar</UButton>
      </div>
    </UForm>
  
    <UButton
      v-else
      color="primary"
      variant="soft"
      icon="i-lucide-plus"
      @click="isEditting = true"
    >
      Adicionar encaminhamento
    </UButton>
  </div>
</template>

<script setup>
import * as z from 'zod'
import { DateFormatter, getLocalTimeZone } from '@internationalized/date'

const props = defineProps({
  agenda: {
    type: Object,
    default: null,
  },
  participants: {
    type: Array,
    required: true,
  }
})

const emit = defineEmits(['update:agendas'])

const df = new DateFormatter('pt-BR', { dateStyle: 'medium' })

const isEditting = ref(false)
const schema = z.object({
  agendaPoint: z.string('Encaminhamento necessário').min(2, 'Precisa ter ao menos 2 letras'),
  assigned: z.union([z.number('Campo necessário'), z.string('Campo necessário')]),
  dueDate: z.object({
    calendar: z.object({
      identifier: z.string()
    }),
    era: z.string(),
    day: z.number(),
    month: z.number(),
    year: z.number(),
  }),
})
const state = reactive({
  agendaPoint: '',
  assigned: undefined,
  dueDate: undefined,
})

async function addAgendaPoint ({ data }, agenda) {
  try {
    const agendaPointCreated = await $fetch(`/api/agenda-points`, {
      method: "POST",
      body: {
        agenda_id: agenda.id,
        content: data.agendaPoint,
        participant_id: data.assigned,
        status: 'pending',
        order_index: 0,
        due_date: convertUCalendarToTimeStampZ(data.dueDate),
      }
    })

    emit('update:agendas', agendaPointCreated)
    isEditting.value = false
  } catch (error) {
    console.error(error)
    alert('Erro ao salvar o encaminhamento.')
  }
}

function resetForwardingForm () {
  isEditting.value = false

  state.agendaPoint = ''
  state.assigned = undefined
  state.dueDate = undefined
}
</script>