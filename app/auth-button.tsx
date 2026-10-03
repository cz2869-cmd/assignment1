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
    }

    if (email) {
        return (
            <div>
                <p>Signed in as {email}</p>

                <a href="/profile">
                    Profile
                </a>

                <a href="/protected">
                    Protected Page
                </a>

                <button onClick={handleLogout}>
                    Sign Out
                </button>
            </div>
        )
    }
    return (
        <button onClick={handleLogin}>
            Sign in with Google
        </button>
    )
}