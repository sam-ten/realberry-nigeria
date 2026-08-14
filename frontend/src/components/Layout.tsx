import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
  LayoutDashboard, Building2, Wallet, FileText, Users, Bell, LogOut,
  Shield, Menu, X, ChevronDown, Landmark, Gem
} from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'company';

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/properties', label: 'Properties', icon: Building2 },
    { path: '/communities', label: 'Communities', icon: Users },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/kyc', label: 'KYC Verification', icon: Shield },
  ];

  const adminItems = [
    { path: '/admin', label: 'Admin Dashboard', icon: Landmark },
    { path: '/admin/dividends', label: 'Bulk Dividends', icon: Gem },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}>
        <div className="p-6 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-navy-900 to-navy-700 rounded-lg flex items-center justify-center">
              <Landmark className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-navy-900 leading-tight">RealBerry</h1>
              <p className="text-xs text-gray-500">Nigeria</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Investor</p>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          {isAdmin && (
            <>
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">Administration</p>
              {adminItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={logout} className="sidebar-link w-full text-red-600 hover:bg-red-50">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-navy-900">
              {location.pathname === '/dashboard' && 'Investor Dashboard'}
              {location.pathname === '/properties' && 'Properties'}
              {location.pathname.startsWith('/properties/') && 'Property Details'}
              {location.pathname === '/kyc' && 'KYC Verification'}
              {location.pathname === '/documents' && 'Document Vault'}
              {location.pathname === '/communities' && 'Communities'}
              {location.pathname === '/admin' && 'Admin Dashboard'}
              {location.pathname === '/admin/dividends' && 'Bulk Dividend Engine'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-all"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-sm">{user?.full_name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); navigate('/kyc'); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" /> KYC Status: <span className={`capitalize font-medium ${user?.kyc_status === 'verified' ? 'text-green-600' : 'text-yellow-600'}`}>{user?.kyc_status}</span>
                  </button>
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
