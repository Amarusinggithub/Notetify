import * as authService from "@/features/auth/services/auth-service";
import { useStore } from "@/app/store/index";
import { mapAxiosErrorToFieldErrors } from "@/shared/utils/helpers";

const useForgotPassword = async (email: string): Promise<void | null> => {
    useStore.setState({ isLoading: true, errors: null });
    try {
        if (!email?.trim()) {
            useStore.setState({ errors: { email: ["Email is required."] } });
            return null;
        }

        const token = await authService.forgotPassword(email);
        return token;
    } catch (error) {
        useStore.setState({ errors: mapAxiosErrorToFieldErrors(error) });
        return null;
    } finally {
        useStore.setState({ isLoading: false });
    }
};

export default useForgotPassword;
