import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden">
      <SiteHeader />
      <main className="relative min-h-[100dvh]">{children}</main>
      <SiteFooter />
    </div>
  )
}
