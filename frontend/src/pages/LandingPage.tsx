import FeatureSection from '../components/FeatureSection'
import HeroSection from '../components/HeroSection'
import Navigation from '../components/Navigation'
import PageFooter from '../components/PageFooter'
import ProcessSection from '../components/ProcessSection'

export default function LandingPage() {
  return (
    <div className="page">
      <Navigation />
      <main>
        <HeroSection />
        <FeatureSection />
        <ProcessSection />
      </main>
      <PageFooter />
    </div>
  )
}
