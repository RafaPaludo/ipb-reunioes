<script setup>
import { AuthError } from '@supabase/supabase-js';

defineProps({
  collapsed: Boolean
})

const colorMode = useColorMode()
const appConfig = useAppConfig()
const { userProfile } = useUserProfile()

const router = useRouter();
const user = useSupabaseUser();
const supabaseClient = useSupabaseClient();

const colors = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']
const neutrals = ['slate', 'gray', 'zinc', 'neutral', 'stone']

const userLoggedName = computed(() => userProfile.value?.name || "")

const logout = async () => {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    router.push('/login');
  } catch (error) {
    if (error instanceof AuthError) {
      console.warn(error)
    } else if (error instanceof TypeError) {
      console.warn("Aconteceu algum erro!");
    }
  }
}

const items = computed(() => ([[{
  type: 'label',
  label: userLoggedName.value,
}], [{
  label: 'Pagamento',
  icon: 'i-lucide-credit-card'
}, {
  label: 'Configurações',
  icon: 'i-lucide-settings',
  to: '/settings'
}], [{
  label: 'Tema',
  icon: 'i-lucide-palette',
  children: [{
    label: 'Primário',
    slot: 'chip',
    chip: appConfig.ui.colors.primary,
    content: {
      align: 'center',
      collisionPadding: 16
    },
    children: colors.map(color => ({
      label: color,
      chip: color,
      slot: 'chip',
      checked: appConfig.ui.colors.primary === color,
      type: 'checkbox',
      onSelect: (e) => {
        e.preventDefault()

        appConfig.ui.colors.primary = color
      }
    }))
  }, {
    label: 'Neutro',
    slot: 'chip',
    chip: appConfig.ui.colors.neutral === 'neutral' ? 'old-neutral' : appConfig.ui.colors.neutral,
    content: {
      align: 'end',
      collisionPadding: 16
    },
    children: neutrals.map(color => ({
      label: color,
      chip: color === 'neutral' ? 'old-neutral' : color,
      slot: 'chip',
      type: 'checkbox',
      checked: appConfig.ui.colors.neutral === color,
      onSelect: (e) => {
        e.preventDefault()

        appConfig.ui.colors.neutral = color
      }
    }))
  }]
}, {
  label: 'Aparência',
  icon: 'i-lucide-sun-moon',
  children: [{
    label: 'Light',
    icon: 'i-lucide-sun',
    type: 'checkbox',
    checked: colorMode.value === 'light',
    onSelect(e) {
      e.preventDefault()

      colorMode.preference = 'light'
    }
  }, {
    label: 'Dark',
    icon: 'i-lucide-moon',
    type: 'checkbox',
    checked: colorMode.value === 'dark',
    onUpdateChecked(checked) {
      if (checked) {
        colorMode.preference = 'dark'
      }
    },
    onSelect(e) {
      e.preventDefault()
    }
  }]
}], [{
  label: 'Documentação',
  icon: 'i-lucide-book-open',
  to: 'https://ui.nuxt.com/getting-started/installation/pro/nuxt',
  target: '_blank'
}, {
  label: 'Repositório do Github',
  icon: 'i-simple-icons-github',
  to: 'https://github.com/nuxt-ui-pro/dashboard',
  target: '_blank'
}, {
  label: 'Assine a versão Pro',
  icon: 'i-lucide-rocket',
  to: 'https://ui.nuxt.com/pro/purchase',
  target: '_blank'
}], [{
  label: 'Sair',
  icon: 'i-lucide-log-out',
  onSelect: async (e) => {
    e.preventDefault()
    await logout();
  }
}]]))
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : userLoggedName,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed'
      }"
    />

    <template #chip-leading="{ item }">
      <span
        :style="{
          '--chip-light': `var(--color-${(item).chip}-500)`,
          '--chip-dark': `var(--color-${(item).chip}-400)`
        }"
        class="ms-0.5 size-2 rounded-full bg-(--chip-light) dark:bg-(--chip-dark)"
      />
    </template>
  </UDropdownMenu>
</template>
