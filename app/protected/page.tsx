import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    return (
        <main className="page">
            <div className="container">
                <h1>Protected Page</h1>
                <p>You are signed in as:</p>
                <p>{user.email}</p>
            </div>
        </main>
    )
}