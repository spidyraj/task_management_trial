'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-lg mb-6">
            📋
          </div>
        </div>
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
        </div>
        <div className="mt-8 text-gray-400">
          <p>Manage your tasks efficiently with our modern task management application.</p>
        </div>
      </div>
    </div>
  );
}
