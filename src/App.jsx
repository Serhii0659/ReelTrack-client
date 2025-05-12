import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import FriendsPage from './pages/FriendsPage';
import MyLibraryPage from './pages/MyLibraryPage';
import AboutUs from './pages/AboutUs';
import ContentDetailsPage from './pages/ContentDetailsPage';

import Footer from './components/Footer';
import Header from './components/Header';

const App = () => (
    <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
            <AppRoutes />
        </div>
        <Footer />
    </div>
);

const AppRoutes = () => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    const noHeaderPaths = ['/', '/login', '/register'];
    const shouldShowHeader = !noHeaderPaths.includes(location.pathname);

    if (loading) {
        return <div className="text-center p-4 text-white">Loading...</div>;
    }

    return (
        <>
            {shouldShowHeader && <Header />}
            <Routes>
                <Route path="/" element={<AboutUs />} />
                <Route
                    path="/login"
                    element={
                        isAuthenticated
                            ? <Navigate to="/home" replace />
                            : <LoginPage />
                    }
                />
                <Route
                    path="/register"
                    element={
                        isAuthenticated
                            ? <Navigate to="/home" replace />
                            : <RegisterPage />
                    }
                />
                <Route
                    path="/home"
                    element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/profile"
                    element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />}
                />
                <Route path="/profile/:userId" element={<ProfilePage />} />
                <Route
                    path="/friends"
                    element={isAuthenticated ? <FriendsPage /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/library"
                    element={isAuthenticated ? <MyLibraryPage /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/content/:mediaType/:tmdbId"
                    element={<ContentDetailsPage />}
                />
                <Route
                    path="*"
                    element={
                        isAuthenticated
                            ? <Navigate to="/home" replace />
                            : <Navigate to="/login" replace />
                    }
                />
            </Routes>
        </>
    );
};

export default App;