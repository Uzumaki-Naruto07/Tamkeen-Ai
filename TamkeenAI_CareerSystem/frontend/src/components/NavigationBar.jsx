import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { 
  FiMenu, 
  FiX, 
  FiUser, 
  FiLogOut, 
  FiSettings, 
  FiChevronDown,
  FiBriefcase,
  FiBarChart2,
  FiFileText,
  FiSearch,
  FiUsers,
  FiAward,
  FiTrendingUp,
  FiBook,
  FiMessageSquare,
  FiShield
} from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import LanguageToggle from './LanguageToggle';
import DarkModeToggle from './DarkModeToggle';
import logoLight from '../assets/logo-light.png';
import logoDark from '../assets/logo-dark.png';

const NavigationBar = () => {
  const { user, logout, hasRole, theme, language } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const profileRef = useRef(null);
  const menuRef = useRef(null);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };
  
  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
  };
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target) && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  // Close mobile menu on navigation
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  
  // Define navigation items
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <FiBarChart2 /> },
    { label: 'Resume Analysis', path: '/resume-analysis', icon: <FiFileText /> },
    { label: 'Career Assessment', path: '/career-assessment', icon: <FiTrendingUp /> },
    { label: 'Career Explorer', path: '/career-explorer', icon: <FiBriefcase /> },
    { label: 'Interview Results', path: '/interview-results', icon: <FiMessageSquare /> },
    { label: 'Resume Builder', path: '/resume-builder', icon: <FiFileText /> },
    { label: 'Cover Letter', path: '/cover-letter', icon: <FiBook /> },
    { label: 'Networking', path: '/networking', icon: <FiUsers /> },
    { label: 'AI Job Journey', path: '/ai-job-journey', icon: <FiTrendingUp /> },
    { label: 'Gamified Progress', path: '/gamified-progress', icon: <FiAward /> },
    { label: 'Job Search', path: '/job-search', icon: <FiSearch /> }
  ];
  
  // Admin-only nav items
  const adminNavItems = [
    { label: 'Admin Panel', path: '/admin', icon: <FiShield /> }
  ];
  
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md transition-colors duration-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex justify-between h-16">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="block h-8 w-auto">
                <img
                  className="h-8 w-auto"
                  src={theme === 'dark' ? logoDark : logoLight}
                  alt="Tamkeen AI"
                />
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden ml-2">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
                onClick={toggleMenu}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="hidden md:ml-6 md:flex md:space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-150 ease-in-out
                    ${isActive 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                    }`
                  }
                >
                  <span className="mr-1.5">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
              
              {/* Admin nav items (conditional rendering) */}
              {hasRole && hasRole('admin') && adminNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-150 ease-in-out
                    ${isActive 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                    }`
                  }
                >
                  <span className="mr-1.5">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
          
          {/* Right side items: language toggle, dark mode, profile */}
          <div className="flex items-center">
            <LanguageToggle className="mx-2" />
            <DarkModeToggle className="mx-2" />
            
            {/* Profile dropdown */}
            <div className="ml-3 relative" ref={profileRef}>
              <div>
                <button 
                  className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 items-center"
                  id="user-menu"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                  onClick={toggleProfile}
                >
                  <span className="sr-only">Open user menu</span>
                  {user?.profileImage ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.profileImage}
                      alt={user.name || "User profile"}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                      <FiUser />
                    </div>
                  )}
                  <span className="hidden ml-2 mr-1 text-gray-700 dark:text-gray-300 md:block">
                    {user?.name || 'User'}
                  </span>
                  <FiChevronDown className={`transition-transform duration-200 ${isProfileOpen ? 'transform rotate-180' : ''}`} />
                </button>
              </div>
              
              {/* Profile dropdown menu */}
              {isProfileOpen && (
                <div 
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    <FiUser className="mr-3 h-4 w-4" />
                    Your Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    <FiSettings className="mr-3 h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    <FiLogOut className="mr-3 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div 
        className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`} 
        id="mobile-menu"
        ref={menuRef}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `block px-3 py-2 rounded-md text-base font-medium flex items-center
                ${isActive 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                }`
              }
            >
              <span className="mr-2">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          
          {/* Admin nav items (conditional rendering) */}
          {hasRole && hasRole('admin') && adminNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `block px-3 py-2 rounded-md text-base font-medium flex items-center
                ${isActive 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                }`
              }
            >
              <span className="mr-2">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
};

export default NavigationBar; 