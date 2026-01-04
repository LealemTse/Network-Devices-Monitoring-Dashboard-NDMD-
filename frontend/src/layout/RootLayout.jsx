import { Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <div className="main">
      <Outlet />
    </div>
  );
}
