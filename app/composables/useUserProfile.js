export const useUserProfile = () => {
  const userProfile = useState('userProfile', () => null)
  const client = useSupabaseClient()
  const authUser = useSupabaseUser()

  // Função para carregar os dados do banco
  const fetchUserProfile = async () => {
    if (!authUser.value) return null

    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', authUser.value.sub)
      .single()

    if (error) {
      console.error('Erro ao buscar perfil:', error)
      return null
    }

    if (!data) {
      console.error('Usuário não encontrado no banco')
      return navigateTo('/login')
    }

    // Junta dados do auth.user + public.users
    userProfile.value = Object.assign(data, {
      email: authUser.value.email,
      created_at: authUser.value.created_at,
      last_sign_in_at: authUser.value.last_sign_in_at,
    })

    return userProfile.value
  }

  // Exponho métodos
  return {
    userProfile,
    fetchUserProfile,
  }
}
