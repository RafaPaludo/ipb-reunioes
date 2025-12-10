export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const { userProfile, fetchUserProfile } = useUserProfile()
  
  const publicPages = ['/login', '/register', '/reset-password', '/new-password']

  if (!user.value && !publicPages.includes(to.path)) {
    return navigateTo('/login')
  }

  // Só busca caso ainda não tenha perfil carregado
  if (!userProfile.value && user.value) {
    await fetchUserProfile()
  }
})
