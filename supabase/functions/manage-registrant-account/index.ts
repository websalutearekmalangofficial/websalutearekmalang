import { createClient } from "npm:@supabase/supabase-js@2";

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

export default {
  async fetch(req: Request) {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return Response.json({ error: "Method tidak diizinkan." }, { status: 405, headers: corsHeaders });

    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return Response.json({ error: "Sesi admin tidak ditemukan." }, { status: 401, headers: corsHeaders });

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceRoleKey) return Response.json({ error: "Konfigurasi Supabase Function belum lengkap." }, { status: 500, headers: corsHeaders });

    const token = authorization.replace(/^Bearer\s+/i, "");
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } });
    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data: authData, error: authError } = await userClient.auth.getUser(token);
    const callerId = authData.user?.id;
    if (authError || !callerId) return Response.json({ error: "Sesi login tidak valid atau sudah kedaluwarsa. Silakan login ulang." }, { status: 401, headers: corsHeaders });

    const { data: adminRole } = await admin.from("user_roles").select("id").eq("user_id", callerId).eq("role", "admin").maybeSingle();
    if (!adminRole) return Response.json({ error: "Hanya admin yang dapat mengelola akun user." }, { status: 403, headers: corsHeaders });

    let body: { registration_id?: string; action?: "status" | "reset_password" } = {};
    try { body = await req.json(); } catch { return Response.json({ error: "Payload tidak valid." }, { status: 400, headers: corsHeaders }); }

    const registrationId = body.registration_id?.trim();
    if (!registrationId) return Response.json({ error: "ID pendaftaran wajib diisi." }, { status: 400, headers: corsHeaders });

    const { data: registration, error: registrationError } = await admin.from("registrations").select("id,nama,email,status,user_id,registration_reference").eq("id", registrationId).single();
    if (registrationError || !registration || !registration.user_id) return Response.json({ error: "Pendaftar belum memiliki akun user." }, { status: 404, headers: corsHeaders });

    const { data: profile, error: profileError } = await admin.from("profiles").select("id,username,must_change_password,first_login_at").eq("id", registration.user_id).single();
    if (profileError || !profile) return Response.json({ error: "Profil akun user tidak ditemukan." }, { status: 404, headers: corsHeaders });

    const { data: authUser, error: authUserError } = await admin.auth.admin.getUserById(registration.user_id);
    if (authUserError || !authUser.user) return Response.json({ error: "Akun Auth user tidak ditemukan." }, { status: 404, headers: corsHeaders });

    if (body.action === "reset_password") {
      const password = generatePassword();
      const { error: updateAuthError } = await admin.auth.admin.updateUserById(registration.user_id, { password });
      if (updateAuthError) return Response.json({ error: "Password gagal direset: " + updateAuthError.message }, { status: 400, headers: corsHeaders });

      const { error: updateProfileError } = await admin.from("profiles").update({ must_change_password: true, first_login_at: null }).eq("id", registration.user_id);
      if (updateProfileError) return Response.json({ error: "Password sudah berubah, tetapi status wajib ganti password gagal diperbarui: " + updateProfileError.message }, { status: 500, headers: corsHeaders });

      return Response.json({
        ok: true,
        action: "reset_password",
        user_id: registration.user_id,
        username: profile.username,
        password,
        registration_reference: registration.registration_reference,
        must_change_password: true,
        message: "Password berhasil direset. Password baru hanya ditampilkan sekali dan wajib diganti user saat login.",
      }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return Response.json({
      ok: true,
      action: "status",
      user_id: registration.user_id,
      username: profile.username,
      must_change_password: profile.must_change_password,
      first_login_at: profile.first_login_at,
      last_sign_in_at: authUser.user.last_sign_in_at ?? null,
      created_at: authUser.user.created_at ?? null,
      registration_reference: registration.registration_reference,
    }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  },
};