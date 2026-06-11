import * as authService from "@/features/auth/services/auth-service";
import { useStore } from "@/app/store/index";
import { mapAxiosErrorToFieldErrors } from "@/shared/utils/helpers";

const useConfirmTwoFactor = async (code: string): Promise<void> => {
    useStore.setState({ isLoading: true, errors: null });
    try {
        await authService.confirmTwoFactor(code);
    } catch (error) {
        useStore.setState({ errors: mapAxiosErrorToFieldErrors(error) });
    } finally {
        useStore.setState({ isLoading: false });
    }
};

export default useConfirmTwoFactor;
