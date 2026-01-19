import Smoother from '@/components/Smoother'
import Hero from '@/components/Hero'
import Footer from '@/components/Footer'
import { LiveTicker, FeaturedDrop, InteractiveCategoryNav } from '@/components/HomeModules'

export const revalidate = 60 // Revalidate every minute for 'live' feel

export default function Home() {
  return (
    <Smoother>
      <main className="w-full min-h-screen bg-white text-black">
        <LiveTicker />
        <Hero />
        <FeaturedDrop />
        <InteractiveCategoryNav />
        <Footer />
      </main>
    </Smoother>
  )
}
