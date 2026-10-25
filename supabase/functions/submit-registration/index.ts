import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type RegistrationPayload = {
  nama?: string;
  sekolah?: string | null;
  kota?: string | null;
  email?: string | null;
  nomor_hp?: string | null;
  jalur?: string | null;
  tempat_lahir?: string | null;
  tanggal_lahir?: string | null;
  agama?: string | null;
  jenis_kelamin?: string | null;
  kewarganegaraan?: string | null;
  nama_ibu_kandung?: string | null;
  alamat_lengkap?: string | null;
  telp_rumah?: string | null;
  nomor_hp_2?: string | null;
  sosial_media?: Record<string, string>;
  jenjang_pendidikan?: string | null;
  fakultas?: string | null;
  jurusan?: string | null;
  status?: string;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json()) as RegistrationPayload;

    const nama = body.nama?.trim();
    const email = body.email?.trim() || null;
    const nomorHp = body.nomor_hp?.trim() || null;

    if (!nama) return json({ error: "Nama lengkap wajib diisi." }, 400);
    if (!email && !nomorHp) return json({ error: "Email atau nomor HP wajib diisi." }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
    if (!supabaseUrl || !secretKeysRaw) {
      console.error("Missing Supabase runtime configuration");
      return json({ error: "Konfigurasi server belum tersedia." }, 500);
    }

    const secretKeys = JSON.parse(secretKeysRaw);
    const secretKey = secretKeys.default;
    if (!secretKey) {
      console.error("Default Supabase secret key is missing");
      return json({ error: "Konfigurasi server belum tersedia." }, 500);
    }

    const admin = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await admin
      .from("registrations")
      .insert({
        nama,
        sekolah: body.sekolah ?? null,
        kota: body.kota ?? null,
        email,
        nomor_hp: nomorHp,
        jalur: body.jalur ?? null,
        tempat_lahir: body.tempat_lahir ?? null,
        tanggal_lahir: body.tanggal_lahir || null,
        agama: body.agama ?? null,
        jenis_kelamin: body.jenis_kelamin ?? null,
        kewarganegaraan: body.kewarganegaraan ?? "WNI",
        nama_ibu_kandung: body.nama_ibu_kandung ?? null,
        alamat_lengkap: body.alamat_lengkap ?? null,
        telp_rumah: body.telp_rumah ?? null,
        nomor_hp_2: body.nomor_hp_2 ?? null,
        sosial_media: body.sosial_media ?? {},
        jenjang_pendidikan: body.jenjang_pendidikan ?? null,
        fakultas: body.fakultas ?? null,
        jurusan: body.jurusan ?? null,
        status: body.status ?? "Menunggu Verifikasi",
      })
      .select("id, registration_reference")
      .single();

    if (error) {
      console.error("Registration insert failed:", error);
      return json({ error: error.message }, 400);
    }

    return json({ registration: data });
  } catch (error) {
    console.error("Unhandled registration error:", error);
    return json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan pada server." },
      500,
    );
  }
});
