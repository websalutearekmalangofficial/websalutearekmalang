import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Memberikan peran admin kepada pengguna pertama yang meminta,
 * hanya jika belum ada admin sama sekali di sistem.
 */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("claim_first_admin");

    if (error) {
      console.error("[admin] claimFirstAdmin failed", error.message);
      return { ok: false as const, message: "Gagal menetapkan admin." };
    }

    if (!data) {
      return {
        ok: false as const,
        message: "Admin sudah terdaftar. Hubungi admin untuk mendapatkan akses.",
      };
    }

    return { ok: true as const, message: "Akun Anda sekarang menjadi admin." };
  });
