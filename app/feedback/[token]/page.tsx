import type { Metadata } from 'next'
import { FeedbackForm } from './feedback-form'

export const metadata: Metadata = {
  title: { absolute: 'After Class date feedback' },
  description: 'Private feedback for your After Class cafe date.',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-3">
        <h1 className="font-sn-pro text-3xl font-bold text-cream">
          How did the date go?
        </h1>
        <p className="max-w-prose text-[1.125rem] leading-relaxed text-cream">
          This stays private. Founders read it. Your match does not.
        </p>
      </div>
      <FeedbackForm token={token} />
    </main>
  )
}
