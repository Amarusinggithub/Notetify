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

type RegisterForm = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
};

const Register = () => {
	const [form, setForm] = useState<RegisterForm>({
		email: '',
		password: '',
		firstName: '',
		lastName: '',
		confirmPassword: '',

	});


	const { SignUp, isLoading,errors } = useAuth();

	function change(e: React.ChangeEvent<HTMLInputElement>) {
		setForm({ ...form, [e.target.name]: e.target.value.trim() });
	}

	async function submit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		if (form.password !== form.confirmPassword) {
			console.log('Passwords do not match');
			return;
		}

		await SignUp(form.firstName,form.lastName,form.email,form.password,form.confirmPassword);
	}

    	function getFieldError(field: AuthField): string | undefined {
				if (!errors) return undefined;
				const error = errors.find((err) => err.startsWith(`${field}:`));
				return error ? error.split(':')[1] : undefined;
			}

	return (
		<AuthLayout title="Create an account" description="Enter your details below to create your account">
			<h1>Register</h1>
			<form className="flex flex-col gap-6" onSubmit={(e) => submit(e)}>
				<div className="grid gap-6">
					<div className="grid gap-2">
						<Label htmlFor="first-name">First Name</Label>
						<Input
							id="first-name"
							type="text"
							required
							autoFocus
							tabIndex={1}
							name="firstName"
							autoComplete="firstName"
							value={form.firstName}
							onChange={change}
							disabled={isLoading}
							placeholder="first name"
						/>
						{getFieldError('firstName') && <InputError message={getFieldError('firstName')} className="mt-2" />}
					</div>
					<div className="grid gap-2">
						<Label htmlFor="last-name">Last Name</Label>
						<Input
							id="last-name"
							type="text"
							required
							autoFocus
							name="lastName"
							tabIndex={2}
							autoComplete="lastName"
							value={form.lastName}
							onChange={change}
							disabled={isLoading}
							placeholder="last name"
						/>
						{getFieldError('lastName') && <InputError message={getFieldError('lastName')} className="mt-2" />}
					</div>

					<div className="grid gap-2">
						<Label htmlFor="email">Email address</Label>
						<Input
							id="email"
							type="email"
							required
							tabIndex={3}
							name="email"
							autoComplete="email"
							value={form.email}
							onChange={change}
							disabled={isLoading}
							placeholder="email@example.com"
						/>
						{getFieldError('email') && <InputError message={getFieldError('email')} className="mt-2" />}
					</div>

					<div className="grid gap-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							required
							tabIndex={4}
							name="password"
							autoComplete="new-password"
							value={form.password}
							onChange={change}
							disabled={isLoading}
							placeholder="Password"
						/>
						{getFieldError('password') && <InputError message={getFieldError('password')} className="mt-2" />}
					</div>

					<div className="grid gap-2">
						<Label htmlFor="password-confirmation">Confirm password</Label>
						<Input
							id="password_confirmation"
							type="password"
							required
							tabIndex={5}
							name="confirmPassword"
							autoComplete="new-password"
							value={form.confirmPassword}
							onChange={change}
							disabled={isLoading}
							placeholder="Confirm password"
						/>
						{getFieldError('confirmPassword') && <InputError message={getFieldError('confirmPassword')} className="mt-2" />}
					</div>

					<Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={isLoading}>
						{isLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
						Create account
					</Button>
				</div>

				<div className="text-muted-foreground text-center text-sm">
					Already have an account?{' '}
					<TextLink to={'/login'} tabIndex={6}>
						Log in
					</TextLink>
				</div>
			</form>
		</AuthLayout>
	);
};

export default Register;
