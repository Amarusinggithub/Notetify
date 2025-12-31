import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import InputError from '../../components/input-error';
import TextLink from '../../components/text-link';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import AuthLayout from '../../layouts/auth-layout';
import { useStore } from '../../stores/index.ts';
import { forgatPasswordSchema } from '../../utils/validators.ts';

type ForgotPasswordProps = {
	status?: string;
};

type ForgotPasswordForm = {
	email: string;
};

export default function ForgotPassword({ status }: ForgotPasswordProps) {
	const [form, setForm] = useState<ForgotPasswordForm>({
		email: '',
	});

	const { isLoading, errors, setErrors, ForgotPassword } = useStore();

	const change = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value.trim() });
	};

	const submit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrors(null);

		const validationResult = forgatPasswordSchema.safeParse(form);

		if (!validationResult.success) {
			const formattedErrors = validationResult.error.flatten().fieldErrors;
			setErrors(formattedErrors);
			return;
		}
		await ForgotPassword(form.email);
	};

	return (
		<AuthLayout
			title="Forgot password"
			description="Enter your email to receive a password reset link"
		>
			<h1> Forgot password</h1>

			{status && (
				<div className="mb-4 text-center text-sm font-medium text-green-600">
					{status}
				</div>
			)}

			<div className="space-y-6">
				<form onSubmit={submit} noValidate>
					<div className="grid gap-2">
						<Label htmlFor="email">Email address</Label>
						<Input
							id="email"
							type="email"
							name="email"
							autoComplete="off"
							value={form.email}
							autoFocus
							onChange={(e) => change(e)}
							placeholder="email@example.com"
						/>
						{errors?.email && (
							<InputError message={errors.email[0]} className="mt-2" />
						)}
					</div>

					<div className="my-6 flex items-center justify-start">
						<Button className="w-full" disabled={isLoading}>
							{isLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
							Email password reset link
						</Button>
					</div>
				</form>

				<div className="text-muted-foreground space-x-1 text-center text-sm">
					<span>Or, return to</span>
					<TextLink to={'/login'}>log in</TextLink>
				</div>
			</div>
		</AuthLayout>
	);
}
