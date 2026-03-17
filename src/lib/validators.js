import { isValidYoutubeUrl } from './youtube.js'

export function required(value) {
  return String(value ?? '').trim().length > 0
}

export function validateSuggestion(values) {
  const errors = {}

  if (!required(values.course)) errors.course = 'Course is required.'
  if (!required(values.playlistUrl)) errors.playlistUrl = 'Playlist link is required.'
  else if (!isValidYoutubeUrl(values.playlistUrl))
    errors.playlistUrl = 'Please enter a valid YouTube URL.'

  if (!required(values.facultyInitials)) errors.facultyInitials = 'Faculty initials are required.'
  if (!required(values.facultyName)) errors.facultyName = 'Faculty full name is required.'

  return errors
}

