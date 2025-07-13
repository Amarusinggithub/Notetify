import { Button } from ' ../../components/ui/button';
import useAuth from 'hooks/use-auth';
import { LoaderCircle } from 'lucide-react';
import { type FormEventHandler, useState } from 'react';
import type { AuthField } from 'types';
import InputError from '../../components/input-error';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import AuthLayout from '../../layouts/auth-layout';

interface ResetPasswordProps {
	token: string;
	email: string;
}

type ResetPasswordForm = {
	token: string;
	email: string;
	password: string;
	password_confirmation: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
	const [form, setForm] = useState<ResetPasswordForm>({
		token: token,
		email: email,
		password: '',
		password_confirmation: '',
	});

	const { isLoading, errors } = useAuth();

	const submit: FormEventHandler = (e) => {
		e.preventDefault();
	};

	function getFieldError(field: AuthField): string | undefined {
		if (!errors) return undefined;
		const error = errors.find((err) => err.startsWith(`${field}:`));
		return error ? error.split(':')[1] : undefined;
	}

	function change(e: React.ChangeEvent<HTMLInputElement>) {
		setForm({ ...form, [e.target.name]: e.target.value.trim() });
	}
	return (
		<AuthLayout title="Reset password" description="Please enter your new password below">
			<h1 title="Reset password" />

			<form onSubmit={submit}>
				<div className="grid gap-6">
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							name="email"
							autoComplete="email"
							value={form.email}
							className="mt-1 block w-full"
							readOnly
							onChange={change}
						/>
						{getFieldError('email') && <InputError message={getFieldError('email')} className="mt-2" />}
					</div>

					<div className="grid gap-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							name="password"
							autoComplete="new-password"
							value={form.password}
							className="mt-1 block w-full"
							autoFocus
							onChange={change}
							placeholder="Password"
						/>
						{getFieldError('password') && <InputError message={getFieldError('password')} className="mt-2" />}
					</div>

					<div className="grid gap-2">
						<Label htmlFor="password_confirmation">Confirm password</Label>
						<Input
							id="password_confirmation"
							type="password"
							name="password_confirmation"
							autoComplete="new-password"
							value={form.password_confirmation}
							className="mt-1 block w-full"
							onChange={change}
							placeholder="Confirm password"
						/>
						{getFieldError('confirmPassword') && <InputError message={getFieldError('confirmPassword')} className="mt-2" />}
					</div>

					<Button type="submit" className="mt-4 w-full" disabled={isLoading}>
						{isLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
						Reset password
					</Button>
				</div>
			</form>
		</AuthLayout>
	);
}
