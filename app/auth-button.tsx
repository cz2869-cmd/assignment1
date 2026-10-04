'use client'

import { createClient } from '@/lib/client'
import { useEffect, useState } from 'react'

export default function AuthButton() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })
  }, [])

  const handleLogin = async () => {
    const supabase = createClient()

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handleLogout = async () => {
    const supabase = createClient()

    await supabase.auth.signOut()
    setEmail(null)
    window.location.href = '/'
  }

  if (email) {
    return (
      <div className="authBar">
        <span className="authEmail">Signed in as {email}</span>
        <a className="textLink" href="/profile">
          Profile
        </a>
        <button className="ghostButton" onClick={handleLogout} type="button">
          Sign out
        </button>
      </div>
    )
  }

  return (
    <button className="primaryButton" onClick={handleLogin} type="button">
      Sign in with Google
    </button>
  )
}
