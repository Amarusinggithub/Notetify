import * as authService from "@/features/auth/services/auth-service";
import { useStore } from "@/app/store/index";
import { mapAxiosErrorToFieldErrors } from "@/shared/utils/helpers";

export const usePasswordReset = async (
    token: string | undefined,
    password: string,
    email: string,
): Promise<boolean> => {
    useStore.setState({ isLoading: true, errors: null });
    try {
        if (!token || !password?.trim()) {
            useStore.setState({
                errors: { password: ["Invalid reset token or password."] },
            });
            return false;
        }
        if (password.length < 8) {
            useStore.setState({
                errors: {
                    password: ["Password must be at least 8 characters long."],
                },
            });
            return false;
        }

        await authService.passwordReset({ token, password, email });
        return true;
    } catch (error) {
        useStore.setState({ errors: mapAxiosErrorToFieldErrors(error) });
        return false;
    } finally {
        useStore.setState({ isLoading: false });
    }
};

export default usePasswordReset;
