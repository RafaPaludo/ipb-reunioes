<template>
  <UForm
    v-if="userProfile"
    id="settings"
    :schema="profileSchema"
    :state="profile"
    @submit="onSubmit"
  >
    <UPageCard
      title="Perfil"
      description="Atualize suas informações."
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton
        form="settings"
        label="Salvar alterações"
        type="submit"
        class="w-fit lg:ms-auto"
      />
    </UPageCard>

    <UPageCard variant="subtle">
      <UFormField
        name="name"
        label="Nome"
        description="Nome completo"
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.name"
          autocomplete="off"
          class="w-90"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="email"
        label="Email"
        description="Seu e-mail"
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.email"
          type="email"
          autocomplete="off"
          class="w-90"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="phone"
        label="Telefone"
        description="Telefone"
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <SMInputPhone
          v-model="profile.phone"
          name="phone"
          label="Telefone"
          required
          autocomplete="off"
          class="w-90"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="avatar"
        label="Avatar"
        description="JPG, GIF or PNG. 1MB no Máximo"
        class="flex max-sm:flex-col justify-between sm:items-center gap-4"
      >
        <div class="flex flex-wrap items-center gap-3">
          <UAvatar
            :src="profile.avatar"
            :alt="profile.name"
            size="lg"
          />
          <UButton
            label="Escolher"
            color="neutral"
            @click="onFileClick"
          />
          <input
            ref="fileRef"
            type="file"
            class="hidden"
            accept=".jpg, .jpeg, .png, .gif"
            @change="onFileChange"
          >
        </div>
      </UFormField>
      <USeparator />
      <UFormField
        name="bio"
        label="Bio"
        description="Breve descrição do perfil. Links e informações relevantes"
        class="flex max-sm:flex-col justify-between items-start gap-4"

      >
        <UTextarea
          v-model="profile.bio"
          :rows="5"
          autoresize
          class="w-90"
        />
      </UFormField>
    </UPageCard>
  </UForm>
</template>

<script setup>
import { profileSchema } from '~/schemas/profile.schema'

// Hooks
const { userProfile, fetchUserProfile } = useUserProfile()
const toast = useToast()
const supabaseClient = useSupabaseClient()
const { getErrorMessage } = useErrorMessages()

// Data
const alert = ref("")
const fileRef = ref()
const profile = reactive({
  name: userProfile.value?.name || '',
  email: userProfile.value?.email || '',
  phone: unFormatPhoneNumber(userProfile.value?.phone || ''),
  avatar: userProfile.value?.avatar_url || undefined,
  bio: userProfile.value?.bio || undefined
})

async function onSubmit(event) {
  try {
    const { error: updatedUserError } = await supabaseClient.auth.updateUser({
      email: event.data.email
    })

    if (updatedUserError) throw updatedUserError

    const { error } = await supabaseClient
      .from('users')
      .update({
        name: event.data.name,
        phone: formatPhoneNumber(event.data.phone),
        avatar: event.data.avatar,
        bio: event.data.bio,
      })
      .eq('id', userProfile.value?.id)

    if (error) throw error

    await fetchUserProfile()
  } catch (error) {
    alert.value = getErrorMessage(error)
  }

  toast.add({
    title: 'Sucesso',
    description: 'Informações de usuário alteradas com sucesso.',
    icon: 'i-lucide-check',
    color: 'success'
  })
}

function onFileChange(event) {
  const input = event.target

  if (!input.files?.length) {
    return
  }

  profile.avatar = URL.createObjectURL(input.files[0])
}

function onFileClick() {
  fileRef.value?.click()
}
</script>