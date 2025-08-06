import { LoaderCircle } from 'lucide-react';
import { type FormEventHandler } from 'react';

import TextLink from '../../components/text-link';
import { Button } from '../../components/ui/button.tsx';
import { useAuth } from '../../hooks/use-auth.tsx';
import AuthLayout from '../../layouts/auth-layout';

export default function VerifyEmail() {
	const { isLoading, VerifyEmail } = useAuth();
	const submit: FormEventHandler = async (e) => {
		e.preventDefault();
		await VerifyEmail('');
	};

	return (
		<AuthLayout
			title="Verify email"
			description="Please verify your email address by clicking on the link we just emailed to you."
		>
			{status === 'verification-link-sent' && (
				<div className="mb-4 text-center text-sm font-medium text-green-600">
					A new verification link has been sent to the email address you
					provided during registration.
				</div>
			)}

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
