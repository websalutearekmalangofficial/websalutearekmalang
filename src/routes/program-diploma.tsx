import { createFileRoute } from "@tanstack/react-router";
import { ProgramLevelPage } from "@/components/program-level-page";

export const Route = createFileRoute("/program-diploma")({
  head: () => ({ meta: [{ title: "Program Diploma - SALUT Arek Malang" }, { name: "description", content: "Informasi Program Diploma Universitas Terbuka melalui SALUT Arek Malang." }] }),
  component: () => <ProgramLevelPage program="Diploma" credential="D3 / D4" slug="program-diploma" />,
});
