import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SPECIALTIES, useStore } from "@/lib/store";
import { DoctorCard, btnPrimary, input } from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediBook — Find & Book Trusted Doctors" },
      { name: "description", content: "Search doctors by name, specialty or city and book an appointment in a few taps." },
      { property: "og:title", content: "MediBook — Find & Book Trusted Doctors" },
      { property: "og:description", content: "Search doctors by name, specialty or city and book an appointment in a few taps." },
    ],
  }),
  component: Home,
});

const ICONS: Record<string, string> = { Cardiology: "♥", Dermatology: "✿", Dentistry: "◡", Pediatrics: "☺", Neurology: "✺", "General Medicine": "✚" };

function Home() {
  const { doctors } = useStore();
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const featured = [...doctors].sort((a, b) => b.rating - a.rating).slice(0, 3);
  return (
    <div className="space-y-14">
      <section className="rounded-[2rem] bg-hero p-6 md:p-12">
        <h1 className="max-w-2xl font-display text-4xl font-bold leading-tight md:text-5xl">Good care starts with the <span className="text-primary">right doctor</span>.</h1>
        <p className="mt-3 max-w-xl text-lg text-muted-foreground">Search trusted specialists near you and book a visit in under a minute.</p>
        <form onSubmit={(e) => { e.preventDefault(); nav({ to: "/search", search: { q } }); }} className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row" role="search">
          <label htmlFor="home-q" className="sr-only">Search doctors</label>
          <input id="home-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Doctor name, specialty or city…" className={input} />
          <button className={btnPrimary}>Search</button>
        </form>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold">Popular specialties</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {SPECIALTIES.map((s) => (
            <Link key={s} to="/search" search={{ specialty: s }} className="flex items-center gap-4 rounded-3xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary">
              <span aria-hidden className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-2xl text-primary">{ICONS[s]}</span>
              <span className="text-lg font-semibold">{s}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold">Featured doctors</h2>
          <Link to="/search" className="font-semibold text-primary">See all →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{featured.map((d) => <DoctorCard key={d.id} d={d} />)}</div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold">How it works</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {[["Search", "Find a doctor by specialty, city or name."], ["Pick a slot", "Choose a date and time that suits you."], ["Confirm", "Enter your details and get an appointment ID."]].map(([t, d], i) => (
            <li key={t} className="rounded-3xl border bg-card p-6 shadow-soft">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary font-bold text-primary-foreground">{i + 1}</span>
              <h3 className="mt-4 text-xl font-semibold">{t}</h3>
              <p className="mt-1 text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
