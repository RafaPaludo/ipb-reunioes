<template>
  <UInput
    v-model="inputValue"
    type="tel"
    autocomplete="tel"
    placeholder="(99) 9 9999-9999"
    class="w-full"
    :maxlength="MASK.length"
    @input="onInput"
    @keydown="onKeydown"
  />
</template>

<script setup>
const props = defineProps({
  modelValue: String | undefined, // pai recebe só dígitos
  name: String,
  label: String,
  required: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const MASK = '(xx) x xxxx-xxxx'
const DIGITS_MAX = 11

function applyMask(digits) {
  if (!digits) return ''
  let masked = MASK
  for (const d of digits) {
    masked = masked.replace('x', d)
  }
  const cut = masked.indexOf('x')
  return cut !== -1 ? masked.slice(0, cut).trimEnd() : masked
}

function toDigits(value) {
  return (value || '').replace(/\D/g, '').slice(0, DIGITS_MAX)
}

const inputValue = ref('')

console.log(inputValue)

watch(
  () => props.modelValue,
  (val = '') => {
    const digits = toDigits(val)
    inputValue.value = applyMask(digits)
  },
  { immediate: true }
)

function onInput(event) {
  const target = event.target
  if (!target) return

  const digits = toDigits(target.value)
  inputValue.value = applyMask(digits)
  emit('update:modelValue', digits)
}

// Bloqueia letras e outros símbolos já no keydown
function onKeydown(event) {
  // Permitir teclas de controle
  const allowedKeys = [
    'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'
  ]

  if (
    allowedKeys.includes(event.key) ||
    (event.ctrlKey || event.metaKey) // copiar, colar, etc
  ) {
    return
  }

  // Só aceita números
  if (!/^[0-9]$/.test(event.key)) {
    event.preventDefault()
  }
}
</script>
