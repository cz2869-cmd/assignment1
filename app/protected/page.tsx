import SiteHeader from '@/app/components/site-header'
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
                <SiteHeader />
                <h1>Signed in</h1>
                <p className="subtitle">You are signed in as {user.email}.</p>
            </div>
        </main>
    )
}
