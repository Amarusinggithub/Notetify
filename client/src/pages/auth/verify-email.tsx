import { LoaderCircle } from 'lucide-react';
import { type FormEventHandler } from 'react';

import TextLink from '../../components/text-link';
import { Button } from '../../components/ui/button.tsx';
import AuthLayout from '../../layouts/auth-layout';
import { useAuthStore } from '../../stores/use-auth-store.tsx';

export default function VerifyEmail() {
	const { isLoading, VerifyEmail } = useAuthStore();
	const submit: FormEventHandler = async (e) => {
		e.preventDefault();
		await VerifyEmail('');
	};

	return (
		<AuthLayout
			title="Verify email"
			description="Please verify your email address by clicking on the link we just emailed to you."
		>
			{/* Status message handled elsewhere; removed undefined reference */}

			<form onSubmit={submit} className="space-y-6 text-center">
				<Button disabled={isLoading} variant="secondary">
					{isLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
					Resend verification email
				</Button>

				<TextLink to={'/logout'} className="mx-auto block text-sm">
					Log out
				</TextLink>
			</form>
		</AuthLayout>
	);
}
