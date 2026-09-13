import { createContext, useContext, useState, type ReactNode } from 'react'

interface LocalUser {
  id: string
  email: string
}

interface AuthContextValue {
  session: { user: LocalUser } | null
  user: LocalUser | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ user: LocalUser } | null>(() => {
    try {
      const user = JSON.parse(localStorage.getItem('ochag_user_v1') ?? 'null') as LocalUser | null
      return user ? { user } : null
    } catch {
      return null
    }
  })
  const [loading] = useState(false)

  const signUp: AuthContextValue['signUp'] = async (email, password, fullName, phone) => {
    void password
    void fullName
    void phone
    const user = { id: `user-${email}`, email }
    localStorage.setItem('ochag_user_v1', JSON.stringify(user))
    setSession({ user })
    return { error: null }
  }

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    void password
    const user = { id: `user-${email}`, email }
    localStorage.setItem('ochag_user_v1', JSON.stringify(user))
    setSession({ user })
    return { error: null }
  }

  const signOut = async () => {
    localStorage.removeItem('ochag_user_v1')
    setSession(null)
  }

  const resetPassword: AuthContextValue['resetPassword'] = async (email) => {
    void email
    return { error: null }
  }

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, loading, signUp, signIn, signOut, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
