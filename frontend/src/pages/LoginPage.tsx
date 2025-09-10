import { Link } from 'react-router-dom'
import { Container } from '../components/Container'

export function LoginPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex-center section">
            <Container size="xs">
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="heading-2">Sign in to your account</h2>
                        <p className="mt-2 text-muted">
                            Enter your credentials to access your dashboard
                        </p>
                    </div>

                    <div className="card card-body">
                        <form className="space-y-6">
                            <div>
                                <label htmlFor="email" className="label">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="input"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="label">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="input"
                                    placeholder="Enter your password"
                                />
                            </div>

                            <div className="flex-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                        Forgot your password?
                                    </a>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary w-full">
                                Sign In
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm-muted">
                                Don't have an account?{' '}
                                <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                                    Sign up here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}
