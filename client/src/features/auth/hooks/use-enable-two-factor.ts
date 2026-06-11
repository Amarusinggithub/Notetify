import * as authService from "@/features/auth/services/auth-service";
import { useStore } from "@/app/store/index";
import { mapAxiosErrorToFieldErrors } from "@/shared/utils/helpers";

 const useEnableTwoFactor = async (): Promise<void> => {
    useStore.setState({ isLoading: true, errors: null });
    try {
        await authService.enableTwoFactor();
    } catch (error) {
        useStore.setState({ errors: mapAxiosErrorToFieldErrors(error) });
    } finally {
        useStore.setState({ isLoading: false });
    }
};

export default useEnableTwoFactor;
