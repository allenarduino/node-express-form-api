import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Navbar } from './components/Navbar'
import { RequireAuth } from './components/RequireAuth'
import { DashboardLayout } from './layouts/DashboardLayout'
import { LandingPage } from './pages/LandingPage'
import { SignupPage } from './pages/SignupPage'
import { LoginPage } from './pages/LoginPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProfilePage } from './pages/dashboard/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/auth/callback" element={<AuthCallbackPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <RequireAuth>
                                <DashboardLayout>
                                    <DashboardPage />
                                </DashboardLayout>
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/dashboard/profile"
                        element={
                            <RequireAuth>
                                <DashboardLayout>
                                    <ProfilePage />
                                </DashboardLayout>
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/dashboard/settings"
                        element={
                            <RequireAuth>
                                <DashboardLayout>
                                    <SettingsPage />
                                </DashboardLayout>
                            </RequireAuth>
                        }
                    />
                </Routes>
            </div>
        </AuthProvider>
    )
}

export default App
