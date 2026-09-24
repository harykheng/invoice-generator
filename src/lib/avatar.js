export function avatarStyle() {
  return 'bg-slate-100 text-slate-600'
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
