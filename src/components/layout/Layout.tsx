import { Header } from './Header'
import { Footer } from './Footer'
import { DotGridBackground } from '../ui/DotGridBackground'
import { DarkBackground } from '../ui/DarkBackground'
import { GradientBackground } from '../ui/GradientBackground'
import { AirbrushBackground } from '../ui/AirbrushBackground'

export type PageBackground = 'light' | 'light-grid' | 'dark' | 'dark-grid' | 'gradient'

interface LayoutProps {
  children: React.ReactNode
  /** Base page backdrop. Defaults to the usual pale gradient + subtle dots. */
  background?: PageBackground
  /** Home only: layers stronger colour glows on top of a 'light' background. */
  airbrush?: boolean
}

export function Layout({ children, background = 'light-grid', airbrush = false }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {background === 'light' && <DotGridBackground grid={false} />}
      {background === 'light-grid' && <DotGridBackground grid />}
      {background === 'dark' && <DarkBackground grid={false} />}
      {background === 'dark-grid' && <DarkBackground grid />}
      {background === 'gradient' && <GradientBackground />}
      {airbrush && <AirbrushBackground />}
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
