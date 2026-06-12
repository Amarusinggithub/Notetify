import { motion, type Variants } from 'motion/react';

const farmerSteps = [
	{
		step: '01',
		title: 'Create your listing',
		description:
			'List your fresh produce with photos, quantity, price, and availability.',
	},
	{
		step: '02',
		title: 'Receive orders',
		description:
			'Buyers find your produce and place orders directly through the platform.',
	},
	{
		step: '03',
		title: 'Arrange delivery',
		description:
			'Choose pickup or delivery. We handle logistics coordination for you.',
	},
	{
		step: '04',
		title: 'Get paid instantly',
		description:
			'Funds are released to your wallet as soon as delivery is confirmed.',
	},
];

const buyerSteps = [
	{
		step: '01',
		title: 'Browse fresh supply',
		description:
			'Search verified listings from farmers across Jamaica by produce type or parish.',
	},
	{
		step: '02',
		title: 'Place your order',
		description:
			'Order directly from farmers at fair market prices with no hidden fees.',
	},
	{
		step: '03',
		title: 'Track fulfillment',
		description: 'Real-time updates on your order from farm to your door.',
	},
	{
		step: '04',
		title: 'Pay securely',
		description:
			'Escrow-protected payments released only when you confirm receipt.',
	},
];

const container: Variants = {
	hidden: {},
	show: { transition: { staggerChildren: 0.15 } },
};

const item: Variants = {
	hidden: { opacity: 0, y: 20 },
	show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

function StepList({ steps }: { steps: typeof farmerSteps }) {
	return (
		<motion.ol
			variants={container}
			initial="hidden"
			whileInView="show"
			viewport={{ once: true, margin: '-80px' }}
			className="flex flex-col"
		>
			{steps.map((s, i) => (
				<motion.li key={s.step} variants={item} className="flex gap-5">
					<div className="flex flex-col items-center">
						<div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
							{s.step}
						</div>
						{i < steps.length - 1 && (
							<div className="bg-border mt-1 w-px flex-1" />
						)}
					</div>
					<div className="pb-8">
						<p className="text-foreground font-semibold">{s.title}</p>
						<p className="text-muted-foreground mt-1 text-sm leading-relaxed">
							{s.description}
						</p>
					</div>
				</motion.li>
			))}
		</motion.ol>
	);
}

export function HowItWorks() {
	return (
		<section className="bg-background py-24" id="how-it-works">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-16 text-center">
					<h2 className="text-foreground text-3xl font-bold sm:text-4xl">
						How It Works
					</h2>
					<p className="text-muted-foreground mt-4 text-lg">
						Simple steps to get started, whether you&apos;re a farmer or a
						buyer.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
					<div
						className="border-border bg-accent/40 rounded-2xl border p-8"
						id="for-farmers"
					>
						<div className="mb-8 flex items-center gap-3">
							<div className="bg-primary flex h-9 w-9 items-center justify-center rounded-full">
								<span className="text-sm">🌾</span>
							</div>
							<div>
								<p className="text-foreground font-semibold">For Farmers</p>
								<p className="text-muted-foreground text-xs">
									Sell your produce directly
								</p>
							</div>
						</div>
						<StepList steps={farmerSteps} />
					</div>

					<div
						className="border-border bg-muted/60 rounded-2xl border p-8"
						id="for-buyers"
					>
						<div className="mb-8 flex items-center gap-3">
							<div className="bg-secondary-foreground flex h-9 w-9 items-center justify-center rounded-full">
								<span className="text-sm">🛒</span>
							</div>
							<div>
								<p className="text-foreground font-semibold">For Buyers</p>
								<p className="text-muted-foreground text-xs">
									Source fresh produce reliably
								</p>
							</div>
						</div>
						<StepList steps={buyerSteps} />
					</div>
				</div>
			</div>
		</section>
	);
}
