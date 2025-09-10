import React from 'react'

export const SettingsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage your application preferences and account settings.
                </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Application Settings</h2>
                <p className="text-gray-600">Settings management features coming soon...</p>
            </div>
        </div>
    )
}
