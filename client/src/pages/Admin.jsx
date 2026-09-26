import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard,
  MapPinned,
  ClipboardList,
  Users,
  ScanLine,
  Ticket,
  Plus,
  Trash2,
  ArrowUpRight,
  Activity,
  Clock3,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { rupiah, Loading } from "../components/Shared";
import CameraScanner from "../components/CameraScanner";
export default function Admin() {
  const [view, setView] = useState("Dashboard"),
    [stats, setStats] = useState(),
    [data, setData] = useState([]),
    [token, setToken] = useState(""),
    [scan, setScan] = useState(),
    [checkingIn, setCheckingIn] = useState(false);
  const load = async (x) => {
    setData([]);
    try {
      if (x === "Dashboard") setStats((await api.get("/admin/stats")).data);
      else if (x === "Destinations")
        setData((await api.get("/destinations")).data);
      else if (x === "Bookings")
        setData((await api.get("/admin/bookings")).data);
      else if (x === "Users") setData((await api.get("/admin/users")).data);
    } catch {
      toast.error("Could not load dashboard data");
    }
  };
  useEffect(() => {
    load(view);
  }, [view]);
  const scanTicket = useCallback(
    async (value) => {
      const scanToken = value || token;
      if (!scanToken) return toast.error("Scan or paste a QR token first");
      try {
        setScan(
          (await api.post("/tickets/validate", { token: scanToken })).data,
        );
      } catch (e) {
        setScan(e.response?.data || { message: "INVALID TICKET" });
      }
    },
    [token],
  );
  const checkIn = async () => {
    if (!scan?.ticket?.id) return;
    setCheckingIn(true);
    try {
      await api.post(`/tickets/${scan.ticket.id}/check-in`);
      setScan({
        ...scan,
        valid: false,
        message: "CHECKED IN — TICKET USED",
        ticket: { ...scan.ticket, status: "used" },
      });
      toast.success("Guest checked in successfully");
    } catch (e) {
      toast.error(e.response?.data?.message || "Check-in failed");
    } finally {
      setCheckingIn(false);
    }
  };
  const menu = [
    ["Dashboard", LayoutDashboard],
    ["Destinations", MapPinned],
    ["Bookings", ClipboardList],
    ["Users", Users],
    ["Gate Scanner", ScanLine],
  ];
  return (
    <main className="admin">
      <aside>
        <b>
          Tourify <small>ADMIN</small>
        </b>
        <span className="admin-caption">OPERATIONS CENTER</span>
        {menu.map(([x, I]) => (
          <button
            key={x}
            onClick={() => setView(x)}
            className={view === x ? "active" : ""}
          >
            <I size={19} />
            {x}
          </button>
        ))}
        <div className="admin-side-footer">
          <span className="live-dot" />
          System live
        </div>
      </aside>
      <section className="admin-main">
        {view === "Dashboard" &&
          (!stats ? (
            <Loading />
          ) : (
            <>
              <header className="admin-hero">
                <div>
                  <p className="kicker">TOURIFY / OPERATIONS</p>
                  <h1>
                    Your destination
                    <br />
                    <i>at a glance.</i>
                  </h1>
                  <p>Here’s what’s moving across Tourify today.</p>
                </div>
                <div className="admin-date">
                  <Clock3 size={17} />
                  <span>
                    Live dashboard
                    <br />
                    <b>Updated just now</b>
                  </span>
                </div>
              </header>
              <div className="stats dashboard-stats">
                {[
                  ["Visitors", stats.users, Users, "Registered explorers"],
                  [
                    "Destinations",
                    stats.destinations,
                    MapPinned,
                    "Places to discover",
                  ],
                  [
                    "Bookings",
                    stats.bookings,
                    ClipboardList,
                    "All booking activity",
                  ],
                  ["Tickets issued", stats.tickets, Ticket, "Ready for entry"],
                  [
                    "Revenue",
                    rupiah(stats.revenue),
                    ArrowUpRight,
                    "Paid & used tickets",
                  ],
                ].map(([a, b, I, c], i) => (
                  <div key={a} className={i === 4 ? "revenue-card" : ""}>
                    <I />
                    <span>{a}</span>
                    <b>{b}</b>
                    <small>{c}</small>
                  </div>
                ))}
              </div>
              <div className="admin-panels">
                <article className="operations-card">
                  <div>
                    <p className="kicker">TODAY AT THE GATE</p>
                    <h2>
                      Ready to welcome
                      <br />
                      your next guest.
                    </h2>
                    <p>
                      Use the gate scanner to verify e-tickets securely before
                      entry.
                    </p>
                    <button
                      className="button"
                      onClick={() => setView("Gate Scanner")}
                    >
                      Open Gate Scanner <ScanLine size={17} />
                    </button>
                  </div>
                  <div className="scanner-orb">
                    <ScanLine size={55} />
                    <span>
                      QR
                      <br />
                      ENTRY
                    </span>
                  </div>
                </article>
                <article className="activity-card">
                  <p className="kicker">SYSTEM STATUS</p>
                  <h3>
                    <Activity size={18} /> Everything is on track
                  </h3>
                  <p>
                    Bookings, ticket issuing, and QR validation are connected to
                    the live API.
                  </p>
                  <div>
                    <span>
                      <Sparkles size={15} /> Ticketing is ready
                    </span>
                    <span>
                      <Users size={15} /> {stats.users} explorer
                      {stats.users === 1 ? "" : "s"} registered
                    </span>
                  </div>
                </article>
              </div>
            </>
          ))}
        {view !== "Dashboard" && (
          <>
            <p className="kicker">TOURIFY ADMIN</p>
            <h1>{view}</h1>
          </>
        )}
        {view === "Gate Scanner" && (
          <div className="scanner gate-scanner">
            <div className="scanner-mark">
              <ScanLine size={34} />
              <span>TOURIFY GATE</span>
            </div>
            <h2>Guest check-in</h2>
            <p>
              Scan a visitor’s QR ticket at the entrance. Only valid paid
              tickets for today can enter.
            </p>
            <CameraScanner onScan={scanTicket} />
            <div className="scanner-manual">
              <input
                placeholder="Paste ticket token as fallback"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <button className="button" onClick={() => scanTicket()}>
                Validate
              </button>
            </div>
            {scan && (
              <div className={scan.valid ? "scan-valid" : "scan-invalid"}>
                <b>{scan.message}</b>
                {scan.ticket && (
                  <>
                    <p>
                      {scan.ticket.bookings.destinations.name} ·{" "}
                      {scan.ticket.bookings.users?.name || "Guest"}
                    </p>
                    <p>
                      {scan.ticket.ticket_code} · Visit{" "}
                      {scan.ticket.bookings.visit_date}
                    </p>
                    {scan.valid && (
                      <button
                        className="button full check-in"
                        onClick={checkIn}
                        disabled={checkingIn}
                      >
                        {checkingIn ? "Checking in…" : "Check In Guest"}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
        {["Destinations", "Bookings", "Users"].includes(view) && (
          <Table view={view} data={data} reload={() => load(view)} />
        )}
      </section>
    </main>
  );
}
function Table({ view, data, reload }) {
  const remove = async (id) => {
    if (!confirm("Delete this destination?")) return;
    try {
      await api.delete("/destinations/" + id);
      toast.success("Destination deleted");
      reload();
    } catch {
      toast.error("Could not delete destination");
    }
  };
  const headers =
    view === "Destinations"
      ? ["Destination", "Category", "Location", "Price", ""]
      : view === "Bookings"
        ? ["Booking", "User", "Destination", "Visit date", "Status"]
        : ["Name", "Username", "Email", "Role"];
  return (
    <div className="data-table">
      <div className="table-top">
        <p>{data.length} records</p>
        {view === "Destinations" && (
          <button
            className="button small"
            onClick={() =>
              toast(
                "Destination creation is available through the protected API.",
              )
            }
          >
            <Plus size={16} />
            Add destination
          </button>
        )}
      </div>
      <table>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((x) => (
            <tr key={x.id}>
              {view === "Destinations" ? (
                <>
                  <td>
                    <img src={x.image_url} alt={x.name} />
                    {x.name}
                  </td>
                  <td>{x.category}</td>
                  <td>{x.location}</td>
                  <td>{rupiah(x.price)}</td>
                  <td>
                    <button
                      className="table-delete"
                      onClick={() => remove(x.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </>
              ) : view === "Bookings" ? (
                <>
                  <td>{x.id.slice(0, 8)}</td>
                  <td>{x.users?.name}</td>
                  <td>{x.destinations?.name}</td>
                  <td>{x.visit_date}</td>
                  <td>
                    <span className={"status " + x.status}>{x.status}</span>
                  </td>
                </>
              ) : (
                <>
                  <td>{x.name}</td>
                  <td>{x.username}</td>
                  <td>{x.email}</td>
                  <td>{x.role}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
