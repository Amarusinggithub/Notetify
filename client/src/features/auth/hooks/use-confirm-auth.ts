import * as authService from "@/features/auth/services/auth-service";
import { useStore } from "@/app/store/index";

// Plain function (not a hook) so it can also run from the store's
// `onRehydrateStorage` callback, which is not a React component.
export const confirmAuth = async (): Promise<void> => {
    try {
        const shared = await authService.getMe();
        useStore.setState({ isAuthenticated: true, sharedData: shared });
    } catch (error) {
        const status = (error as { response?: { status?: number } })?.response
            ?.status;
        if (status === 401 || status === 403) {
            useStore.setState({ isAuthenticated: false, sharedData: null });
        }
    } finally {
        useStore.setState({ checkingAuth: false });
    }
};

const useConfirmAuth = () => {
    confirmAuth();
};

export default useConfirmAuth;
