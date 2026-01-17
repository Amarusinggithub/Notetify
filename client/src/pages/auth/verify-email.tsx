import { LoaderCircle } from 'lucide-react';
import { type FormEvent } from 'react';

import TextLink from '../../components/text-link';
import { Button } from '../../components/ui/button.tsx';
import AuthLayout from '../../layouts/auth-layout';
import { useStore } from '../../stores/index.ts';

export default function VerifyEmail() {
	const { isLoading, VerifyEmail, sharedData } = useStore();
	const submit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		await VerifyEmail(sharedData!.auth.user.email);
	};

	return (
		<AuthLayout
			title="Verify email"
			description="Please verify your email address by clicking on the link we just emailed to you."
		>
			{/* Status message handled elsewhere; removed undefined reference */}

			<form
				onSubmit={(e) => {
					submit(e).catch(console.error);
				}}
				className="space-y-6 text-center"
			>
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
