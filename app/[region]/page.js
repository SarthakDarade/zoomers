import Smoother from '@/components/Smoother'
import Hero from '@/components/Hero'
import Footer from '@/components/Footer'
import { LiveTicker, FeaturedDrop, InteractiveCategoryNav } from '@/components/HomeModules'
import { generateOrganizationSchema } from '@/lib/seo'

export const revalidate = 60 // Revalidate every minute for 'live' feel

export default function Home() {
  const orgSchema = generateOrganizationSchema()

  return (
    <Smoother>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
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
