<script setup>
const state = reactive({
  email: true,
  desktop: false,
  product_updates: true,
  weekly_digest: false,
  important_updates: true
})

const sections = [{
  title: 'Canal de notificações',
  description: 'Como podemos te notificar?',
  fields: [{
    name: 'email',
    label: 'Email',
    description: 'Receba emails de conteúdos diários.'
  }, {
    name: 'desktop',
    label: 'Desktop',
    description: 'Receba notificações pelo computador.'
  }]
}, {
  title: 'Atualizações da conta',
  description: 'Receba atualizações do Sind Meets.',
  fields: [{
    name: 'weekly_digest',
    label: 'Conteúdos semanais',
    description: 'Receba conteúdos semanais.'
  }, {
    name: 'product_updates',
    label: 'Atualizações de produtos',
    description: 'Receba email mensal com novas features e atualizações.'
  }, {
    name: 'important_updates',
    label: 'Atualizações importantes',
    description: 'Receba emails sobre atualizações importantes como ajustes de segurança, correções, manutenções, etc.'
  }]
}]

async function onChange() {
  // Do something with data
  console.log(state)
}
</script>

<template>
  <div v-for="(section, index) in sections" :key="index">
    <UPageCard
      :title="section.title"
      :description="section.description"
      variant="naked"
      class="mb-4"
    />

    <UPageCard variant="subtle" :ui="{ container: 'divide-y divide-default' }">
      <UFormField
        v-for="field in section.fields"
        :key="field.name"
        :name="field.name"
        :label="field.label"
        :description="field.description"
        class="flex items-center justify-between not-last:pb-4 gap-2"
      >
        <USwitch
          v-model="state[field.name]"
          @update:model-value="onChange"
        />
      </UFormField>
    </UPageCard>
  </div>
</template>
