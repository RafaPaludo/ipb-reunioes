<script setup>

defineProps(['error'])

useSeoMeta({
  title: 'Página não encontrada',
  description: 'Desculpe, mas a página não foi encontrada.'
})

useHead({
  htmlAttrs: {
    lang: 'pt-br'
  }
})
</script>

<template>
  <UApp>
    <UError :error="error" />
  </UApp>
</template>
