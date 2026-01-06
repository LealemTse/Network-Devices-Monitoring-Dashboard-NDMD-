// import { useState } from "react";
import "./App.css";
import "./index.css";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Routes,
} from "react-router-dom";
import RootLayout from "./layout/RootLayout";
import Logs from "./pages/Logs.jsx";
import Settings from "./pages/Settings.jsx";
import Help from "./pages/Help.jsx";

function App() {
  // const [count, setCount] = useState(0);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="login" element={<Login />} />
        <Route path="forgot_password" element={<ForgotPassword />} />
        <Route path="logs" element={<Logs />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<Help />} />
      </Route>
    )
  );

  return (
    <div className="app-contianer">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
