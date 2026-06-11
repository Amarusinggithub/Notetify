import * as authService from "@/features/auth/services/auth-service";
import { useStore } from "@/app/store/index";
import { mapAxiosErrorToFieldErrors } from "@/shared/utils/helpers";

const useUpdatePassword = async (
    current: string,
    newPassword: string,
): Promise<boolean> => {
    useStore.setState({ isLoading: true, errors: null });
    try {
        await authService.updatePassword(current, newPassword);
        return true;
    } catch (error) {
        useStore.setState({ errors: mapAxiosErrorToFieldErrors(error) });
        return false;
    } finally {
        useStore.setState({ isLoading: false });
    }
};

export default useUpdatePassword;
