<template>
  <UDashboardPanel
    id="home"
    :default-size="25"
    :min-size="20"
    :max-size="30"
    resizable
  >
    <!-- Navbar -->
    <UDashboardNavbar title="Início" class="pr-3">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
    </UDashboardNavbar>

    <!-- Calendário -->
    <UCalendar
      v-model="selectedDate"
      size="lg"
      locale="pt-BR"
      weekdayFormat="short"
      class="p-6"
      :year-controls="false"
      @update:placeholder="handleMonthChange"
      @update:model-value="openSidebarMobile()"
    >
      <template #day="{ day }">
        <div class="relative flex items-center justify-center">
          <span>{{ day.day }}</span>
          <span
            v-if="hasMeetingInThisDay(day)"
            class="absolute bottom-0 w-2 h-2 bg-primary-500 rounded-full"
          />
        </div>
      </template>
    </UCalendar>

    <div v-if="loading">Carregando ...</div>
  </UDashboardPanel>

  <!-- Lista desktop -->
  <div v-if="selectedDate" class="mt-4">
    <h3 class="font-semibold text-2xl mb-4 px-6">
      Reuniões em {{ selectedDate.day }}/{{ selectedDate.month }}/{{ selectedDate.year }}
    </h3>
    <HomeMeetingList :meetings="meetingsForSelectedDay" />
  </div>
  <div v-else class="hidden lg:flex flex-1 items-center justify-center">
    <UIcon name="i-lucide-inbox" class="size-32 text-dimmed" />
  </div>

  <!-- Lista mobile -->
  <ClientOnly>
    <USlideover v-if="isMobile" v-model:open="isSidebarMobileOpen">
      <template #content>
        <UButton @click="isSidebarMobileOpen = false" class="m-4">
          <UIcon
            name="i-lucide-arrow-left"
            class="size-6 text-center"
          />
          Voltar
        </UButton>
        <div v-if="selectedDate">
          <h3 class="font-semibold mb-2 px-4">
            Reuniões em {{ selectedDate.day }}/{{ selectedDate.month }}/{{ selectedDate.year }}
          </h3>
          <HomeMeetingList :meetings="meetingsForSelectedDay" />
        </div>
      </template>
    </USlideover>
  </ClientOnly>
</template>

<script setup>
import { isSameDay, getLocalTimeZone, CalendarDate, today, startOfMonth, endOfMonth, toCalendarDateTime, toZoned, Time } from '@internationalized/date'
import { breakpointsTailwind } from '@vueuse/core'

/* --- Responsividade --- */
const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('lg')

/* --- Estado --- */
const currentDate = today(getLocalTimeZone())
const currentMonth = ref(currentDate.month)
const currentYear = ref(currentDate.year)
const selectedDate = ref(currentDate)
const isSidebarMobileOpen = ref(false)
const loading = ref(true)

/* --- Dados (mock) --- */
const meetings = ref([])

/* --- Helpers --- */
function toCalendarDate(iso) {
  const d = new Date(iso)
  return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

const meetingDays = computed(() =>
  meetings.value.map(m => ({ ...m, day: toCalendarDate(m.start_time) }))
)

function hasMeetingInThisDay(day) {
  return meetingDays.value.some(meeting => isSameDay(meeting.day, day))
}

const meetingsForSelectedDay = computed(() => {
  if (!selectedDate.value) return []
  return meetingDays.value.filter(m => isSameDay(m.day, selectedDate.value))
})

function openSidebarMobile(close = false) {
  if (close) {
    isSidebarMobileOpen.value = false
    return
  }
  if (meetingsForSelectedDay.value.length) {
    isSidebarMobileOpen.value = true
  }
}

/**
 * Evento disparado quando o usuário muda o mês
 */
function handleMonthChange(newDate) {
  if (!newDate || currentMonth.value === newDate.month) return

  currentMonth.value = newDate.month
  currentYear.value = newDate.year
  fetchMeetings(newDate.year, newDate.month)
}

/**
 * Busca reuniões dentro de um range baseado no mês e ano
 */
async function fetchMeetings(year, month) {
  loading.value = true
  
  const thisMonth = new CalendarDate(year, month, 1);
  const start = startOfMonth(thisMonth)
  const end = endOfMonth(thisMonth).add({ months: 2 })
  const tz = 'America/Sao_Paulo'

  const startUTC = toZoned(toCalendarDateTime(start, new Time(0, 0)), tz).toDate().toISOString()
  const endUTC = toZoned(toCalendarDateTime(end, new Time(23, 59)), tz).toDate().toISOString()

  try {
    const data = await $fetch('/api/meetings', {
      method: "GET",
      params: {
        startUTC,
        endUTC
      }
    })

    meetings.value = data
  } catch (err) {
    console.error('Erro ao carregar reuniões:', err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  fetchMeetings(currentYear.value, currentMonth.value)
})
</script>
