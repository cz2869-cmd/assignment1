'use client'

import { createClient } from '@/lib/client'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')

    useEffect(() => {
        const loadProfile = async () => {
            const supabase = createClient()

            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                window.location.href = '/'
                return
            }

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('first_name, last_name, avatar_url')
                .eq('id', user.id)
                .single()

            if (error) {
                console.error('Error loading profile:', error)
            } else if (profile) {
                setFirstName(profile.first_name ?? '')
                setLastName(profile.last_name ?? '')
                setAvatarUrl(profile.avatar_url ?? '')
            }

            setLoading(false)
        }

        loadProfile()
    }, [])

    const handleAvatarUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0]

        if (!file) {
            return
        }

        const supabase = createClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            window.location.href = '/'
            return
        }

        setMessage('Uploading photo...')

        const fileExtension = file.name.split('.').pop()
        const filePath = `${user.id}.${fileExtension}`

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                upsert: true,
            })

        if (uploadError) {
            console.error('Error uploading avatar:', uploadError)
            setMessage(`Error uploading photo: ${uploadError.message}`)
            return
        }

        const {
            data: { publicUrl },
        } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                avatar_url: publicUrl,
            })
            .eq('id', user.id)

        if (updateError) {
            console.error('Error saving avatar URL:', updateError)
            setMessage(`Error saving photo: ${updateError.message}`)
            return
        }

        setAvatarUrl(publicUrl)
        setMessage('Photo uploaded!')
    }

    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault()

        setSaving(true)
        setMessage('')

        const supabase = createClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            window.location.href = '/'
            return
        }

        const { error } = await supabase
            .from('profiles')
            .update({
                first_name: firstName,
                last_name: lastName,
            })
            .eq('id', user.id)

        if (error) {
            console.error('Error updating profile:', error.message)
            setMessage(`Error: ${error.message}`)
        } else {
            setMessage('Profile saved!')
            window.location.href = '/'
        }

        setSaving(false)
    }

    if (loading) {
        return (
            <main className="page">
                <div className="container">
                    <p>Loading profile...</p>
                </div>
            </main>
        )
    }

    return (
        <main className="page">
            <div className="container">
                <h1>Profile</h1>

                {avatarUrl && (
                    <div>
                        <img
                            src={avatarUrl}
                            alt="Profile"
                            width={150}
                            height={150}
                        />
                    </div>
                )}

                <div>
                    <label htmlFor="avatar">
                        Profile Photo
                    </label>

                    <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                    />
                </div>

                <form onSubmit={handleSave}>
                    <div>
                        <label htmlFor="firstName">
                            First Name
                        </label>

                        <input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(event) =>
                                setFirstName(event.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label htmlFor="lastName">
                            Last Name
                        </label>

                        <input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(event) =>
                                setLastName(event.target.value)
                            }
                        />
                    </div>

                    <button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>

                {message && <p>{message}</p>}

                <a href="/">
                    Back to Cafes
                </a>
            </div>
        </main>
    )
}