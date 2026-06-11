import * as authService from "@/features/auth/services/auth-service";
import { useStore } from "@/app/store/index";
import type { SharedData } from "@/shared/types";
import { mapAxiosErrorToFieldErrors } from "@/shared/utils/helpers";

const useSubmitRecoveryCode = async (
    recoveryCode: string,
): Promise<SharedData> => {
    useStore.setState({ isLoading: true, errors: null });
    try {
        const shared = await authService.submitRecoveryCode(recoveryCode);
        useStore.setState({
            isAuthenticated: true,
            sharedData: shared,
            authenticationStep: "credentials",
        });
        return shared;
    } catch (error) {
        useStore.setState({ errors: mapAxiosErrorToFieldErrors(error) });
        throw error;
    } finally {
        useStore.setState({ isLoading: false });
    }
};
export default useSubmitRecoveryCode;
