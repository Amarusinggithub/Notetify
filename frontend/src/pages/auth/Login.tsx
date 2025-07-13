import React, { useState } from 'react';
import { useAuth } from '../../hooks/use-auth.tsx';
import type { AuthField } from 'types';
import InputError from '../../components/input-error';
import TextLink from '../../components/text-link';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import AuthLayout from '../../layouts/auth-layout';
import { LoaderCircle } from 'lucide-react';
import { Checkbox } from '../../components/ui/checkbox.tsx';

type LoginForm = {
	email: string;
	password: string;
	remember: boolean;
};

interface LoginProps {
	status?: string;
	canResetPassword: boolean;
}

const Login = ({ status, canResetPassword }: LoginProps) => {
	const [form, setForm] = useState<LoginForm>({
		email: '',
		password: '',
		remember: false,
	});
	const { Login, isLoading, errors } = useAuth();

	const change = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value.trim() });
	};

	const submit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		await Login(form.email,form.password);
	};

	function getFieldError(field: AuthField): string | undefined {
		if (!errors) return undefined;
		const error = errors.find((err) => err.startsWith(`${field}:`));
		return error ? error.split(':')[1] : undefined;
	}

	return (
		<AuthLayout
			title="Log in to your account"
			description="Enter your email and password below to log in"
		>
			<h1>Log in</h1>

			<form className="flex flex-col gap-6" onSubmit={submit}>
				<div className="grid gap-6">
					<div className="grid gap-2">
						<Label htmlFor="email">Email address</Label>
						<Input
							id="email"
							type="email"
							required
							autoFocus
							tabIndex={1}
							name="email"
							autoComplete="email"
							value={form.email}
							onChange={change}
							placeholder="email@example.com"
						/>
						{getFieldError('email') && (
							<InputError message={getFieldError('email')} className="mt-2" />
						)}
					</div>

					<div className="grid gap-2">
						<div className="flex items-center">
							<Label htmlFor="password">Password</Label>
							{canResetPassword && (
								<TextLink
									to={'/reset-password'}
									className="ml-auto text-sm"
									tabIndex={5}
								>
									Forgot password?
								</TextLink>
							)}
						</div>
						<Input
							id="password"
							type="password"
							required
							tabIndex={2}
							name="password"
							autoComplete="current-password"
							value={form.password}
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

					<div className="flex items-center space-x-3">
						<Checkbox
							id="remember"
							name="remember"
							checked={form.remember}
							onClick={() => setForm({ ...form, ['remember']: !form.remember })}
							tabIndex={3}
						/>
						<Label htmlFor="remember">Remember me</Label>
					</div>

					<Button
						type="submit"
						className="mt-4 w-full"
						tabIndex={4}
						disabled={isLoading}
					>
						{isLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
						Log in
					</Button>
				</div>

				<div className="text-muted-foreground text-center text-sm">
					Don't have an account?{' '}
					<TextLink to="/register" tabIndex={5}>
						Sign up
					</TextLink>
				</div>
			</form>

			{status && (
				<div className="mb-4 text-center text-sm font-medium text-green-600">
					{status}
				</div>
			)}
		</AuthLayout>
	);
};

export default Login;
