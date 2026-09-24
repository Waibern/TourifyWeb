import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  MapPin,
  Star,
  Search,
  Menu,
  Ticket,
  UserRound,
  Home,
  LogOut,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
export const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
export function Logo() {
  return (
    <Link className="logo" to="/">
      <img src="/tourify-logo.png" alt="Tourify" />
    </Link>
  );
}
export function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <>
      <header className="nav">
        <Logo />
        <nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/destinations">Destinations</NavLink>
          {user && <NavLink to="/tickets">My Tickets</NavLink>}
          <a href="#about">About</a>
        </nav>
        <div className="nav-user">
          {user ? (
            <>
              <Link to="/profile" className="avatar">
                {user.name[0]}
              </Link>
              <span>{user.name.split(" ")[0]}</span>
              {user.role === "admin" && (
                <Link className="admin-link" to="/admin">
                  Admin
                </Link>
              )}
              <button
                className="icon-btn"
                onClick={() => {
                  logout();
                  nav("/");
                }}
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link className="button small" to="/login">
              Login
            </Link>
          )}
        </div>
      </header>
      <nav className="mobile-nav">
        <NavLink to="/">
          <Home />
          Home
        </NavLink>
        <NavLink to="/destinations">
          <Search />
          Discover
        </NavLink>
        <NavLink to="/tickets">
          <Ticket />
          Tickets
        </NavLink>
        <NavLink to={user ? "/profile" : "/login"}>
          <UserRound />
          Account
        </NavLink>
      </nav>
    </>
  );
}
export function DestinationCard({ d }) {
  return (
    <article className="destination-card">
      <Link to={`/destinations/${d.slug}`} className="card-image">
        <img src={d.image_url} alt={d.name} />
        <span className="category-tag">{d.category}</span>
        <span className="rating">
          <Star size={14} fill="currentColor" /> {d.rating}
        </span>
      </Link>
      <div className="card-content">
        <p className="eyebrow">
          <MapPin size={14} />
          {d.location}
        </p>
        <h3>{d.name}</h3>
        <p className="description">{d.description}</p>
        <div className="card-bottom">
          <strong>
            <small>STARTING AT</small>
            {rupiah(d.price)}
          </strong>
          <Link className="text-link" to={`/destinations/${d.slug}`}>
            <span>See details</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
export function Footer() {
  return (
    <footer id="about">
      <div>
        <Logo />
        <p>
          Easier booking, anywhere. Discover the best of Indonesia with a ticket
          made simple.
        </p>
      </div>
      <div>
        <b>Explore</b>
        <Link to="/destinations">Destinations</Link>
        <Link to="/tickets">My Tickets</Link>
      </div>
      <div>
        <b>Tourify</b>
        <span>Smart Tourism E-Ticketing</span>
        <span>© 2026 Tourify</span>
      </div>
    </footer>
  );
}
export function Loading() {
  return (
    <div className="loading">
      <span></span>Finding beautiful places…
    </div>
  );
}
