import * as authService from "@/features/auth/services/auth-service";
import { useStore } from "@/app/store/index";
import type { FormErrors } from "@/shared/utils/helpers";
import { mapAxiosErrorToFieldErrors } from "@/shared/utils/helpers";

type LoginParams = { email: string; password: string; remember?: boolean };

 const useLogin = async (params: LoginParams): Promise<boolean> => {
    useStore.setState({ isLoading: true, errors: null });
    try {
        const fe: FormErrors = {};
        if (!params.email?.trim()) fe.email = ["Email is required."];
        if (!params.password?.trim()) fe.password = ["Password is required."];
        if (Object.keys(fe).length) {
            useStore.setState({ errors: fe });
            return false;
        }

        const shared = await authService.login(params);

        if ("requiresTwoFactor" in shared) {
            useStore.setState({ authenticationStep: "two-factor" });
        } else if ("requiresRecovery" in shared) {
            useStore.setState({ authenticationStep: "recovery" });
        } else {
            useStore.setState({ isAuthenticated: true, sharedData: shared });
            if (!shared.auth.user.is_verified) {
                await authService.verifyEmail();
            }
        }

        return true;
    } catch (error) {
        useStore.setState({ errors: mapAxiosErrorToFieldErrors(error) });
        return false;
    } finally {
        useStore.setState({ isLoading: false });
    }
};

export default useLogin;
