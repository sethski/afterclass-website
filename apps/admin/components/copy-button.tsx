'use client'

import { useState } from 'react'

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="text-accent underline decoration-2 underline-offset-4"
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
