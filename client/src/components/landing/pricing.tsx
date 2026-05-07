import { Check } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PricingTier {
	name: string;
	price: string;
	period: string;
	description: string;
	features: string[];
	cta: string;
	highlighted?: boolean;
}

const tiers: PricingTier[] = [
	{
		name: 'Free',
		price: '$0',
		period: 'forever',
		description: 'For individuals getting started with note-taking.',
		features: [
			'Up to 50 notes',
			'Basic text editor',
			'2 notebooks',
			'Mobile & desktop access',
			'Community support',
		],
		cta: 'Get Started',
	},
	{
		name: 'Pro',
		price: '$8',
		period: '/month',
		description: 'For professionals who need more power and flexibility.',
		features: [
			'Unlimited notes',
			'Rich media editor',
			'Unlimited notebooks',
			'File attachments up to 100MB',
			'Tags & advanced search',
			'Note sharing & collaboration',
			'Priority support',
			'Offline access',
		],
		cta: 'Start Free Trial',
		highlighted: true,
	},
	{
		name: 'Team',
		price: '$16',
		period: '/user/month',
		description: 'For teams that collaborate and share knowledge.',
		features: [
			'Everything in Pro',
			'Shared workspaces',
			'Team permissions & roles',
			'Admin dashboard',
			'SSO & security controls',
			'API access',
			'Dedicated support',
			'Custom integrations',
		],
		cta: 'Contact Sales',
	},
];

function PricingCard({ tier }: { tier: PricingTier }) {
	return (
		<div
			className={cn(
				'relative flex flex-col rounded-2xl border p-8',
				tier.highlighted
					? 'border-primary bg-primary/5 shadow-lg'
					: 'border-border bg-background'
			)}
		>
			{tier.highlighted && (
				<span className="bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold">
					Most Popular
				</span>
			)}

			<div className="mb-6">
				<h3 className="text-foreground text-lg font-semibold">{tier.name}</h3>
				<div className="mt-3 flex items-baseline gap-1">
					<span className="text-foreground text-4xl font-bold tracking-tight">
						{tier.price}
					</span>
					<span className="text-muted-foreground text-sm">{tier.period}</span>
				</div>
				<p className="text-muted-foreground mt-3 text-sm leading-relaxed">
					{tier.description}
				</p>
			</div>

			<ul className="mb-8 flex-1 space-y-3">
				{tier.features.map((feature) => (
					<li key={feature} className="flex items-start gap-3">
						<Check
							className={cn(
								'mt-0.5 size-4 shrink-0',
								tier.highlighted ? 'text-primary' : 'text-muted-foreground'
							)}
						/>
						<span className="text-foreground text-sm">{feature}</span>
					</li>
				))}
			</ul>

			<Button
				asChild
				size="lg"
				variant={tier.highlighted ? 'default' : 'outline'}
				className={cn(
					'w-full',
					tier.highlighted &&
						'bg-[#e5a00d] text-black hover:bg-[#d4940c]'
				)}
			>
				<Link to="/register">{tier.cta}</Link>
			</Button>
		</div>
	);
}

export default function Pricing() {
	return (
		<section id="pricing" className="scroll-mt-20 py-16 md:py-32">
			<div className="mx-auto max-w-6xl px-6">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-foreground text-4xl font-semibold text-balance lg:text-5xl">
						Simple, transparent pricing
					</h2>
					<p className="text-muted-foreground mt-4 text-lg text-balance">
						Start for free, upgrade when you need more. No hidden fees, cancel
						anytime.
					</p>
				</div>

				<div className="mx-auto mt-12 grid max-w-sm gap-8 md:mt-16 md:max-w-none md:grid-cols-3">
					{tiers.map((tier) => (
						<PricingCard key={tier.name} tier={tier} />
					))}
				</div>
			</div>
		</section>
	);
}
