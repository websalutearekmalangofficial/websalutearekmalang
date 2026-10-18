import { createFileRoute } from "@tanstack/react-router";
import { KemahasiswaanEditorial } from "@/components/kemahasiswaan-editorial";

export const Route = createFileRoute("/kemahasiswaan")({
  head: () => ({
    meta: [
      { title: "Kemahasiswaan - SALUT Arek Malang" },
      {
        name: "description",
        content:
          "Galeri aktivitas, kreativitas, berita, dan informasi kemahasiswaan SALUT Arek Malang.",
      },
    ],
  }),
  component: KemahasiswaanEditorial,
});
