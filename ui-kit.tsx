import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { TIMES, addDays, useStore, type Doctor, type Status } from "@/lib/store";

export function Avatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const initials = name.replace("Dr. ", "").split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <div aria-hidden className={`grid shrink-0 place-items-center rounded-2xl bg-secondary font-display font-semibold text-primary ${size === "lg" ? "h-28 w-28 text-3xl" : "h-16 w-16 text-xl"}`}>
      {initials}
    </div>
  );
}

export function Stars({ value }: { value: number }) {
  return <span className="font-semibold text-warning" aria-label={`Rated ${value} out of 5`}>★ <span className="text-foreground">{value.toFixed(1)}</span></span>;
}

export function Badge({ status }: { status: Status }) {
  const cls = { Confirmed: "bg-secondary text-primary", Completed: "bg-success/15 text-success", Cancelled: "bg-destructive/10 text-destructive" }[status];
  return <span className={`rounded-full px-3 py-1 text-sm font-semibold ${cls}`}>{status}</span>;
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-3xl font-bold md:text-4xl">{title}</h1>
      {sub && <p className="mt-1 text-lg text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border bg-card p-5 shadow-soft ${className}`}>{children}</div>;
}

export const btn = "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 disabled:opacity-50 disabled:cursor-not-allowed";
export const btnPrimary = `${btn} bg-primary text-primary-foreground hover:bg-primary/90`;
export const btnOutline = `${btn} border-2 border-primary/30 bg-card text-primary hover:bg-secondary`;
export const btnDanger = `${btn} border-2 border-destructive/30 bg-card text-destructive hover:bg-destructive/10`;
export const input = "w-full rounded-xl border-2 bg-card px-4 py-3 text-base outline-none focus:border-primary focus:ring-4 focus:ring-ring/30";

export function DoctorCard({ d }: { d: Doctor }) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Avatar name={d.name} />
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold">{d.name}</h3>
          <p className="font-medium text-primary">{d.specialty}</p>
          <p className="text-sm text-muted-foreground">{d.qualifications}</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div><dt className="text-muted-foreground">Experience</dt><dd className="font-semibold">{d.experience} years</dd></div>
        <div><dt className="text-muted-foreground">Fee</dt><dd className="font-semibold">₹{d.fee}</dd></div>
        <div><dt className="text-muted-foreground">Rating</dt><dd><Stars value={d.rating} /></dd></div>
        <div><dt className="text-muted-foreground">Location</dt><dd className="font-semibold">{d.location}</dd></div>
        <div className="col-span-2"><dt className="text-muted-foreground">Languages</dt><dd className="font-semibold">{d.languages.join(", ")}</dd></div>
      </dl>
      <div className="mt-auto grid grid-cols-2 gap-2">
        <Link to="/profile" search={{ id: d.id }} className={btnOutline}>View Profile</Link>
        <Link to="/book" search={{ doctorId: d.id }} className={btnPrimary}>Book Now</Link>
      </div>
    </Card>
  );
}

export function SlotPicker({ doctorId, value, onChange }: {
  doctorId: string; value: { date: string; time: string } | null; onChange: (v: { date: string; time: string }) => void;
}) {
  const { isTaken } = useStore();
  const days = Array.from({ length: 14 }, (_, i) => addDays(i));
  const [date, setDate] = useState(value?.date ?? days[0]);
  return (
    <div>
      <p className="mb-2 font-semibold">1. Choose a date</p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {days.map((iso) => {
          const d = new Date(iso + "T00:00:00");
          const free = TIMES.filter((t) => !isTaken(doctorId, iso, t)).length;
          const active = iso === date;
          return (
            <button key={iso} type="button" onClick={() => setDate(iso)} aria-pressed={active}
              className={`rounded-2xl border-2 p-2 text-center transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/50"}`}>
              <span className="block text-xs uppercase">{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
              <span className="block text-xl font-bold">{d.getDate()}</span>
              <span className={`block text-xs ${active ? "" : "text-muted-foreground"}`}>{free} free</span>
            </button>
          );
        })}
      </div>
      <p className="mb-2 mt-5 font-semibold">2. Choose a time</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {TIMES.map((t) => {
          const taken = isTaken(doctorId, date, t);
          const active = value?.date === date && value.time === t;
          return (
            <button key={t} type="button" disabled={taken} onClick={() => onChange({ date, time: t })} aria-pressed={active}
              className={`rounded-xl border-2 px-3 py-3 font-semibold transition-colors ${taken ? "cursor-not-allowed bg-muted text-muted-foreground line-through" : active ? "border-primary bg-primary text-primary-foreground" : "bg-card text-primary hover:bg-secondary"}`}>
              {t}{taken && <span className="sr-only"> (taken)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
