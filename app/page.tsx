import { supabase } from '@/lib/supabase'

export default async function Home() {
    const { data: cafes, error } = await supabase
        .from('cafe')
        .select('*')

    if (error) {
        return (
            <main className="page">
                <div className="container">
                    <h1>My Favorite Cafes</h1>
                    <p>Error loading cafes: {error.message}</p>
                </div>
            </main>
        )
    }

    return (
        <main className="page">
            <div className="container">
                <h1>My Favorite Cafes</h1>
                <p className="subtitle">
                    a list of my favorite cafes around campus
                </p>

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