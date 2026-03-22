import { useContext } from "react";
import { AuthContext } from "./context/AuthContext.jsx";
import LoginUser from "./pages/LoginUser.jsx";
import LoginAdmin from "./pages/LoginAdmin.jsx";
import UserApp from "./pages/UserApp.jsx";
import AdminApp from "./pages/AdminApp.jsx";

export default function App() {
  const { user, token, appMode } = useContext(AuthContext);

  if (!token) {
    if (appMode === "admin") return <LoginAdmin />;
    return <LoginUser />;
  }

  if (appMode === "admin") return <AdminApp />;
  return <UserApp />;
}