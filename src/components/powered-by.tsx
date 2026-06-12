import Image from "next/image";
import { cn } from "@/lib/utils";
import lwLogo from "@/assets/lw-logo.png";

/** Subtle "Powered by LumenWorks" attribution → https://www.lumenworks.co.in */
export function PoweredBy({
  className,
  logoClassName,
}: {
  className?: string;
  logoClassName?: string;
}) {
  return (
    <a
      href="https://www.lumenworks.co.in"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Powered by LumenWorks"
      className={cn(
        "group inline-flex items-center gap-1.5 text-muted-foreground/70 hover:text-muted-foreground transition-colors",
        className
      )}
    >
      <span className="text-[11px] tracking-wide">Powered by</span>
      <Image
        src={lwLogo}
        alt="LumenWorks"
        className={cn(
          "h-3.5 w-auto opacity-60 group-hover:opacity-100 transition-opacity",
          logoClassName
        )}
      />
    </a>
  );
}
