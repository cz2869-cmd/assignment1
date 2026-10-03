import { createClient } from '@/lib/server'
import AuthButton from './auth-button'

export default async function Home() {
    const supabase = await createClient()
    const { data: cafes, error } = await supabase
        .from('cafe')
        .select('*')

    if (error) {
        return (
            <main className="page">
                <div className="container">
                    <h1>Student-Favorite Cafes Around Campus</h1>
                    <p>Error loading cafes: {error.message}</p>
                </div>
            </main>
        )
    }

    return (
        <main className="page">
            <div className="container">
                <h1>Student-Favorite Cafes Around Campus</h1>
                <p className="subtitle">
                    a list of some student favorite cafes around campus, perfect for your next coffee!
                </p>
                <AuthButton />

                <div className="cafeList">
                    {cafes.map((cafe) => (
                        <div className="cafeCard" key={cafe.id}>
                            <div className="cafeInfo">
                                <h2>{cafe.name}</h2>
                                <p className="rating">
                                    ★ {cafe.rating}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}