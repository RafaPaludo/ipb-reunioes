export async function insertReminders(reminders, supabase) {
  const { error } = await supabase
    .from('reminders')
    .insert(reminders)

  if (error) throw error
}
