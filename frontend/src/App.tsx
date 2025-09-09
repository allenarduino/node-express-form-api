import { Routes, Route } from 'react-router-dom'

function App() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Routes>
                <Route path="/" element={
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Express React Auth
                            </h1>
                            <p className="text-gray-600">
                                Frontend is running with Vite + React + TypeScript + Tailwind CSS
                            </p>
                        </div>
                    </div>
                } />
            </Routes>
        </div>
    )
}

export default App
