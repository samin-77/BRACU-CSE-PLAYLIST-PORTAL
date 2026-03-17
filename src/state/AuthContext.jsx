import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { auth, firebaseReady } from '../lib/firebase.js'

const ALLOWED_DOMAIN = 'g.bracu.ac.bd'

const AuthContext = createContext(null)

function shouldPreferRedirect() {
  // Safari (especially iOS) often blocks/cripples popup auth flows.
  const ua = navigator.userAgent || ''
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua) && !/Chromium/.test(ua)
  const isIOS = /iPad|iPhone|iPod/.test(ua)
  return isSafari || isIOS
}

function isAllowedBracEmail(email) {
  if (!email) return false
  const at = email.lastIndexOf('@')
  if (at === -1) return false
  return email.slice(at + 1).toLowerCase() === ALLOWED_DOMAIN
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setUser(null)
      setAuthError('Firebase is not configured. Copy `.env.example` → `.env` and add your keys.')
      setInitializing(false)
      return
    }

    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      if (nextUser && nextUser.emailVerified === false) {
        await signOut(auth)
        setUser(null)
        setAuthError('Please verify your Google account email, then try again.')
        setInitializing(false)
        return
      }
      if (nextUser && !isAllowedBracEmail(nextUser.email)) {
        await signOut(auth)
        setUser(null)
        setAuthError('Please sign in using your BRAC GSuite email (@g.bracu.ac.bd).')
        setInitializing(false)
        return
      }

      setUser(nextUser ?? null)
      setAuthError(null)
      setInitializing(false)
    })

    return () => unsub()
  }, [])

  const value = useMemo(() => {
    async function loginWithGoogle() {
      if (!firebaseReady || !auth) {
        throw new Error('Firebase is not configured. Please set your .env values.')
      }
      setAuthError(null)
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: 'select_account',
        hd: ALLOWED_DOMAIN,
      })

      if (shouldPreferRedirect()) {
        await signInWithRedirect(auth, provider)
        return null
      }

      try {
        const cred = await signInWithPopup(auth, provider)
        const email = cred?.user?.email
        if (cred?.user?.emailVerified === false) {
          await signOut(auth)
          throw new Error('Please verify your Google account email, then try again.')
        }
        if (!isAllowedBracEmail(email)) {
          await signOut(auth)
          throw new Error('Only @g.bracu.ac.bd accounts are allowed.')
        }
        return cred.user
      } catch (e) {
        // If popups are blocked or unsupported, fallback to redirect.
        const code = e?.code || ''
        if (
          code === 'auth/popup-blocked' ||
          code === 'auth/popup-closed-by-user' ||
          code === 'auth/cancelled-popup-request' ||
          code === 'auth/operation-not-supported-in-this-environment'
        ) {
          await signInWithRedirect(auth, provider)
          return null
        }
        throw e
      }
    }

    async function logout() {
      if (!auth) return
      await signOut(auth)
    }

    return {
      user,
      initializing,
      authError,
      loginWithGoogle,
      logout,
    }
  }, [user, initializing, authError])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

