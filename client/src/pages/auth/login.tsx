import { LoaderCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import AuthProviderButtons from '@/components/shared/auth-provider-buttons';
import InputError from '@/components/shared/input-error.tsx';
import TextLink from '@/components/shared/text-link.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import AuthLayout from '@/layouts/auth-layout.tsx';
import { useStore } from '@/stores/index.ts';
import { loginSchema } from '@/utils/validators.ts';

type LoginForm = {
	email: string;
	password: string;
	remember?: boolean;
};

const Login = () => {
	const navigate = useNavigate();

	const [form, setForm] = useState<LoginForm>({
		email: '',
		password: '',
		remember: false,
	});
	const { Login, isLoading, errors, setErrors } = useStore();

	const change = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value.trim() });
	};

	const submit = async (e: React.SubmitEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		setErrors(null);

		const validationResult = loginSchema.safeParse(form);

		if (!validationResult.success) {
			const formattedErrors = validationResult.error.flatten().fieldErrors;
			setErrors(formattedErrors);
			return;
		}
		const success = await Login(form);

		if (!success) {
			return;
		}

		// Get the current state after Login completes
		const currentStep = useStore.getState().authenticationStep;

		if (currentStep === 'two-factor') {
			await navigate('/two-factor');
		} else if (currentStep === 'recovery') {
			await navigate('/recovery');
		} else {
			await navigate('/', {
				replace: true,
			});
		}
	};

	function handleOnLinkClick() {
		setErrors(null);
	}
	return (
		<AuthLayout
			title="Log in to your account"
			description="Enter your email and password below to log in"
		>
			<form
				className="flex flex-col gap-6"
				onSubmit={(e) => {
					submit(e).catch(console.error);
				}}
			>
				<div className="grid gap-6">
					{errors?.general && <InputError message={errors.general[0]} />}
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
						{errors?.email && (
							<InputError message={errors.email[0]} className="mt-2" />
						)}
					</div>

					<div className="grid gap-2">
						<div className="flex items-center">
							<Label htmlFor="password">Password</Label>

							<TextLink
								to={'/forgot-password'}
								className="ml-auto text-sm"
								tabIndex={5}
							>
								Forgot password?
							</TextLink>
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
						{errors?.password && (
							<InputError message={errors.password[0]} className="mt-2" />
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

				<div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
					<span className="bg-background text-muted-foreground relative z-10 px-2">
						Or continue with
					</span>
				</div>
				<AuthProviderButtons />

				<div className="text-muted-foreground text-center text-sm">
					{"Don't have an account?"}{' '}
					<TextLink onClick={handleOnLinkClick} to="/register" tabIndex={5}>
						Sign up
					</TextLink>
				</div>
			</form>
		</AuthLayout>
	);
};

export default Login;
