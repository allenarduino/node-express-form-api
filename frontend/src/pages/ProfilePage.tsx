import React from 'react'

export const ProfilePage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage your account settings and profile information.
                </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
                <p className="text-gray-600">Profile management features coming soon...</p>
            </div>
        </div>
    )
}
