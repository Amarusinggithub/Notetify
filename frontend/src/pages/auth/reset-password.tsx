import { LoaderCircle } from 'lucide-react';
import { type FormEventHandler, useState } from 'react';
import { useParams } from 'react-router';
import type { AuthField } from 'types';
import InputError from '../../components/input-error';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../hooks/use-auth.tsx';
import AuthLayout from '../../layouts/auth-layout';

type ResetPasswordForm = {
	password: string;
	confirmPassword: string;
};

export default function ResetPassword() {
	const { token } = useParams();

	const [form, setForm] = useState<ResetPasswordForm>({
		password: '',
		confirmPassword: '',
	});

	const { isLoading, errors,PasswordReset } = useAuth();

	const submit: FormEventHandler = async (e) => {
		e.preventDefault();
await PasswordReset(token, form.password, form.confirmPassword);
	};

	function getFieldError(field: AuthField): string | undefined {
		if (!Array.isArray(errors)) return undefined;
		const error = (errors as string[]).find((err) =>
			err.startsWith(`${field}:`),
		);
		return error?.split(':')[1];
	}

	function change(e: React.ChangeEvent<HTMLInputElement>) {
		setForm({ ...form, [e.target.name]: e.target.value.trim() });
	}
	return (
		<AuthLayout
			title="Reset password"
			description="Please enter your new password below"
		>
			<form onSubmit={submit}>
				<div className="grid gap-6">
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
						{getFieldError('password') && (
							<InputError
								message={getFieldError('password')}
								className="mt-2"
							/>
						)}
					</div>

					<div className="grid gap-2">
						<Label htmlFor="confirmPassword">Confirm password</Label>
						<Input
							id="password_confirmation"
							type="password"
							name="password_confirmation"
							autoComplete="new-password"
							value={form.confirmPassword}
							className="mt-1 block w-full"
							onChange={change}
							placeholder="Confirm password"
						/>
						{getFieldError('confirmPassword') && (
							<InputError
								message={getFieldError('confirmPassword')}
								className="mt-2"
							/>
						)}
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
