import * as authService from "@/features/auth/services/auth-service";
import { useStore } from "@/app/store/index";
import type { FormErrors } from "@/shared/utils/helpers";
import { mapAxiosErrorToFieldErrors } from "@/shared/utils/helpers";

export const useSignUp = async (
    first_name: string,
    last_name: string,
    email: string,
    password: string,
): Promise<boolean> => {
    useStore.setState({ isLoading: true, errors: null });
    try {
        const fieldErrors: FormErrors = {};
        if (!first_name?.trim())
            fieldErrors.first_name = ["First name is required."];
        if (!last_name?.trim())
            fieldErrors.last_name = ["Last name is required."];
        if (!email?.trim()) fieldErrors.email = ["Email is required."];
        if (!password?.trim()) fieldErrors.password = ["Password is required."];
        if (password && password.length > 0 && password.length < 8)
            fieldErrors.password = [
                "Password must be at least 8 characters long.",
            ];
        if (Object.keys(fieldErrors).length) {
            useStore.setState({ errors: fieldErrors });
            return false;
        }

        const shared = await authService.signUp({
            first_name,
            last_name,
            email,
            password,
        });

        useStore.setState({
            isAuthenticated: true,
            sharedData: shared,
        });
        return true;
    } catch (error) {
        useStore.setState({
            errors: mapAxiosErrorToFieldErrors(error),
        });
        return false;
    } finally {
        useStore.setState({ isLoading: false });
    }
};

export default useSignUp;
