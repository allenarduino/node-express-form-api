import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../../lib/api'

// Zod validation schema
const profileSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must be less than 100 characters'),
    bio: z
        .string()
        .max(500, 'Bio must be less than 500 characters')
        .optional(),
    avatarUrl: z
        .string()
        .url('Please enter a valid URL')
        .optional()
        .or(z.literal('')),
    website: z
        .string()
        .url('Please enter a valid URL')
        .optional()
        .or(z.literal('')),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface UserProfile {
    id: string
    email: string
    profile?: {
        name?: string
        bio?: string
        avatarUrl?: string
        website?: string
    }
}

export const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitSuccess, setSubmitSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: '',
            bio: '',
            avatarUrl: '',
            website: '',
        },
    })

    // Fetch user profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true)
                const response = await api.get('/user/me')
                const userData = response.data

                setUser(userData)

                // Populate form with existing data
                setValue('name', userData.profile?.name || '')
                setValue('bio', userData.profile?.bio || '')
                setValue('avatarUrl', userData.profile?.avatarUrl || '')
                setValue('website', userData.profile?.website || '')
            } catch (error: any) {
                console.error('Failed to fetch profile:', error)
                setSubmitError(
                    error?.response?.data?.message ||
                    'Failed to load profile. Please try again.'
                )
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfile()
    }, [setValue])

    const onSubmit = async (data: ProfileFormData) => {
        setIsSubmitting(true)
        setSubmitError(null)
        setSubmitSuccess(false)

        try {
            // Clean up empty strings to null for optional fields
            const profileData = {
                name: data.name,
                bio: data.bio || null,
                avatarUrl: data.avatarUrl || null,
                website: data.website || null,
            }

            await api.put('/user/me', profileData)

            setSubmitSuccess(true)

            // Hide success message after 3 seconds
            setTimeout(() => {
                setSubmitSuccess(false)
            }, 3000)

        } catch (error: any) {
            setSubmitError(
                error?.response?.data?.message ||
                error?.message ||
                'Failed to update profile. Please try again.'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your account settings and profile information.
                    </p>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage your account settings and profile information.
                </p>
            </div>

            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Update your personal information and preferences.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-6">
                    {/* Success message */}
                    {submitSuccess && (
                        <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-green-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-800">
                                        Profile updated successfully!
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error message */}
                    {submitError && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-red-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800">{submitError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Email (read-only) */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={user?.email || ''}
                            disabled
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Email address cannot be changed
                        </p>
                    </div>

                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name *
                        </label>
                        <input
                            {...register('name')}
                            type="text"
                            id="name"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Enter your full name"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Bio */}
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                            Bio
                        </label>
                        <textarea
                            {...register('bio')}
                            id="bio"
                            rows={4}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Tell us about yourself..."
                        />
                        {errors.bio && (
                            <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Maximum 500 characters
                        </p>
                    </div>

                    {/* Avatar URL */}
                    <div>
                        <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700">
                            Avatar URL
                        </label>
                        <input
                            {...register('avatarUrl')}
                            type="url"
                            id="avatarUrl"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="https://example.com/avatar.jpg"
                        />
                        {errors.avatarUrl && (
                            <p className="mt-1 text-sm text-red-600">{errors.avatarUrl.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            URL to your profile picture
                        </p>
                    </div>

                    {/* Website */}
                    <div>
                        <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                            Website
                        </label>
                        <input
                            {...register('website')}
                            type="url"
                            id="website"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="https://yourwebsite.com"
                        />
                        {errors.website && (
                            <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Your personal or professional website
                        </p>
                    </div>

                    {/* Submit button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Updating...
                                </>
                            ) : (
                                'Update Profile'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
