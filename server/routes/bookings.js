import { Router } from "express";
import { supabase } from "../config/supabase.js";
import { authenticateToken } from "../middleware/auth.js";
import { randomUUID } from "crypto";
const r = Router();
r.post("/", authenticateToken, async (req, res, next) => {
  try {
    const quantity = Number(req.body.quantity);
    if (
      !req.body.destination_id ||
      !req.body.visit_date ||
      quantity < 1 ||
      quantity > 20
    )
      return res
        .status(422)
        .json({ message: "Please choose a date and a valid quantity" });
    const { data: dest, error: de } = await supabase
      .from("destinations")
      .select("*")
      .eq("id", req.body.destination_id)
      .single();
    if (de) return res.status(404).json({ message: "Destination not found" });
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        user_id: req.user.id,
        destination_id: dest.id,
        visit_date: req.body.visit_date,
        quantity,
        price_per_ticket: dest.price,
        total_price: dest.price * quantity,
        status: "paid",
      })
      .select()
      .single();
    if (error) throw error;
    const { data: ticket, error: te } = await supabase
      .from("tickets")
      .insert({
        booking_id: booking.id,
        ticket_code: `TRF-${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`,
        qr_token: `TOURIFY-TICKET-${randomUUID()}`,
        status: "valid",
      })
      .select()
      .single();
    if (te) throw te;
    res.status(201).json({ booking, ticket, destination: dest });
  } catch (e) {
    next(e);
  }
});
r.get("/me", authenticateToken, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*,destinations(*),tickets(*)")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (e) {
    next(e);
  }
});
r.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*,destinations(*),tickets(*)")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .single();
    if (error) return res.status(404).json({ message: "Booking not found" });
    res.json(data);
  } catch (e) {
    next(e);
  }
});
export default r;
