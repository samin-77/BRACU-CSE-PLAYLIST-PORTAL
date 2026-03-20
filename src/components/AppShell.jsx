import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Moon, Sun, LogOut, BookOpen, Github, Facebook, Linkedin, Mail, Instagram } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../state/AuthContext.jsx'
import { useDarkMode } from '../hooks/useDarkMode.js'
import { ParticleBackground } from './ParticleBackground.jsx'

function TabLink({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        clsx(
          'relative px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 overflow-hidden group whitespace-nowrap',
          isActive
            ? 'text-white'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className="relative z-10">{children}</span>
          {isActive && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"
              initial={false}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
              }}
            />
          )}
          {!isActive && (
            <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </>
      )}
    </NavLink>
  )
}

export function AppShell() {
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggle } = useDarkMode()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      <ParticleBackground />
      
      <motion.header 
        className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl dark:border-slate-800/20 dark:bg-slate-950/80"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Logo and title */}
            <motion.div 
              className="flex items-center justify-between gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-sm opacity-50" />
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
                <div>
                  <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    BRACU CSE Playlist Portal
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    by Ishfak Mahbub Samin
                  </div>
                </div>
              </div>
              
              {/* Mobile theme toggle */}
              <motion.button
                type="button"
                onClick={toggle}
                className="lg:hidden relative p-2 rounded-lg border border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-white dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.button>
            </motion.div>

            {/* Navigation */}
            <motion.nav 
              className="flex items-center gap-1 sm:gap-2 rounded-xl border border-white/20 bg-white/50 backdrop-blur-sm p-1 shadow-lg dark:border-slate-800/20 dark:bg-slate-900/50 overflow-x-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TabLink to="/" end>
                Dashboard
              </TabLink>
              <TabLink to="/suggest">Suggest</TabLink>
              <TabLink to="/profile">Profile</TabLink>
              {isAdmin && <TabLink to="/admin/suggestions">Admin</TabLink>}
            </motion.nav>

            {/* Desktop actions */}
            <motion.div 
              className="hidden lg:flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                type="button"
                onClick={toggle}
                className="relative p-2 rounded-lg border border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-white dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.button>
              
              <motion.button
                type="button"
                onClick={async () => {
                  await logout()
                  navigate('/login')
                }}
                className="relative group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </div>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <motion.main 
        className="relative z-10 mx-auto max-w-6xl px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Outlet />
      </motion.main>

      <motion.footer 
        className="relative z-10 mx-auto max-w-6xl px-4 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="border-t border-white/20 bg-white/30 backdrop-blur-xl rounded-2xl p-6 dark:border-slate-800/20 dark:bg-slate-900/30">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* User info */}
            <motion.div 
              className="flex flex-col gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                Signed in as
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {user?.displayName?.charAt(0) || 'S'}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {user?.displayName ?? 'Student'}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {user?.email}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Copyright and social links */}
            <motion.div 
              className="flex flex-col gap-4 items-center lg:items-end"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="text-xs text-slate-600 dark:text-slate-400 text-center lg:text-right">
                © 2026 Made with ❤️ by <span className="font-semibold">Ishfak Mahbub Samin</span>
                <br />
                All rights reserved.
              </div>
              
              <div className="flex items-center gap-3">
                <motion.a
                  href="https://github.com/samin-77"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Github className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </motion.a>
                <motion.a
                  href="https://www.facebook.com/ishfak.mahbub.samin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Facebook className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </motion.a>
                <motion.a
                  href="https://www.linkedin.com/in/ishfak-samin-dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Linkedin className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </motion.a>
                <motion.a
                  href="https://www.instagram.com/icepiper._.77/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Instagram className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </motion.a>
                <motion.a
                  href="mailto:ishfak.mahbub.samin@example.com"
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Mail className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

