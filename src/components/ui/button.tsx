import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleUserRound } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        heroOutline:
          "rounded-full border border-hero-foreground/80 bg-hero-foreground/5 text-hero-foreground shadow-none hover:bg-hero-foreground/15",
        slider:
          "rounded-full border-2 border-hero-foreground/75 bg-ut-blue/55 text-hero-foreground shadow-lg hover:bg-ut-blue",
        utYellow:
          "rounded-xl bg-ut-yellow font-black text-ut-navy shadow-yellow hover:bg-ut-yellow/90",
        formOutline:
          "rounded-xl border border-input bg-background font-black text-ut-navy shadow-sm hover:bg-secondary",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "size-11",
        pill: "h-10 px-5 py-2",
        form: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function HeroAuthButton({
  className,
  size,
  ...props
}: Omit<ButtonProps, "variant">) {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setAuthenticated(Boolean(data.session));
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setAuthenticated(Boolean(session));
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(event);
    if (event.defaultPrevented) return;
    navigate({ to: authenticated ? "/admin" : "/auth" });
  };

  return (
    <button
      {...props}
      type={props.type ?? "button"}
      onClick={handleClick}
      className={cn(buttonVariants({ variant: "heroOutline", size, className }))}
      aria-label={authenticated ? "Buka dashboard admin" : "Masuk atau daftar"}
    >
      <CircleUserRound className="size-4" aria-hidden="true" />
      <span className="hidden sm:inline">{authenticated ? "Dashboard" : "Masuk / Daftar"}</span>
      <span className="sm:hidden">{authenticated ? "Admin" : "Masuk"}</span>
    </button>
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    if (variant === "heroOutline" && !asChild) {
      return <HeroAuthButton className={className} size={size} {...props} />;
    }

    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
