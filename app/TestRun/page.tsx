import type { Metadata } from 'next'
import { TestRunForm } from '@/components/test-run/test-run-form'
import { testRunContent } from '@/lib/test-run-content'

export const metadata: Metadata = {
  title: { absolute: testRunContent.metaTitle },
  description: testRunContent.metaDescription,
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function firstString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

export default async function TestRunPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const prefillEmail = firstString(params.email)
  const howHeard =
    firstString(params.heard) ??
    firstString(params.howHeard) ??
    firstString(params.source)

  return <TestRunForm prefillEmail={prefillEmail} howHeard={howHeard} />
}
