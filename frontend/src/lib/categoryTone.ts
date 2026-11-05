const TONES = ['green', 'pink', 'orange', 'yellow', 'purple', 'blue', 'red'] as const

export type CategoryTone = (typeof TONES)[number]

export function categoryTone(name: string): CategoryTone {
  let hash = 0
  for (const char of name) {
    hash = (hash + char.charCodeAt(0)) % TONES.length
  }
  return TONES[hash] ?? 'green'
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '')
  return letters.join('') || '•'
}
