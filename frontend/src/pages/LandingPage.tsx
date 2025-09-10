import { Link } from 'react-router-dom'

export function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center min-h-screen text-center">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                            Welcome to{' '}
                            <span className="text-blue-600">Express React Auth</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            A modern, secure authentication system built with Express.js, React,
                            and TypeScript. Get started with our powerful authentication features.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/signup"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                            >
                                Get Started
                            </Link>
                            <Link
                                to="/login"
                                className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-8 rounded-lg border-2 border-blue-600 transition-colors duration-200"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
