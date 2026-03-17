import { collection, doc, getDoc, getDocs, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore'
import { useMemo, useState, useEffect } from 'react'
import { db, firebaseReady } from '../lib/firebase.js'
import { COURSES } from '../data/courses.js'
import { useAuth } from '../state/AuthContext.jsx'
import { motion } from 'framer-motion'
import { Check, X, Eye, Trash2, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle, Users, Calendar, Filter, Search } from 'lucide-react'

const SUGGESTIONS_COLLECTION = 'playlistSuggestions'

export function AdminSuggestionsPage() {
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, pending, approved, rejected
  const [search, setSearch] = useState('')
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)
  const [updating, setUpdating] = useState(false)

  const courseTitleByCode = useMemo(() => {
    const map = new Map()
    for (const c of COURSES) map.set(c.code, c.title)
    return map
  }, [])

  useEffect(() => {
    loadSuggestions()
  }, [filter])

  async function loadSuggestions() {
    if (!firebaseReady || !db) {
      setError('Firestore is not configured.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      let q = collection(db, SUGGESTIONS_COLLECTION)
      
      if (filter !== 'all') {
        q = query(q, where('status', '==', filter))
      }
      
      q = query(q, orderBy('createdAt', 'desc'))
      
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }))
      
      setSuggestions(data)
    } catch (e) {
      setError(e?.message || 'Failed to load suggestions')
    } finally {
      setLoading(false)
    }
  }

  async function updateSuggestionStatus(suggestionId, status) {
    setUpdating(true)
    try {
      await updateDoc(doc(db, SUGGESTIONS_COLLECTION, suggestionId), {
        status,
        reviewedAt: new Date(),
        reviewedBy: {
          uid: user.uid,
          name: user.displayName,
          email: user.email
        }
      })
      await loadSuggestions()
      setSelectedSuggestion(null)
    } catch (e) {
      setError(e?.message || 'Failed to update suggestion')
    } finally {
      setUpdating(false)
    }
  }

  async function deleteSuggestion(suggestionId) {
    if (!confirm('Are you sure you want to delete this suggestion?')) return
    
    setUpdating(true)
    try {
      await deleteDoc(doc(db, SUGGESTIONS_COLLECTION, suggestionId))
      await loadSuggestions()
      setSelectedSuggestion(null)
    } catch (e) {
      setError(e?.message || 'Failed to delete suggestion')
    } finally {
      setUpdating(false)
    }
  }

  const filteredSuggestions = useMemo(() => {
    if (!search) return suggestions
    const q = search.toLowerCase()
    return suggestions.filter(s => 
      s.course?.toLowerCase().includes(q) ||
      s.facultyInitials?.toLowerCase().includes(q) ||
      s.facultyName?.toLowerCase().includes(q) ||
      s.playlistUrl?.toLowerCase().includes(q) ||
      s.comments?.toLowerCase().includes(q) ||
      s.submittedBy?.email?.toLowerCase().includes(q)
    )
  }, [suggestions, search])

  const stats = useMemo(() => {
    return {
      total: suggestions.length,
      pending: suggestions.filter(s => s.status === 'pending').length,
      approved: suggestions.filter(s => s.status === 'approved').length,
      rejected: suggestions.filter(s => s.status === 'rejected').length
    }
  }, [suggestions])

  function getStatusIcon(status) {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800'
    }
  }

  if (!firebaseReady) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-900/60 dark:bg-amber-950/30">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-2">
            Firebase Not Configured
          </h3>
          <p className="text-amber-800 dark:text-amber-300">
            Please configure Firebase in your environment variables to use this feature.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl" />
        <div className="relative border border-white/20 bg-white/40 backdrop-blur-xl rounded-3xl p-6 shadow-xl dark:border-slate-800/20 dark:bg-slate-900/40">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Suggestions Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Review and manage playlist suggestions submitted by users
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="text-center px-3 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/20 dark:bg-slate-900/60">
                <div className="text-lg font-bold text-slate-900 dark:text-white">{stats.total}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Total</div>
              </div>
              <div className="text-center px-3 py-2 rounded-xl bg-yellow-100/60 backdrop-blur-sm border border-yellow-200/20 dark:border-yellow-800/20 dark:bg-yellow-900/60">
                <div className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">Pending</div>
              </div>
              <div className="text-center px-3 py-2 rounded-xl bg-green-100/60 backdrop-blur-sm border border-green-200/20 dark:border-green-800/20 dark:bg-green-900/60">
                <div className="text-lg font-bold text-green-700 dark:text-green-300">{stats.approved}</div>
                <div className="text-xs text-green-600 dark:text-green-400">Approved</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-center"
      >
        <div className="relative flex-1 lg:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suggestions..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 bg-white/60 backdrop-blur-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800/20 dark:bg-slate-900/60 dark:text-slate-100"
          />
        </div>
        
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl border font-medium transition-all ${
                filter === status
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white/60 border-white/20 text-slate-700 hover:bg-white/80 dark:bg-slate-900/60 dark:border-slate-800/20 dark:text-slate-300 dark:hover:bg-slate-900/80'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
        >
          {error}
        </motion.div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        /* Suggestions List */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredSuggestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No suggestions found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {search ? 'Try adjusting your search terms' : 'No suggestions match the current filter'}
              </p>
            </div>
          ) : (
            filteredSuggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-white/20 bg-white/40 backdrop-blur-sm rounded-2xl p-6 shadow-xl dark:border-slate-800/20 dark:bg-slate-900/40"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(suggestion.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(suggestion.status)}`}>
                        {suggestion.status || 'pending'}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {suggestion.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Course</div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {suggestion.course} — {courseTitleByCode.get(suggestion.course) || 'Unknown'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Faculty</div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {suggestion.facultyInitials} — {suggestion.facultyName}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Submitted by</div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {suggestion.submittedBy?.name || 'Unknown'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Email</div>
                        <div className="font-medium text-slate-900 dark:text-white truncate">
                          {suggestion.submittedBy?.email || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    
                    {suggestion.playlistUrl && (
                      <div className="mt-3">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Playlist URL</div>
                        <a
                          href={suggestion.playlistUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                        >
                          {suggestion.playlistUrl}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    
                    {suggestion.comments && (
                      <div className="mt-3">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Comments</div>
                        <div className="text-slate-700 dark:text-slate-300 bg-white/50 rounded-lg p-3">
                          {suggestion.comments}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 lg:flex-col">
                    <button
                      onClick={() => setSelectedSuggestion(suggestion)}
                      className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {suggestion.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateSuggestionStatus(suggestion.id, 'approved')}
                          disabled={updating}
                          className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateSuggestionStatus(suggestion.id, 'rejected')}
                          disabled={updating}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => deleteSuggestion(suggestion.id)}
                      disabled={updating}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:hover:bg-gray-900/50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Detail Modal */}
      {selectedSuggestion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSuggestion(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Suggestion Details
              </h2>
              <button
                onClick={() => setSelectedSuggestion(null)}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Status</div>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedSuggestion.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedSuggestion.status)}`}>
                      {selectedSuggestion.status || 'pending'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Submitted</div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {selectedSuggestion.createdAt.toLocaleDateString()} {selectedSuggestion.createdAt.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium text-slate-900 dark:text-white mb-2">Suggestion Details</h3>
                <div className="space-y-2">
                  <div><strong>Course:</strong> {selectedSuggestion.course} — {courseTitleByCode.get(selectedSuggestion.course) || 'Unknown'}</div>
                  <div><strong>Faculty:</strong> {selectedSuggestion.facultyInitials} — {selectedSuggestion.facultyName}</div>
                  <div><strong>Playlist URL:</strong> 
                    <a href={selectedSuggestion.playlistUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 ml-1">
                      {selectedSuggestion.playlistUrl}
                    </a>
                  </div>
                  {selectedSuggestion.comments && (
                    <div><strong>Comments:</strong> {selectedSuggestion.comments}</div>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium text-slate-900 dark:text-white mb-2">Submitted By</h3>
                <div className="space-y-1">
                  <div><strong>Name:</strong> {selectedSuggestion.submittedBy?.name || 'Unknown'}</div>
                  <div><strong>Email:</strong> {selectedSuggestion.submittedBy?.email || 'Unknown'}</div>
                  <div><strong>UID:</strong> {selectedSuggestion.submittedBy?.uid || 'Unknown'}</div>
                </div>
              </div>
              
              {selectedSuggestion.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => updateSuggestionStatus(selectedSuggestion.id, 'approved')}
                    disabled={updating}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateSuggestionStatus(selectedSuggestion.id, 'rejected')}
                    disabled={updating}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
