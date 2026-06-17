import Link from 'next/link'

interface TagBadgeProps {
  name: string
  clickable?: boolean
  size?: 'sm' | 'md'
}

export default function TagBadge({ name, clickable = true, size = 'sm' }: TagBadgeProps) {
  const style: React.CSSProperties = {
    fontFamily: 'var(--font-garamond)',
    fontSize: size === 'sm' ? '0.75rem' : '0.85rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--color-gold-dark)',
    backgroundColor: 'rgba(201,168,76,0.1)',
    border: '1px solid rgba(201,168,76,0.35)',
    padding: size === 'sm' ? '0.15rem 0.55rem' : '0.25rem 0.75rem',
    borderRadius: '1px',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
    display: 'inline-block',
  }

  if (!clickable) {
    return <span style={style}>{name}</span>
  }

  return (
    <Link
      href={`/tag/${encodeURIComponent(name)}`}
      style={style}
      className="hover:bg-gold-muted hover:border-gold"
    >
      {name}
    </Link>
  )
}
