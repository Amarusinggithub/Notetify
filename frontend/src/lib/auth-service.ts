import { CreateUser } from '../types/index.ts';
import axiosInstance from './axios-service.ts';

export const login = async (user: CreateUser) => {
	try {
		const response = await axiosInstance.post('login/', {
			...user,
		});

		console.log('Login successful. Tokens stored.');
		return response;
	} catch (error: any) {
		console.error(
			'Login error:',
			error.response ? error.response.data : error.message,
		);
		throw error;
	}
};

export const signUp = async (user: CreateUser) => {
	try {
		const response = await axiosInstance.post('register/', {
			...user,
		});

		console.log('Signup successful. Tokens stored.');
		return response;
	} catch (error: any) {
		console.error(
			'Signup error:',
			error.response ? error.response.data : error.message,
		);
		throw error;
	}
};

export const logout = async () => {
	try {
		const response = await axiosInstance.post('logout/');
		return response;
	} catch (error: any) {
		console.error(
			'Logout error:',
			error.response ? error.response.data : error.message,
		);
		throw error;
	}
};

export const verifyAuth = async () => {
	try {
		const response = await axiosInstance.get('auth/me/');
		return response;
	} catch (error: any) {
		throw error;
	}
};
