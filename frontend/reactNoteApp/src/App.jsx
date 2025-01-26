import "./App.css";
import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage.jsx";
import LoginPage from "./features/auth/pages/LoginPage.jsx";
import SignUpPage from "./features/auth/pages/SignUpPage.jsx";
import MainPage from "./pages/MainPage.jsx";
import PrivateRoute from "./features/auth/components/privateRoute.jsx";
import { initializeCSRFToken } from "./services/CSRFTokenService.jsx";
import AuthProvider from "./features/auth/hooks/useAuth.jsx";
import { SideNavProvider } from "./context/SideNavContext.jsx";
import { NoteProvider } from "./features/notes/hooks/useNote.jsx";
import { TagProvider } from "./features/notes/hooks/useTag.jsx";

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
                  <Route
                    path="/"
                    element={<MainPage />}
                    errorElement={<ErrorPage />}
                  />

                  <Route element={<PrivateRoute />}></Route>
                </Routes>
              </TagProvider>
            </NoteProvider>
          </SideNavProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}
