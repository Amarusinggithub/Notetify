import { z } from 'zod';

export const registerSchema = z
	.object({
		first_name: z
			.string()
			.min(3, { message: 'First Name must be at least 3 characters long.' }),
		last_name: z
			.string()
			.min(3, { message: 'Last Name must be at least 3 characters long.' }),
		email: z.email({ message: 'Please enter a valid email address.' }),
		password: z
			.string()
			.min(8, { message: 'Password must be at least 8 characters long.' }),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match.',
		path: ['confirmPassword'],
	});

export const loginSchema = z.object({
	email: z.email({ message: 'Please enter a valid email address.' }),
	password: z
		.string()
		.min(8, { message: 'Password must be at least 8 characters long.' }),
});

export const forgatPasswordSchema = z.object({
	email: z.email({ message: 'Please enter a valid email address.' }),
});

export const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, { message: 'Password must be at least 8 characters long.' }),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match.',
		path: ['confirmPassword'],
	});

export const verifyEmailSchema = z.object({
	email: z.email({ message: 'Please enter a valid email address.' }),
});

export const confirmPasswordSchema = z.object({
	password: z
		.string()
		.min(8, { message: 'Password must be at least 8 characters long.' }),
});
