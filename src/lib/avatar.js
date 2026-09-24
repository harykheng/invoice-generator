const AVATAR_STYLES = [
  'bg-blue-50 text-blue-600',
  'bg-violet-50 text-violet-600',
  'bg-teal-50 text-teal-600',
  'bg-rose-50 text-rose-600',
  'bg-amber-50 text-amber-600',
  'bg-indigo-50 text-indigo-600',
]

export function avatarStyle(name) {
  const hash = (name || '').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return AVATAR_STYLES[hash % AVATAR_STYLES.length]
}

export function initials(name) {
  return (name || '?')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
