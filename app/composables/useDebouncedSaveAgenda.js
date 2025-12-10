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
