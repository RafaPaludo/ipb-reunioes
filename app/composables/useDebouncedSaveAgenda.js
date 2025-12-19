/**
 * 
  Cria um debounce, após um determinado tempo a função é executada ou pode ser cancelada manualmente.
  Útil para salvar automaticamente as ações do usuário sem sobrecarregar o banco.

  @param callback - Função a ser executada
  @param delay - Tempo que deve ser aguardado até executar a função novamente.
  @returns {object.debouncedFn} - Função para executar o debounce
  @returns {object.cancel} - Função para cancelar o debounce
*/
export function useDebounce(callback, delay = 500) {
  let timeout = null

  const debouncedFn = (...args) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => callback(...args), delay)
  }

  const cancel = () => {
    if (timeout) clearTimeout(timeout)
  }

  return { debouncedFn, cancel }
}
