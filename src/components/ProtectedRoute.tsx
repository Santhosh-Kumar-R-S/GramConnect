import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const userInfoStr = localStorage.getItem('userInfo');

    // If no user info is found, redirect to login
    if (!userInfoStr) {
        return <Navigate to="/login" replace />;
    }

    // If roles are specified, check the user's role
    if (allowedRoles && allowedRoles.length > 0) {
        try {
            const userInfo = JSON.parse(userInfoStr);
            const userRole = userInfo?.user?.role || userInfo?.role;
            
            if (!allowedRoles.includes(userRole)) {
                // Redirect to the correct dashboard based on their actual role
                if (userRole === 'farmer') {
                    return <Navigate to="/farmer/dashboard" replace />;
                } else if (userRole === 'admin') {
                    return <Navigate to="/admin/dashboard" replace />;
                } else {
                    return <Navigate to="/consumer/dashboard" replace />;
                }
            }
        } catch {
            return <Navigate to="/login" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
