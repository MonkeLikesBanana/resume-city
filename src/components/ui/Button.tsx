import type { ComponentPropsWithoutRef } from 'react'
import { Link } from 'react-router-dom'

type ButtonProps = {
  variant?: 'primary' | 'secondary'
  className?: string
} & (
  | ({ as?: 'button' } & ComponentPropsWithoutRef<'button'>)
  | ({ as: 'a' } & ComponentPropsWithoutRef<'a'>)
  | ({ as: 'link' } & ComponentPropsWithoutRef<typeof Link>)
  | ({ as: 'summary' } & ComponentPropsWithoutRef<'summary'>)
)

const variants = {
  primary: 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-ground)] hover:opacity-85',
  secondary: 'border-[var(--color-ink)]/35 bg-[var(--color-ground)] text-[var(--color-ink)] hover:border-[var(--color-ink)]',
}

export default function Button(props: ButtonProps) {
  const { variant = 'secondary', className = '', ...element } = props
  const classes = `inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold disabled:cursor-default disabled:opacity-40 ${variants[variant]} ${className}`

  if (element.as === 'a') {
    const { as: _, ...attributes } = element
    return <a {...attributes} className={classes} />
  }
  if (element.as === 'link') {
    const { as: _, ...attributes } = element
    return <Link {...attributes} className={classes} />
  }
  if (element.as === 'summary') {
    const { as: _, ...attributes } = element
    return <summary {...attributes} className={classes} />
  }
  const { as: _, ...attributes } = element
  return <button type="button" {...attributes} className={classes} />
}
