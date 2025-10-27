import { Navigate } from 'react-router';

const Settings = () => {
    // Redirect bare /settings route to General settings
    return <Navigate to="/settings/general" replace />;
};

export default Settings;
