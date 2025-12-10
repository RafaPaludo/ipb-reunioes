export interface ParticipantWithPhones {
  id: string
  contact_id: string | null
  user_id: string | null
  contacts?: { phone: string | null }
  users?: { phone: string | null }
}

export interface MeetingAgenda {
  title: string
}

export interface MeetingWithAgendas {
  id?: string
  title: string
  meeting_type: 'online' | 'presencial'
  location?: string
  meeting_url?: string
  start_time: string
  meeting_agendas: MeetingAgenda[]
}

export interface Reminder {
  id: string;
  meeeting_id: string;
  remind_at: string;
  reminder_type: string;
  reminder_stage: 'first' | 'second' | 'third';
  reminder_status: string;
  send_at: string;
}

export interface Contacts {
  email: string;
  id: number;
  name: string;
  phone: string;
}