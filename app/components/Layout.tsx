import { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
// ... existing code ...

// Add new imports for UI components and icons
import { motion } from 'framer-motion';
import { Sun, Moon, Menu, X, Search, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

// Theme types for dark/light mode
type Theme = 'light' | 'dark';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({ children, title = 'Perth Glory News', description = 'Latest news and updates about Perth Glory FC' }: LayoutProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Handle theme switching
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items with active state handling
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'News', path: '/news' },
    { name: 'Ladder', path: '/ladder' },
    { name: 'Fixtures', path: '/fixtures' },
    { name: 'Players', path: '/players' },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Announcement banner for important updates */}
      <div className="bg-purple-700 dark:bg-purple-900 text-white py-2 px-4 text-center text-sm">
        <p>Next match: Perth Glory vs Western Sydney Wanderers - Saturday, 7:30pm AWST</p>
      </div>

      {/* Enhanced header with animations and responsive design */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md'
            : 'bg-white dark:bg-gray-900'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and brand */}
            <motion.div
              className="flex-shrink-0 flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/">
                <a className="flex items-center">
                  <img
                    className="h-8 w-auto sm:h-10"
                    src="/logo.png"
                    alt="Perth Glory News"
                  />
                  <span className="ml-3 text-xl font-bold text-purple-800 dark:text-purple-300">
                    Glory News
                  </span>
                </a>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link href={item.path} key={item.name}>
                  <a
                    className={`px-1 py-2 text-sm font-medium transition-colors hover:text-purple-700 dark:hover:text-purple-300 relative ${
                      router.pathname === item.path
                        ? 'text-purple-700 dark:text-purple-300 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-700 dark:after:bg-purple-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>

            {/* Actions: Search, Theme, Notifications */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 text-gray-700" />
                ) : (
                  <Sun className="h-5 w-5 text-gray-300" />
                )}
              </button>

              <button
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                aria-label="Open menu"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile navigation drawer */}
        {isMenuOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 shadow-lg">
              {navItems.map((item) => (
                <Link href={item.path} key={item.name}>
                  <a
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      router.pathname === item.path
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </button>

                <button
                  onClick={toggleTheme}
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300"
                  aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                  {theme === 'light' ? (
                    <>
                      <Moon className="h-5 w-5 mr-2" />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun className="h-5 w-5 mr-2" />
                      Light Mode
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search overlay */}
        {isSearchOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg p-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search articles, players, fixtures..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Popular: Match Reports, Transfer News, A-League, Ladder
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Breadcrumbs for navigation context */}
      {router.pathname !== '/' && (
        <div className="bg-gray-100 dark:bg-gray-800 py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex text-sm">
              <Link href="/">
                <a className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Home</a>
              </Link>
              <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
                {router.pathname.split('/').pop()?.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())}
              </span>
            </nav>
          </div>
        </div>
      )}

      {/* Main content with animation */}
      <motion.main
        className="flex-grow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </motion.main>

      {/* Enhanced footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Perth Glory News</h3>
              <p className="text-gray-400 text-sm">
                Your comprehensive source for all things Perth Glory FC, bringing you the latest news, match reports, player profiles and more.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link href={item.path}>
                      <a className="text-gray-400 hover:text-white transition-colors">
                        {item.name}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Follow Glory</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://twitter.com/PerthGloryFC" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="https://www.facebook.com/perthgloryfc" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/perthgloryfc" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="https://www.youtube.com/user/PerthGloryFootballClub" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    YouTube
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Subscribe</h3>
              <p className="text-gray-400 text-sm mb-4">
                Get the latest Glory news straight to your inbox
              </p>
              <form className="space-y-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-purple-700 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Perth Glory News. All rights reserved.</p>
            <p className="mt-2">
              Not affiliated with Perth Glory FC. This is a fan site created to provide news and updates about the club.
            </p>
          </div>
        </div>
      </footer>

      {/* Accessibility features */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-purple-700 hover:bg-purple-600 text-white p-3 rounded-full shadow-lg transition-colors"
          aria-label="Scroll to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}