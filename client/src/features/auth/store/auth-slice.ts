import type { StoreState } from '@/app/store/index';
import { type StateCreator } from 'zustand';
import type { SharedData } from '@/shared/types';
import type { FormErrors } from '@/shared/utils/helpers';

type AuthenticationStepType = 'credentials' | 'two-factor' | 'recovery';

type AuthSliceState = {
	authenticationStep: AuthenticationStepType;
	isLoading: boolean;
	isAuthenticated: boolean;
	checkingAuth: boolean;
	errors: FormErrors | null;
	sharedData: SharedData | null;
	url: string;
};


export type AuthSliceActions = {
	setAuthenticationStep: (step: AuthenticationStepType) => void;
	setErrors: (e: FormErrors | null) => void;
	setSharedData: (s: SharedData | null) => void;
	clearErrors: () => void;
	setUrl: (url: string) => void;
};

export type AuthSlice = AuthSliceState & AuthSliceActions;

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (
	set
) => ({
	authenticationStep: 'credentials',
	isLoading: false,
	isAuthenticated: false,
	checkingAuth: true,
	errors: null,
	sharedData: null,
	url: '',
	setAuthenticationStep: (step) => set({ authenticationStep: step }),
	setUrl: (url) => set({ url }),
	setErrors: (e) => set({ errors: e }),
	clearErrors: () => set({ errors: null }),
	setSharedData: (s) => set({ sharedData: s }),
});
