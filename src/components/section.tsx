import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Optional id for anchor links (e.g. href="#moments") */
  id?: string;
  /** Whether to use a max-width container for content */
  container?: boolean;
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, id, container = true, children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        id={id}
        className={cn("w-full py-16 sm:py-24", className)}
        {...props}
      >
        {container ? (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        ) : (
          children
        )}
      </section>
    );
  }
);

Section.displayName = "Section";

export { Section };
