'use client'

import SiteHeader from '@/app/components/site-header'
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
                    <SiteHeader />
                    <p>Loading profile...</p>
                </div>
            </main>
        )
    }

    return (
        <main className="page">
            <div className="container">
                <SiteHeader />
                <h1>Your nook</h1>
                <p className="subtitle">
                    A name and a face so the floor knows who left the note.
                </p>

                <div className="profileCard">
                    {avatarUrl && (
                        <img
                            className="avatar"
                            src={avatarUrl}
                            alt="Profile"
                            width={150}
                            height={150}
                        />
                    )}

                    <div>
                        <label htmlFor="avatar">Profile photo</label>
                        <input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                        />
                    </div>

                    <form onSubmit={handleSave} className="commentForm">
                        <div>
                            <label htmlFor="firstName">First name</label>
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
                            <label htmlFor="lastName">Last name</label>
                            <input
                                id="lastName"
                                type="text"
                                value={lastName}
                                onChange={(event) =>
                                    setLastName(event.target.value)
                                }
                            />
                        </div>

                        <button className="primaryButton" type="submit" disabled={saving}>
                            {saving ? 'Saving...' : 'Save profile'}
                        </button>
                    </form>

                    {message && <p className="inlineNote">{message}</p>}
                </div>
            </div>
        </main>
    )
}
