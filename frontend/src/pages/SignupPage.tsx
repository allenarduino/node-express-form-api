import { Link } from 'react-router-dom'
import { Container } from '../components/Container'

export function SignupPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex-center section">
            <Container size="xs">
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="heading-2">Create your account</h2>
                        <p className="mt-2 text-muted">
                            Join us today and get started with your journey
                        </p>
                    </div>

                    <div className="card card-body">
                        <form className="space-y-6">
                            <div>
                                <label htmlFor="name" className="label">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="input"
                                    placeholder="Enter your full name"
                                />
                            </div>

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
                                    placeholder="Create a password"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="label">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="input"
                                    placeholder="Confirm your password"
                                />
                            </div>

                            <button type="submit" className="btn btn-primary w-full">
                                Create Account
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm-muted">
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}
