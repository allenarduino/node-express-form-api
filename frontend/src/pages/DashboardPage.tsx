import { Container } from '../components/Container'

export function DashboardPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Container>
                <div className="section">
                    <div className="mb-8">
                        <h1 className="heading-2">Dashboard</h1>
                        <p className="mt-2 text-muted">
                            Welcome to your personal dashboard
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="card card-body">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-500 rounded-md flex-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="heading-4">Profile</h3>
                                    <p className="text-sm-muted">Manage your account settings</p>
                                </div>
                            </div>
                        </div>

                        <div className="card card-body">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-500 rounded-md flex-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="heading-4">Security</h3>
                                    <p className="text-sm-muted">Update your security settings</p>
                                </div>
                            </div>
                        </div>

                        <div className="card card-body">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-purple-500 rounded-md flex-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="heading-4">Analytics</h3>
                                    <p className="text-sm-muted">View your activity stats</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 card card-body">
                        <h2 className="heading-3 mb-4">Recent Activity</h2>
                        <div className="space-y-3">
                            <div className="flex items-center text-sm text-muted">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                <span>Account created successfully</span>
                                <span className="ml-auto text-gray-400">2 hours ago</span>
                            </div>
                            <div className="flex items-center text-sm text-muted">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                <span>Email verified</span>
                                <span className="ml-auto text-gray-400">1 hour ago</span>
                            </div>
                            <div className="flex items-center text-sm text-muted">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                <span>Profile updated</span>
                                <span className="ml-auto text-gray-400">30 minutes ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}
