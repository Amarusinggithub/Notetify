import Features from '@/features/landing/components/feature';
import HeroSection from '@/features/landing/components/hero-section';
import Pricing from '@/features/landing/components/pricing';

export default function Landing() {
	return (
		<>
			<HeroSection />
			<Features />
			<Pricing />
		</>
	);
}
