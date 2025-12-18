<template>
  <ul class="px-6">
    <UCard
      v-for="meeting in props.meetings"
      :key="meeting.id"
      variant="subtle"
      class="rounded min-w-100 mb-5"
    >
      <template #header>
        <div>
          Reunião:<strong class="ml-1">{{ meeting.title }}</strong>
        </div>
  
        <div>
          Hora:
          <span class="ml-1">
            {{ timeFormatter.format(new Date(meeting.start_time)) }}
          </span>
        </div>
  
        <div>
          Local:
          <span>{{ meeting.location }}</span>
        </div>
      </template>

      <div>
        <UButton
          variant="subtle"
          class="mb-3"
          block
          :to="`/meetings/edit/${meeting.id}`"
        >
          Editar reunião
          <UIcon
            name="i-lucide-square-pen"
            class="size-6 text-center"
          />
        </UButton>
      </div>

      <div>
        <UButton
          variant="solid"
          block
          :to="`/meetings/play/${meeting.id}`"
        >
          Ir para a reunião
          <UIcon
            name="i-lucide-square-play"
            class="size-6 text-center"
          />
        </UButton>
      </div>
    </UCard>
  </ul>
</template>

<script setup>
const props = defineProps({
  meetings: Array
})

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit'
})
</script>