'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">Task Management App</h1>
        <div className="space-y-4">
          <Link 
            href="/login" 
            className="block px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="block px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Register
          </Link>
          <Link 
            href="/dashboard" 
            className="block px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Dashboard (Test)
          </Link>
        </div>
        <div className="mt-8 text-gray-400">
          <p>Backend: http://localhost:5000</p>
          <p>Frontend: http://localhost:3000</p>
        </div>
      </div>
    </div>
  );
}
