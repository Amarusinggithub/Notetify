import "./App.css";
import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import SignUpPage from "./pages/SignUpPage.tsx";
import App from "./pages/MainPage.tsx";
import PrivateRoute from "./components/privateRoute.tsx";
import { initializeCSRFToken } from "./services/CSRFTokenService.ts";
import AuthProvider from "./hooks/useAuth.tsx";
import { SideNavProvider } from "./hooks/useSideNav.tsx";
import { NoteProvider } from "./hooks/useNote.tsx";
import { TagProvider } from "./hooks/useTag.tsx";
import { ErrorBoundary } from "react-error-boundary";

export default function RootApp() {
  useEffect(() => {
    const initialize = async () => {
      await initializeCSRFToken();
    };
    initialize();
  }, []);

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Router>
        <NoteProvider>
          <TagProvider>
            <AuthProvider>
              <SideNavProvider>
                <Routes>
                  <Route
                    path="/login"
                    element={<LoginPage />}
                    errorElement={<ErrorPage />}
                  />
                  <Route
                    path="/signup"
                    element={<SignUpPage />}
                    errorElement={<ErrorPage />}
                  />

                  <Route element={<PrivateRoute />}>
                    <Route
                      path="/"
                      element={<App />}
                      errorElement={<ErrorPage />}
                    />
                  </Route>
                </Routes>
              </SideNavProvider>
            </AuthProvider>
          </TagProvider>
        </NoteProvider>
      </Router>
    </ErrorBoundary>
  );
}
