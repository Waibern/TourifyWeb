import { Router } from "express";
import { supabase } from "../config/supabase.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
const r = Router();
r.use(authenticateToken, requireAdmin);
r.get("/stats", async (req, res, next) => {
  try {
    const [users, dests, bookings, tickets, revenue] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("destinations").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase.from("tickets").select("*", { count: "exact", head: true }),
      supabase
        .from("bookings")
        .select("total_price")
        .in("status", ["paid", "used"]),
    ]);
    res.json({
      users: users.count,
      destinations: dests.count,
      bookings: bookings.count,
      tickets: tickets.count,
      revenue: (revenue.data || []).reduce((n, x) => n + x.total_price, 0),
    });
  } catch (e) {
    next(e);
  }
});
r.get("/bookings", async (req, res, next) => {
  try {
    let q = supabase
      .from("bookings")
      .select("*,users(name,username),destinations(name)")
      .order("created_at", { ascending: false });
    if (req.query.status) q = q.eq("status", req.query.status);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data);
  } catch (e) {
    next(e);
  }
});
r.patch("/bookings/:id/status", async (req, res, next) => {
  try {
    if (!["pending", "paid", "cancelled", "used"].includes(req.body.status))
      return res.status(422).json({ message: "Invalid status" });
    const { data, error } = await supabase
      .from("bookings")
      .update({ status: req.body.status })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (e) {
    next(e);
  }
});
r.get("/users", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id,name,username,email,role,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (e) {
    next(e);
  }
});
export default r;
