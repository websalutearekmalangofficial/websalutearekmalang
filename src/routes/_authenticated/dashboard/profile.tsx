import { createFileRoute, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { UserProfilePage } from "@/components/user-profile-page";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }

    const { data: role, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (roleError) {
      throw new Error("Role akun tidak dapat diverifikasi.");
    }

    if (role?.role === "admin") {
      throw redirect({ to: "/admin/pendaftar" });
    }

    if (role?.role !== "user") {
      throw redirect({ to: "/auth" });
    }

    return { user: data.user };
  },
  component: UserProfileRoute,
});

function UserProfileRoute() {
  const { user } = Route.useRouteContext();
  return <UserProfilePage user={user} />;
}
