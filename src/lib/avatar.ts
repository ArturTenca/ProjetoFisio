export function avatarColor(tone: string | null | undefined) {
  if (!tone) return '#0e271c'
  const hex = tone.match(/#([0-9a-fA-F]{3,8})/)?.[0]
  if (hex) return hex
  if (tone.includes('forest-mid')) return '#1a3d2c'
  if (tone.includes('forest')) return '#0e271c'
  if (tone.includes('accent')) return '#3db86a'
  return '#0e271c'
}

export function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}
