import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts, type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider } from "@/lib/store";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">This page doesn't exist.</p>
        <Link to="/" className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Go home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MediBook — Book Doctor Appointments" },
      { name: "description", content: "Find trusted doctors and book appointments in minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Lexend:wght@500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

const NAV = [
  { to: "/", label: "Home", icon: "⌂" },
  { to: "/search", label: "Find Doctors", icon: "⌕" },
  { to: "/profile", label: "Doctor Profile", icon: "☺" },
  { to: "/book", label: "Book", icon: "✚" },
  { to: "/patient", label: "My Appointments", icon: "☰" },
  { to: "/admin", label: "Doctor & Admin", icon: "⚙" },
] as const;

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [open, setOpen] = useState(false);
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <div className="min-h-screen bg-background md:flex">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card px-4 py-3 md:hidden">
            <Logo />
            <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu" className="rounded-xl border-2 px-4 py-2 font-semibold">{open ? "Close" : "Menu"}</button>
          </header>
          <aside className={`${open ? "block" : "hidden"} border-b bg-card p-4 md:sticky md:top-0 md:block md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r`}>
            <div className="mb-8 hidden md:block"><Logo /></div>
            <nav aria-label="Main" className="flex flex-col gap-1">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} activeOptions={{ exact: n.to === "/" }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-lg font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  activeProps={{ className: "!bg-primary !text-primary-foreground" }}>
                  <span aria-hidden className="w-5 text-center">{n.icon}</span>{n.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-10"><Outlet /></main>
        </div>
      </StoreProvider>
    </QueryClientProvider>
  );
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">✚</span>
      Medi<span className="text-primary">Book</span>
    </Link>
  );
}
