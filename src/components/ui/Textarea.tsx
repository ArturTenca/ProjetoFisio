import { forwardRef, type TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const textareaId = id ?? label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-2">
        <label htmlFor={textareaId} className="block text-sm font-medium text-ink">
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={!!error}
          className={[
            'min-h-24 w-full rounded-2xl border bg-canvas px-4 py-3 text-ink placeholder:text-muted/50',
            'transition-colors duration-200',
            'focus:border-accent focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/25',
            error ? 'border-error' : 'border-line hover:border-forest/25',
            className,
          ].join(' ')}
          {...props}
        />
        {error && (
          <p role="alert" className="text-xs text-error">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
