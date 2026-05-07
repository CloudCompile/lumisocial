import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-dark text-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:bg-opacity-95 md:border-r md:border-gray-800">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-accent">Lumi</h1>
        </div>

        <nav className="flex-1 space-y-4 px-4">
          <button
            onClick={() => navigate('/')}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-900 transition"
          >
            🏠 Home
          </button>
          <button
            onClick={() => navigate('/explore')}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-900 transition"
          >
            🔍 Explore
          </button>
          <button
            onClick={() => navigate('/upload')}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-900 transition"
          >
            ➕ Upload
          </button>
          <button
            onClick={() => navigate(`/profile/${user?.email?.split('@')[0]}`)}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-900 transition"
          >
            👤 Profile
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => logout().then(() => navigate('/login'))}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-around py-2 z-50">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 hover:bg-gray-800 transition text-center text-xs"
          >
            🏠
          </button>
          <button
            onClick={() => navigate('/explore')}
            className="flex-1 py-3 hover:bg-gray-800 transition text-center text-xs"
          >
            🔍
          </button>
          <button
            onClick={() => navigate('/upload')}
            className="flex-1 py-3 hover:bg-gray-800 transition text-center text-xs"
          >
            ➕
          </button>
          <button
            onClick={() => navigate(`/profile/${user?.email?.split('@')[0]}`)}
            className="flex-1 py-3 hover:bg-gray-800 transition text-center text-xs"
          >
            👤
          </button>
        </div>

        {/* Padding for mobile nav */}
        <div className="md:hidden h-20"></div>
      </div>
    </div>
  );
};

export default Layout;
