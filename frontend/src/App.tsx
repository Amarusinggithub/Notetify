import "./App.css";
import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage.tsx";
import LoginPage from "./features/auth/pages/LoginPage.tsx";
import SignUpPage from "./features/auth/pages/SignUpPage.tsx";
import MainPage from "./pages/MainPage.tsx";
import PrivateRoute from "./features/auth/components/privateRoute.tsx";
import { initializeCSRFToken } from "./services/CSRFTokenService.tsx";
import AuthProvider from "./features/auth/hooks/useAuth.tsx";
import { SideNavProvider } from "./context/SideNavContext.tsx";
import { NoteProvider } from "./features/notes/hooks/useNote.tsx";
import { TagProvider } from "./features/notes/hooks/useTag.tsx";

export default function App() {
  useEffect(() => {
    const initialize = async () => {
      await initializeCSRFToken();
    };
    initialize();
  }, []);

  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <SideNavProvider>
            <NoteProvider>
              <TagProvider>
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
                      element={<MainPage />}
                      errorElement={<ErrorPage />}
                    />
                  </Route>
                </Routes>
              </TagProvider>
            </NoteProvider>
          </SideNavProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}
