import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Chrome, BookOpen, Sparkles, Shield } from 'lucide-react'
import { useAuth } from '../state/AuthContext.jsx'
import { firebaseMissingKeys, firebaseReady } from '../lib/firebase.js'
import { ParticleBackground } from '../components/ParticleBackground.jsx'

export function LoginPage() {
  const { user, loginWithGoogle, authError } = useAuth()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const from = location.state?.from || '/'

  if (user) return <Navigate to={from} replace />

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4 py-8">
      <ParticleBackground />
      
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl" />
          
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
            {/* Logo and title */}
            <motion.div 
              className="text-center mb-6 sm:mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="flex justify-center mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50" />
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full">
                    <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                </motion.div>
              </div>
              
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                BRAC CSE Playlist Portal
              </h1>
              <p className="text-blue-200 text-sm flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4" />
                Your gateway to knowledge
              </p>
            </motion.div>

            {/* Error display */}
            {(error || authError) ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm px-4 py-3 text-sm text-red-200"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {error || authError}
                </div>
              </motion.div>
            ) : null}

            {/* Login button */}
            <motion.button
              type="button"
              disabled={loading}
              onClick={async () => {
                // Immediate visual feedback
                setLoading(true)
                setError(null)
                
                try {
                  // Add a small delay to ensure loading state is visible
                  await new Promise(resolve => setTimeout(resolve, 100))
                  await loginWithGoogle()
                } catch (e) {
                  setError(e?.message || 'Login failed. Please try again.')
                } finally {
                  setLoading(false)
                }
              }}
              className="w-full relative group"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg transition-all duration-300 ${loading ? 'opacity-70' : 'opacity-50 group-hover:opacity-70'}`} />
              <div className={`relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-white font-semibold shadow-lg flex items-center justify-center gap-3 transition-all duration-300 ${loading ? 'opacity-90' : ''} disabled:opacity-60 disabled:cursor-not-allowed`}>
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span className="text-sm sm:text-base">Redirecting to Google…</span>
                  </>
                ) : (
                  <>
                    <Chrome className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Continue with Google</span>
                  </>
                )}
              </div>
              
              {/* Loading overlay for better feedback */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="w-8 h-8 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                </motion.div>
              )}
            </motion.button>

            {/* Info text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 sm:mt-6 text-center"
            >
              <p className="text-blue-200 text-xs mb-2">
                Secure authentication powered by Google
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <Shield className="w-3 h-3 text-green-400" />
                <span className="text-xs text-blue-200">
                  Only <span className="font-mono font-semibold">@g.bracu.ac.bd</span> allowed
                </span>
              </div>
            </motion.div>

            {/* Firebase warning */}
            {!firebaseReady ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm px-4 py-3 text-xs text-amber-200"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>
                    Firebase env missing: <span className="font-mono">{firebaseMissingKeys.join(', ')}</span>
                  </span>
                </div>
              </motion.div>
            ) : null}
          </div>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
    </div>
  )
}

