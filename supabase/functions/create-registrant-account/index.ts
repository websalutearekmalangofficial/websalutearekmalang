import { withSupabase } from "npm:@supabase/server@1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

function normalizeUsername(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return Response.json({ error: "Method tidak diizinkan." }, { status: 405, headers: corsHeaders });

    const admin = ctx.supabaseAdmin;
    const callerId = ctx.userClaims?.sub;
    if (!callerId) return Response.json({ error: "Sesi admin tidak ditemukan." }, { status: 401, headers: corsHeaders });

    const { data: adminRole } = await admin.from("user_roles").select("id").eq("user_id", callerId).eq("role", "admin").maybeSingle();
    if (!adminRole) return Response.json({ error: "Hanya admin yang dapat membuat akses user." }, { status: 403, headers: corsHeaders });

    let body: { registration_id?: string; username?: string } = {};
    try { body = await req.json(); } catch { return Response.json({ error: "Payload tidak valid." }, { status: 400, headers: corsHeaders }); }

    const registrationId = body.registration_id?.trim();
    if (!registrationId) return Response.json({ error: "ID pendaftaran wajib diisi." }, { status: 400, headers: corsHeaders });

    const { data: registration, error: registrationError } = await admin.from("registrations")
      .select("id,nama,email,status,user_id,registration_reference").eq("id", registrationId).single();

    if (registrationError || !registration) return Response.json({ error: "Data pendaftar tidak ditemukan." }, { status: 404, headers: corsHeaders });
    if (registration.user_id) return Response.json({ error: "Pendaftar ini sudah memiliki akses user." }, { status: 409, headers: corsHeaders });
    if (registration.status.toLowerCase() !== "terverifikasi") return Response.json({ error: "Akses user hanya dapat dibuat setelah status pendaftar Terverifikasi." }, { status: 400, headers: corsHeaders });

    const supplied = normalizeUsername(body.username ?? "");
    const fallback = normalizeUsername((registration.nama || "user").split(/\s+/).slice(0, 2).join(".") + (registration.registration_reference ? "." + registration.registration_reference.slice(-6).toLowerCase() : ""));
    let username = supplied || fallback;
    if (username.length < 4) username = "user." + registration.id.slice(0, 8);

    const { data: existingUsername } = await admin.from("profiles").select("id").ilike("username", username).maybeSingle();
    if (existingUsername) return Response.json({ error: "Username sudah digunakan. Silakan gunakan username lain." }, { status: 409, headers: corsHeaders });

    const password = generatePassword();
    const loginEmail = username + "@auth.salutarekmalang.com";

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: loginEmail, password, email_confirm: true,
      user_metadata: { full_name: registration.nama, username, registration_id: registration.id, account_type: "registrant" },
    });
    if (createError || !created.user) return Response.json({ error: createError?.message ?? "Gagal membuat akun user." }, { status: 400, headers: corsHeaders });

    const userId = created.user.id;
    const profileResult = await admin.from("profiles").upsert({
      id: userId, email: registration.email, full_name: registration.nama, username,
      must_change_password: true, first_login_at: null,
    });
    if (profileResult.error) {
      await admin.auth.admin.deleteUser(userId);
      return Response.json({ error: "Profil user gagal dibuat: " + profileResult.error.message }, { status: 500, headers: corsHeaders });
    }

    const roleResult = await admin.from("user_roles").insert({ user_id: userId, role: "user" });
    if (roleResult.error) {
      await admin.auth.admin.deleteUser(userId);
      return Response.json({ error: "Role user gagal dibuat: " + roleResult.error.message }, { status: 500, headers: corsHeaders });
    }

    const registrationResult = await admin.from("registrations").update({ user_id: userId }).eq("id", registration.id).is("user_id", null);
    if (registrationResult.error || !registrationResult.data?.length) {
      await admin.from("user_roles").delete().eq("user_id", userId);
      await admin.auth.admin.deleteUser(userId);
      return Response.json({ error: registrationResult.error?.message ?? "Pendaftaran gagal ditautkan ke akun user." }, { status: 500, headers: corsHeaders });
    }

    return Response.json({
      ok: true, user_id: userId, username, password,
      registration_reference: registration.registration_reference,
      message: "Akses user berhasil dibuat. Simpan username dan password ini karena password awal hanya ditampilkan sekali.",
    }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }),
};
