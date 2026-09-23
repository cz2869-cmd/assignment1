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
                <p className="subtitle">a list of my favorite cafes around campus</p>

                <div className="tableContainer">
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cafe Name</th>
                        </tr>
                        </thead>

                        <tbody>
                        {cafes.map((cafe) => (
                            <tr key={cafe.id}>
                                <td>{cafe.id}</td>
                                <td>{cafe.name}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    )
}