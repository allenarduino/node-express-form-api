import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useForms } from '../hooks/useForms';

interface Form {
    id: string;
    name: string;
    description: string | null;
    endpointSlug: string;
    isActive: boolean;
    createdAt: string;
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

const tabs = [
    { id: 'overview', name: 'Overview', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
    { id: 'embed', name: 'Embed', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { id: 'notifications', name: 'Notifications', icon: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'submissions', name: 'Submissions', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'settings', name: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { id: 'security', name: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { id: 'api', name: 'API Info', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
];

export function FormDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getFormById, updateForm, deleteForm, loading } = useForms();
    const [activeTab, setActiveTab] = useState('overview');
    const [form, setForm] = useState<Form | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        description: '',
        isActive: true,
    });

    // Mock data for demonstration
    const mockForm: Form = {
        id: id || 'abc123',
        name: 'Contact Form',
        description: 'Main contact page form for customer inquiries',
        endpointSlug: 'contact-form',
        isActive: true,
        createdAt: '2024-01-15T10:30:00Z',
        submissionCount: 127,
        settings: {
            allowMultipleSubmissions: true,
            requireEmailNotification: true,
            notificationEmail: 'admin@company.com',
            redirectUrl: 'https://company.com/thank-you',
            spamProtection: {
                enabled: true,
                honeypot: true,
                rateLimit: 10,
            },
            webhookUrl: 'https://company.com/webhook',
            webhookSecret: 'secret123',
        },
    };

    React.useEffect(() => {
        // In a real app, you'd fetch the form data here
        setForm(mockForm);
        setEditData({
            name: mockForm.name,
            description: mockForm.description || '',
            isActive: mockForm.isActive,
        });
    }, [id]);

    const generateEndpointUrl = (formId: string) => {
        return `https://localhost:4001/api/${formId}`;
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (form) {
            const updatedForm = await updateForm(form.id, editData);
            if (updatedForm) {
                setForm({ ...form, ...editData });
                setIsEditing(false);
            }
        }
    };

    const handleCancel = () => {
        setEditData({
            name: form?.name || '',
            description: form?.description || '',
            isActive: form?.isActive || true,
        });
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (form && window.confirm('Are you sure you want to delete this form?')) {
            const success = await deleteForm(form.id);
            if (success) {
                navigate('/dashboard/forms');
            }
        }
    };

    const handleToggleStatus = async () => {
        if (form) {
            const updatedForm = await updateForm(form.id, { isActive: !form.isActive });
            if (updatedForm) {
                setForm({ ...form, isActive: !form.isActive });
            }
        }
    };

    if (!form) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    const renderOverviewTab = () => (
        <div className="space-y-6">
            {/* Form Details Card */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Form Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Form Name</label>
                        <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${form.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {form.isActive ? 'Active' : 'Disabled'}
                            </span>
                            <button
                                onClick={handleToggleStatus}
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                {form.isActive ? 'Disable' : 'Enable'}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50"
                    />
                </div>
                {isEditing && (
                    <div className="mt-4 flex space-x-3">
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                        >
                            Save Changes
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{form.submissionCount}</div>
                        <div className="text-sm text-gray-500">Total Submissions</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">8</div>
                        <div className="text-sm text-gray-500">This Week</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">2.3%</div>
                        <div className="text-sm text-gray-500">Spam Rate</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">Jan 15</div>
                        <div className="text-sm text-gray-500">Created</div>
                    </div>
                </div>
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

    const renderNotificationsTab = () => (
        <div className="space-y-6">
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
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                <span className="text-sm text-gray-900">{form.settings?.notificationEmail}</span>
                                <button className="text-red-600 hover:text-red-800">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex space-x-2">
                                <input
                                    type="email"
                                    placeholder="Add email address"
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
        </div>
    );

    const renderSubmissionsTab = () => (
        <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Export Submissions</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export as CSV
                        </button>
                        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export as PDF
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500">
                            <option value="30">30 days</option>
                            <option value="60">60 days</option>
                            <option value="90">90 days</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="auto-delete"
                            className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                        />
                        <label htmlFor="auto-delete" className="ml-2 text-sm text-gray-700">
                            Auto-delete submissions after export
                        </label>
                    </div>
                </div>
            </div>

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
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Form Settings</h3>
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
                    <div className="flex space-x-3">
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                        >
                            Save Changes
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSecurityTab = () => (
        <div className="space-y-6">
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

    const renderApiTab = () => (
        <div className="space-y-6">
            {/* cURL Example */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">cURL Example</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm">
                        {`curl -X POST ${generateEndpointUrl(form.id)} \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "name=John Doe" \\
  -d "email=john@example.com" \\
  -d "message=Hello World"`}
                    </pre>
                </div>
                <button
                    onClick={() => handleCopy(`curl -X POST ${generateEndpointUrl(form.id)} \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "name=John Doe" \\
  -d "email=john@example.com" \\
  -d "message=Hello World"`)}
                    className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                >
                    Copy cURL Command
                </button>
            </div>

            {/* REST API Example */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">REST API Example</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-blue-400 text-sm">
                        {`fetch('${generateEndpointUrl(form.id)}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello World'
  })
})
.then(response => response.json())
.then(data => console.log(data));`}
                    </pre>
                </div>
                <button
                    onClick={() => handleCopy(`fetch('${generateEndpointUrl(form.id)}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello World'
  })
})
.then(response => response.json())
.then(data => console.log(data));`)}
                    className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                >
                    Copy JavaScript Code
                </button>
            </div>

            {/* Webhook Integration */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Webhook Integration</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                        <div className="flex items-center">
                            <input
                                type="url"
                                value={form.settings?.webhookUrl || ''}
                                placeholder="https://your-domain.com/webhook"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                            />
                            <button className="ml-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800">
                                Save
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Webhook Secret</label>
                        <input
                            type="text"
                            value={form.settings?.webhookSecret || ''}
                            placeholder="Your webhook secret for verification"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                        />
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
            case 'notifications':
                return renderNotificationsTab();
            case 'submissions':
                return renderSubmissionsTab();
            case 'settings':
                return renderSettingsTab();
            case 'security':
                return renderSecurityTab();
            case 'api':
                return renderApiTab();
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
                            <p className="text-gray-600">{form.description}</p>
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
