import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('access')
    return token ? { token } : null
  })

  // On mount, if we have a token, fetch full profile to get avatar etc.
  useEffect(() => {
    if (localStorage.getItem('access') && !user?.avatar) {
      api.get('/users/me/').then(res => {
        setUser(prev => ({ ...prev, ...res.data }))
      }).catch(() => {})
    }
  }, [])

  const login = async (username, password) => {
    const res = await api.post('/auth/token/', { username, password })
    localStorage.setItem('access', res.data.access)
    localStorage.setItem('refresh', res.data.refresh)
    // Fetch full profile after login
    const profile = await api.get('/users/me/')
    setUser(profile.data)
  }

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setUser(null)
  }

  const refreshUser = async () => {
    const res = await api.get('/users/me/')
    setUser(res.data)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
