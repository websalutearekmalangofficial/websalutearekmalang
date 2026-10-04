import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";

import { fetchSiteLogoUrl } from "@/lib/site-settings";

type SiteLogoProps = {
  className?: string;
  imageClassName?: string;
  alt?: string;
};

export function SiteLogo({
  className = "",
  imageClassName = "",
  alt = "Logo Sentra Layanan UT Arek Malang",
}: SiteLogoProps) {
  const logoQuery = useQuery({
    queryKey: ["site-logo"],
    queryFn: fetchSiteLogoUrl,
    staleTime: 60_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: 1,
  });

  if (logoQuery.data) {
    return (
      <span className={`flex min-w-0 shrink-0 items-center ${className}`}>
        <img
          src={logoQuery.data}
          alt={alt}
          className={`block h-auto max-h-14 w-auto max-w-full object-contain ${imageClassName}`}
          loading="eager"
          decoding="async"
          onError={(event) => {
            event.currentTarget.style.display = "none";
            event.currentTarget.nextElementSibling?.removeAttribute("hidden");
          }}
        />
        <span hidden className="shrink-0" aria-hidden="true">
          <Building2 className="size-9" />
        </span>
      </span>
    );
  }

  return (
    <span className={`flex shrink-0 items-center ${className}`} aria-hidden="true">
      <Building2 className={`size-9 ${imageClassName}`} />
    </span>
  );
}
