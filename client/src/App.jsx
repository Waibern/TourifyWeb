import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Shared";
import ChatWidget from "./components/ChatWidget";
import { Protected, Admin as AdminRoute } from "./components/Routes";
import { Home, Destinations, Detail } from "./pages/Public";
import { Login, Register } from "./pages/Auth";
import { MyTickets, TicketDetail, Profile } from "./pages/Account";
import AdminPage from "./pages/Admin";
const Shell = ({ children }) => {
  const location = useLocation();
  const publicPage =
    location.pathname === "/" ||
    location.pathname === "/destinations" ||
    location.pathname.startsWith("/destinations/");
  return (
    <>
      <Navbar />
      {children}
      {publicPage && <ChatWidget />}
    </>
  );
};
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="*"
        element={
          <Shell>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/destinations/:slug" element={<Detail />} />
              <Route
                path="/tickets"
                element={
                  <Protected>
                    <MyTickets />
                  </Protected>
                }
              />
              <Route
                path="/tickets/:id"
                element={
                  <Protected>
                    <TicketDetail />
                  </Protected>
                }
              />
              <Route
                path="/profile"
                element={
                  <Protected>
                    <Profile />
                  </Protected>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                }
              />
            </Routes>
          </Shell>
        }
      />
    </Routes>
  );
}
