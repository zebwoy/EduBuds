import { db } from "hatchable";
export const access = "public";
export const methods = ["POST"];
export default async function (req, res) {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  if (typeof body.website === "string" && body.website.trim()) return res.status(200).json({ ok: true, message: "Thanks for your interest!" });
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false, message: "Please enter a valid email address." });
  try { await db.query("INSERT INTO newsletter_subscribers (email, source) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING", [email, "website"]); return res.status(200).json({ ok: true, message: "Thank you! You’re on our list for future EduBuds updates." }); }
  catch (error) { console.error("Newsletter signup failed:", error && error.message ? error.message : "unknown error"); return res.status(500).json({ ok: false, message: "We couldn’t save your sign-up just now. Please try again shortly." }); }
}