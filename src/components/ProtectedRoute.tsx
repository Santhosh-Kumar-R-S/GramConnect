import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const userInfo = localStorage.getItem('userInfo');

    // If no user info is found, redirect to login
    if (!userInfo) {
        return <Navigate to="/login" replace />;
    }

    // If user is authenticated, render the child routes
    return <Outlet />;
};

export default ProtectedRoute;
