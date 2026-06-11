import * as authService from "@/features/auth/services/auth-service";
import { useStore } from "@/app/store/index";
import { mapAxiosErrorToFieldErrors } from "@/shared/utils/helpers";

const useRegenerateRecoveryCodes = async (): Promise<string[] | undefined> => {
    useStore.setState({ isLoading: true, errors: null });
    try {
        return await authService.regenerateRecoveryCodes();
    } catch (error) {
        useStore.setState({ errors: mapAxiosErrorToFieldErrors(error) });
        return undefined;
    } finally {
        useStore.setState({ isLoading: false });
    }
};

export default useRegenerateRecoveryCodes;
