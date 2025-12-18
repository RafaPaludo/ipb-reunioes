<template>
  <div>
    <UForm
      v-if="isEditing"
      :schema="schema"
      :state="formState"
      @submit="($event) => createAgendaPoint($event, props.agenda)"
    >
      <UFormField name="agendaPoint">
        <UTextarea
          v-model="formState.agendaPoint"
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
            v-model="formState.assigned"
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
              {{ formState.dueDate ? df.format(formState.dueDate.toDate(getLocalTimeZone())) : 'Selecione a data' }}
            </UButton>
    
            <template #content>
              <UCalendar v-model="formState.dueDate" class="p-2"  />
            </template>
          </UPopover>
        </UFormField>
      </div>
  
      <div class="flex gap-2">
        <UButton type="submit">Adicionar</UButton>
        <UButton variant="outline" @click="resetAgendaPointForm">Cancelar</UButton>
      </div>
    </UForm>
  
    <UButton
      v-else
      color="primary"
      variant="soft"
      icon="i-lucide-plus"
      :disabled="disabled"
      @click="isEditing = true"
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
  },
  disabled: {
    type: Boolean,
    default: true
  },
})
const emit = defineEmits(['update:agendas'])

const df = new DateFormatter('pt-BR', { dateStyle: 'medium' })

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

const isEditing = ref(false)
const formState = reactive({
  agendaPoint: '',
  assigned: undefined,
  dueDate: undefined,
})

async function createAgendaPoint ({ data }, agenda) {
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

    resetAgendaPointForm()
    isEditing.value = false
  } catch (error) {
    console.error(error)
    alert('Erro ao salvar o encaminhamento.')
  }
}

function resetAgendaPointForm () {
  isEditing.value = false

  formState.agendaPoint = ''
  formState.assigned = undefined
  formState.dueDate = undefined
}
</script>