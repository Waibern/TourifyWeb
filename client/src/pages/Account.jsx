import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import {
  Calendar,
  MapPin,
  Ticket as TicketIcon,
  Download,
  LogOut,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Loading, rupiah } from "../components/Shared";
function TicketCard({ t }) {
  const d = t.bookings.destinations;
  return (
    <article className="ticket-card">
      <img src={d.image_url} />
      <div>
        <span className={"status " + t.status}>{t.status}</span>
        <h3>{d.name}</h3>
        <p>
          <Calendar size={15} />
          {new Date(t.bookings.visit_date + "T00:00").toLocaleDateString(
            "en-GB",
            { day: "numeric", month: "long", year: "numeric" },
          )}
        </p>
        <p>
          <TicketIcon size={15} />
          {t.bookings.quantity} ticket{t.bookings.quantity > 1 ? "s" : ""}
        </p>
      </div>
      <Link className="button outline" to={"/tickets/" + t.id}>
        View Ticket
      </Link>
    </article>
  );
}
export function MyTickets() {
  const [list, setList] = useState(),
    [tab, setTab] = useState("upcoming");
  useEffect(() => {
    api
      .get("/tickets/me")
      .then((r) => setList(r.data))
      .catch(() => toast.error("Could not load tickets"));
  }, []);
  if (!list) return <Loading />;
  const show = list.filter((x) =>
    tab === "upcoming" ? x.status === "valid" : x.status === tab,
  );
  return (
    <main className="container page">
      <p className="kicker">YOUR ADVENTURES</p>
      <h1 className="page-title">My Tickets</h1>
      <div className="tabs">
        {[
          ["upcoming", "Upcoming"],
          ["used", "Used"],
          ["cancelled", "Cancelled"],
        ].map(([a, b]) => (
          <button
            className={tab === a ? "active" : ""}
            onClick={() => setTab(a)}
            key={a}
          >
            {b}
          </button>
        ))}
      </div>
      <div className="tickets">
        {show.map((t) => (
          <TicketCard t={t} key={t.id} />
        ))}
      </div>
      {!show.length && (
        <div className="empty">
          No {tab} tickets yet. Your next escape is waiting.
        </div>
      )}
    </main>
  );
}
export function TicketDetail() {
  const { id } = useParams(),
    [ticket, setTicket] = useState(),
    [qr, setQr] = useState("");
  useEffect(() => {
    let active = true;
    api
      .get("/tickets/" + id)
      .then(async (r) => {
        const qrImage = await QRCode.toDataURL(r.data.qr_token, {
          width: 300,
          margin: 1,
          color: { dark: "#168675", light: "#ffffff" },
        });
        if (active) {
          setTicket(r.data);
          setQr(qrImage);
        }
      })
      .catch(() => toast.error("Ticket not found"));
    return () => {
      active = false;
    };
  }, [id]);
  if (!ticket) return <Loading />;
  const b = ticket.bookings,
    d = b.destinations;
  return (
    <main className="container page ticket-detail">
      <div className="ticket-head">
        <span>TOURIFY</span>
        <b>E-TICKET</b>
      </div>
      <div className="ticket-body">
        <div>
          <span className={"status " + ticket.status}>
            {ticket.status === "valid" ? "VALID" : ticket.status}
          </span>
          <h1>{d.name}</h1>
          <p>
            <MapPin size={16} />
            {d.location}
          </p>
          <div className="ticket-data">
            <p>
              Visit date
              <b>
                {new Date(b.visit_date + "T00:00").toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </b>
            </p>
            <p>
              Quantity<b>{b.quantity} tickets</b>
            </p>
            <p>
              Ticket ID<b>{ticket.ticket_code}</b>
            </p>
            <p>
              Total paid<b>{rupiah(b.total_price)}</b>
            </p>
          </div>
        </div>
        <div className="qr">
          {qr && <img src={qr} alt="Ticket QR code" />}
          <p>Show this QR code at the entrance</p>
        </div>
      </div>
      <button className="button print" onClick={() => window.print()}>
        <Download size={18} /> Download / Print Ticket
      </button>
    </main>
  );
}
export function Profile() {
  const { user, logout } = useAuth(),
    nav = useNavigate();
  return (
    <main className="container page profile">
      <div className="profile-avatar">{user.name[0]}</div>
      <p className="kicker">YOUR PROFILE</p>
      <h1>{user.name}</h1>
      <div className="profile-card">
        <p>
          Username<b>{user.username}</b>
        </p>
        <p>
          Email<b>{user.email}</b>
        </p>
        <p>
          Account type<b>{user.role}</b>
        </p>
      </div>
      <button
        className="button danger"
        onClick={() => {
          logout();
          nav("/");
          toast.success("You have been logged out");
        }}
      >
        <LogOut size={18} />
        Logout
      </button>
    </main>
  );
}
per;
