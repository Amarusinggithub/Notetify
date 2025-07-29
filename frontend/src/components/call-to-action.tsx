import { Link } from 'react-router';
import { Button } from './ui/button';

export default function CallToAction() {
	return (
		<section id="contacts" className="scroll-mt-20 py-16 md:py-32">
			<div className="mx-auto max-w-5xl px-6">
				<div className="text-center">
					<h2 className="text-4xl font-semibold text-balance lg:text-5xl">
						Start Building
					</h2>
					<p className="mt-4">Libero sapiente aliquam quibusdam aspernatur.</p>

					<div className="mt-12 flex flex-wrap justify-center gap-4">
						<Button asChild size="lg">
							<Link to="/">
								<span>Get Started</span>
							</Link>
						</Button>

						<Button asChild size="lg" variant="outline">
							<Link to="/">
								<span>Book Demo</span>
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
