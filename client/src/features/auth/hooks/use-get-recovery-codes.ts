import * as authService from "@/features/auth/services/auth-service";
import { useStore } from "@/app/store/index";
import { mapAxiosErrorToFieldErrors } from "@/shared/utils/helpers";

const useGetRecoveryCodes = async (): Promise<string[] | undefined> => {
    useStore.setState({ isLoading: true, errors: null });
    try {
        return await authService.getRecoveryCodes();
    } catch (error) {
        useStore.setState({ errors: mapAxiosErrorToFieldErrors(error) });
        return undefined;
    } finally {
        useStore.setState({ isLoading: false });
    }
};

export default useGetRecoveryCodes;
