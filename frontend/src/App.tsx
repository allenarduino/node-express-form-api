import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Navbar } from './components/Navbar'
import { RequireAuth } from './components/RequireAuth'
import { LandingPage } from './pages/LandingPage'
import { SignupPage } from './pages/SignupPage'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'

function App() {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <RequireAuth>
                                <DashboardPage />
                            </RequireAuth>
                        }
                    />
                </Routes>
            </div>
        </AuthProvider>
    )
}

export default App
