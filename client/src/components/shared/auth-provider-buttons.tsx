import { AppleIcon, GoogleIcon, MetaIcon } from '@/components/shared/auth-provider-icons';
import { Button } from '@/components/ui/button';

const providers = [
	{ Icon: AppleIcon, label: 'Continue with Apple' },
	{ Icon: GoogleIcon, label: 'Continue with Google' },
	{ Icon: MetaIcon, label: 'Continue with Meta' },
] as const;

export default function AuthProviderButtons() {
	return (
		<div className="grid grid-cols-3 gap-4">
			{providers.map(({ Icon, label }) => (
				<Button key={label} variant="outline" className="w-full">
					<Icon />
					<span className="sr-only">{label}</span>
				</Button>
			))}
		</div>
	);
}
