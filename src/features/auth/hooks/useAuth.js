import { useState, useEffect } from 'react'

const LOCAL_STORAGE_KEY = 'myapp_local_auth'
const FIXED_USERNAME = 'Ankan'
const FIXED_PASSWORD = 'Goal'
const FIXED_USER = {
  id: 'local-ankan',
  email: 'ankan@example.com',
  user_metadata: { full_name: FIXED_USERNAME },
}

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      if (parsed?.isAuthed) {
        setUser(FIXED_USER)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = async () => ({ data: null, error: { message: 'Sign up disabled' } })

  const signIn = async (_usernameOrEmail, password) => {
    if (password === FIXED_PASSWORD) {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ isAuthed: true }))
      setUser(FIXED_USER)
      return { data: { user: FIXED_USER }, error: null }
    }
    return { data: null, error: { message: 'Invalid password' } }
  }

  const signOut = async () => {
    try {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY)
      setUser(null)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const resetPassword = async (email) => {
    return { data: null, error: { message: 'Password reset disabled' } }
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }
}
