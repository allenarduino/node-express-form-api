import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useForms } from '../hooks/useForms';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

interface Form {
    id: string;
    name: string;
    description: string | null;
    endpointSlug: string;
    endpointUrl: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    submissionCount: number;
    settings?: {
        allowMultipleSubmissions: boolean;
        requireEmailNotification: boolean;
        notificationEmail?: string;
        redirectUrl?: string;
        customCss?: string;
        customJs?: string;
        spamProtection?: {
            enabled: boolean;
            honeypot: boolean;
            rateLimit: number;
        };
        webhookUrl?: string;
        webhookSecret?: string;
    };
}

interface FormStatistics {
    totalSubmissions: number;
    thisWeekSubmissions: number;
    spamRate: number;
    createdDate: string;
}

const tabs = [
    { id: 'overview', name: 'Overview', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
    { id: 'embed', name: 'Embed', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { id: 'submissions', name: 'Submissions', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'settings', name: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
];

// Helper function for formatting dates
const formatCreatedDate = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function FormDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getFormById, updateForm, deleteForm } = useForms();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [form, setForm] = useState<Form | null>(null);
    const [statistics, setStatistics] = useState<FormStatistics | null>(null);
    const [editData, setEditData] = useState({
        name: '',
        description: '',
        isActive: true,
    });
    const [statisticsLoading, setStatisticsLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Function to check if form data has changed
    const checkForChanges = () => {
        if (!form) return false;
        return (
            editData.name !== form.name ||
            editData.description !== (form.description || '') ||
            editData.isActive !== form.isActive
        );
    };

    // Update hasChanges when editData changes
    React.useEffect(() => {
        setHasChanges(checkForChanges());
    }, [editData, form]);

    // Function to fetch real form statistics
    const fetchFormStatistics = async (formId: string) => {
        try {
            setStatisticsLoading(true);
            const response = await api.get(`/api/forms/${formId}/statistics`);
            setStatistics(response.data);
        } catch (error) {
            console.error('Failed to fetch form statistics:', error);
            // Don't set any statistics if API fails
            setStatistics(null);
        } finally {
            setStatisticsLoading(false);
        }
    };


    React.useEffect(() => {
        if (id) {
            const fetchFormData = async () => {
                try {
                    // Fetch real form data
                    const formData = await getFormById(id);
                    if (formData) {
                        setForm(formData);
                        setEditData({
                            name: formData.name,
                            description: formData.description || '',
                            isActive: formData.isActive,
                        });
                        // Fetch real statistics
                        await fetchFormStatistics(id);
                    } else {
                        console.error('Form not found');
                        // Don't set any form data if not found
                    }
                } catch (error) {
                    console.error('Failed to fetch form data:', error);
                    // Don't set any form data if error occurs
                }
            };

            fetchFormData();
        }
    }, [id]);

    const generateEndpointUrl = (formId: string) => {
        return `https://localhost:4001/api/${formId}`;
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    };

    const handleEdit = () => {
        // Edit functionality moved to Settings tab
    };

    const handleSave = async () => {
        if (!form || !hasChanges) return;

        setSaving(true);
        setSaveError(null);

        try {
            const updateData = {
                name: editData.name,
                description: editData.description || null,
                isActive: editData.isActive,
            };

            const updatedForm = await updateForm(form.id, updateData);
            if (updatedForm) {
                // Update the form state with the new data
                setForm({
                    ...form,
                    name: updatedForm.name,
                    description: updatedForm.description,
                    isActive: updatedForm.isActive,
                    updatedAt: updatedForm.updatedAt
                });
                setHasChanges(false);
                setSaveError(null);
            } else {
                setSaveError('Failed to save changes. Please try again.');
            }
        } catch (error) {
            console.error('Error saving form:', error);
            setSaveError('Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditData({
            name: form?.name || '',
            description: form?.description || '',
            isActive: form?.isActive || true,
        });
        setHasChanges(false);
    };

    const handleDelete = async () => {
        if (form && window.confirm('Are you sure you want to delete this form?')) {
            const success = await deleteForm(form.id);
            if (success) {
                navigate('/dashboard/forms');
            }
        }
    };


    if (!form) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading form details...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const renderOverviewTab = () => (
        <div className="space-y-6">

            {/* Endpoint Information Card */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Endpoint Information</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint URL</label>
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={generateEndpointUrl(form.id)}
                                readOnly
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                            />
                            <button
                                onClick={() => handleCopy(generateEndpointUrl(form.id))}
                                className="ml-2 px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Form ID</label>
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={form.id}
                                readOnly
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                            />
                            <button
                                onClick={() => handleCopy(form.id)}
                                className="ml-2 px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Statistics Card */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Form Statistics</h3>
                {statisticsLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                    </div>
                ) : statistics ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {statistics.totalSubmissions || 0}
                            </div>
                            <div className="text-sm text-gray-500">Total Submissions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {statistics.thisWeekSubmissions || 0}
                            </div>
                            <div className="text-sm text-gray-500">This Week</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {statistics.spamRate ? statistics.spamRate.toFixed(1) : '0.0'}%
                            </div>
                            <div className="text-sm text-gray-500">Spam Rate</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {statistics.createdDate ? formatCreatedDate(statistics.createdDate) : 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">Created</div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Failed to load statistics</p>
                    </div>
                )}
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={handleEdit}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Form
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Form
                    </button>
                </div>
            </div>
        </div>
    );

    const renderEmbedTab = () => (
        <div className="space-y-6">
            {/* HTML Form Snippet */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">HTML Form Snippet</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm">
                        {`<form action="${generateEndpointUrl(form.id)}" method="POST">
    <input type="text" name="name" placeholder="Your Name" required>
    <input type="email" name="email" placeholder="Your Email" required>
    <textarea name="message" placeholder="Your Message" required></textarea>
    <button type="submit">Send Message</button>
</form>`}
                    </pre>
                </div>
                <button
                    onClick={() => handleCopy(`<form action="${generateEndpointUrl(form.id)}" method="POST">
    <input type="text" name="name" placeholder="Your Name" required>
    <input type="email" name="email" placeholder="Your Email" required>
    <textarea name="message" placeholder="Your Message" required></textarea>
    <button type="submit">Send Message</button>
</form>`)}
                    className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                >
                    Copy HTML Code
                </button>
            </div>

            {/* JavaScript Snippet */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">JavaScript (Async Submission)</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-blue-400 text-sm">
                        {`const form = document.getElementById('myForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    
    try {
        const response = await fetch('${generateEndpointUrl(form.id)}', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            alert('Form submitted successfully!');
            form.reset();
        }
    } catch (error) {
        alert('Error submitting form');
    }
});`}
                    </pre>
                </div>
                <button
                    onClick={() => handleCopy(`const form = document.getElementById('myForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    
    try {
        const response = await fetch('${generateEndpointUrl(form.id)}', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            alert('Form submitted successfully!');
            form.reset();
        }
    } catch (error) {
        alert('Error submitting form');
    }
});`)}
                    className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                >
                    Copy JavaScript Code
                </button>
            </div>
        </div>
    );


    const renderSubmissionsTab = () => (
        <div className="space-y-6">
            {/* Recent Submissions Preview */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Submissions</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">John Doe</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">john@example.com</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 hours ago</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        New
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Jane Smith</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">jane@example.com</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1 day ago</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        New
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderSettingsTab = () => (
        <div className="space-y-6">
            {/* Form Configuration */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Form Configuration</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Form Name</label>
                        <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={editData.isActive}
                            onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                            className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                            Form is active
                        </label>
                    </div>

                    {saveError && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800">{saveError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges || saving}
                            className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center ${hasChanges && !saving
                                ? 'bg-gray-900 text-white hover:bg-gray-800'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {saving && (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={!hasChanges || saving}
                            className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${hasChanges && !saving
                                ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                : 'border-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            {/* Endpoint Information */}
            {/* Endpoint Information Card */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Endpoint Information</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint URL</label>
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={generateEndpointUrl(form.id)}
                                readOnly
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                            />
                            <button
                                onClick={() => handleCopy(generateEndpointUrl(form.id))}
                                className="ml-2 px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Form ID</label>
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={form.id}
                                readOnly
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                            />
                            <button
                                onClick={() => handleCopy(form.id)}
                                className="ml-2 px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Email Notifications */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-900">Enable Notifications</div>
                            <div className="text-sm text-gray-500">Send email alerts when forms are submitted</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.settings?.requireEmailNotification || false}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notification Recipients</label>
                        <div className="space-y-2">
                            {form.settings?.notificationEmail ? (
                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                    <span className="text-sm text-gray-900">{form.settings.notificationEmail}</span>
                                    <button className="text-red-600 hover:text-red-800">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">No recipients configured</div>
                            )}
                            <div className="flex space-x-2">
                                <input
                                    type="email"
                                    placeholder="Add email address"
                                    defaultValue={user?.email || ''}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                                />
                                <button className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800">
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-900">Enable CAPTCHA</div>
                            <div className="text-sm text-gray-500">Add CAPTCHA verification to prevent bots</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.settings?.spamProtection?.enabled || false}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Domains (CORS)</label>
                        <input
                            type="text"
                            placeholder="example.com, app.example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                        />
                        <p className="mt-1 text-sm text-gray-500">Comma-separated list of allowed domains</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rate Limiting</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500">
                            <option value="10">10 submissions per minute</option>
                            <option value="100">100 submissions per hour</option>
                            <option value="1000">1000 submissions per day</option>
                        </select>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.726-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">Security Best Practices</h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Enable CAPTCHA for public forms</li>
                                        <li>Set appropriate rate limits based on expected traffic</li>
                                        <li>Configure CORS to restrict access to your domains only</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );



    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return renderOverviewTab();
            case 'embed':
                return renderEmbedTab();
            case 'submissions':
                return renderSubmissionsTab();
            case 'settings':
                return renderSettingsTab();
            default:
                return renderOverviewTab();
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <button
                                onClick={() => navigate('/dashboard/forms')}
                                className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Forms
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900">{form.name}</h1>
                            <p className="text-gray-600">{form.description || 'No description provided'}</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleEdit}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Form
                            </button>
                            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                                View Submissions
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                                </svg>
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                {renderTabContent()}
            </div>
        </DashboardLayout>
    );
}
