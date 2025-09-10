import { Link } from 'react-router-dom'
import { Container } from '../components/Container'

export function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Container>
                <div className="flex-center min-h-screen text-center">
                    <div className="max-w-3xl">
                        <h1 className="heading-1 mb-6">
                            Welcome to{' '}
                            <span className="text-blue-600">Express React Auth</span>
                        </h1>
                        <p className="text-xl text-muted mb-8 leading-relaxed">
                            A modern, secure authentication system built with Express.js, React,
                            and TypeScript. Get started with our powerful authentication features.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/signup" className="btn btn-primary btn-lg">
                                Get Started
                            </Link>
                            <Link to="/login" className="btn btn-outline btn-lg">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}
