import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { getApiErrorMessage } from '../lib/api'
import { getToken, setToken, clearToken } from '../lib/auth'

// Types
export interface User {
    id: string
    email: string
    name?: string
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface SignupCredentials {
    email: string
    password: string
}

export interface AuthContextType {
    user: User | null
    token: string | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (credentials: LoginCredentials) => Promise<void>
    signup: (credentials: SignupCredentials) => Promise<{ message: string }>
    logout: () => void
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setTokenState] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    // Check if user is authenticated
    const isAuthenticated = !!user && !!token

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedToken = getToken()
                if (storedToken) {
                    setTokenState(storedToken)
                    // Fetch user profile to verify token and get user info
                    await fetchUserProfile(storedToken)
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error)
                // Clear invalid token
                clearToken()
                setTokenState(null)
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        initializeAuth()
    }, [])

    // Fetch user profile from /me endpoint
    const fetchUserProfile = async (authToken: string) => {
        try {
            const response = await api.get('/api/me', {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            setUser(response.data)
        } catch (error) {
            throw new Error('Failed to fetch user profile')
        }
    }

    // Login function
    const login = async (credentials: LoginCredentials) => {
        try {
            setIsLoading(true)
            const response = await api.post('/api/auth/login', credentials)

            const { token: authToken, user: userData } = response.data

            // Store token in localStorage
            setToken(authToken)
            setTokenState(authToken)
            setUser(userData)

            // Redirect to dashboard
            navigate('/dashboard')
        } catch (error) {
            const errorMessage = getApiErrorMessage(error)
            throw new Error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    // Signup function
    const signup = async (credentials: SignupCredentials) => {
        try {
            const response = await api.post('/api/auth/signup', credentials)
            return response.data
        } catch (error) {
            const errorMessage = getApiErrorMessage(error)
            throw new Error(errorMessage)
        }
    }

    // Logout function
    const logout = () => {
        clearToken()
        setTokenState(null)
        setUser(null)
        navigate('/login')
    }

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        signup,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
