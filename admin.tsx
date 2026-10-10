import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TIMES, addDays, prettyDate, todayISO, useStore } from "@/lib/store";
import { Badge, Card, PageTitle, btnDanger, btnOutline, input } from "@/components/ui-kit";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Doctor & Admin Dashboard — MediBook" },
      { name: "description", content: "Today's schedule, patient queue, slot management and platform administration." },
      { property: "og:title", content: "Doctor & Admin Dashboard — MediBook" },
      { property: "og:description", content: "Today's schedule, patient queue, slot management and platform administration." },
    ],
  }),
  component: Dash,
});

function Dash() {
  const [mode, setMode] = useState<"doctor" | "admin">("doctor");
  return (
    <div>
      <PageTitle title={mode === "doctor" ? "Doctor dashboard" : "Admin dashboard"} />
      <div role="tablist" className="mb-6 inline-flex rounded-2xl bg-secondary p-1">
        {(["doctor", "admin"] as const).map((m) => (
          <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
            className={`rounded-xl px-6 py-2 text-lg font-semibold capitalize ${mode === m ? "bg-card text-primary shadow-soft" : "text-muted-foreground"}`}>{m} view</button>
        ))}
      </div>
      {mode === "doctor" ? <DoctorView /> : <AdminView />}
    </div>
  );
}

function DoctorView() {
  const { doctors, appointments, setStatus, toggleBlock } = useStore();
  const [docId, setDocId] = useState(doctors[0]?.id ?? "");
  const [day, setDay] = useState(todayISO());
  const d = doctors.find((x) => x.id === docId) ?? doctors[0];
  if (!d) return <Card>No doctors.</Card>;
  const t = todayISO();
  const today = appointments.filter((a) => a.doctorId === d.id && a.date === t).sort((a, b) => TIMES.indexOf(a.time) - TIMES.indexOf(b.time));
  const queue = today.filter((a) => a.status === "Confirmed");
  const dayAppts = appointments.filter((a) => a.doctorId === d.id && a.date === day && a.status !== "Cancelled");
  return (
    <div className="space-y-6">
      <label className="block max-w-sm"><span className="mb-1 block font-semibold">Signed in as</span>
        <select value={d.id} onChange={(e) => setDocId(e.target.value)} className={input}>{doctors.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-display text-xl font-semibold">Today's schedule · {prettyDate(t)}</h2>
          {!today.length && <p className="text-muted-foreground">No appointments today.</p>}
          <ul className="space-y-2">
            {today.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 rounded-2xl bg-secondary/60 p-3">
                <div><p className="font-semibold">{a.time} — {a.patientName}</p><p className="text-sm text-muted-foreground">{a.reason}</p></div>
                <Badge status={a.status} />
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-3 font-display text-xl font-semibold">Patient queue ({queue.length})</h2>
          {!queue.length && <p className="text-muted-foreground">Queue is empty.</p>}
          <ol className="space-y-2">
            {queue.map((a, i) => (
              <li key={a.id} className="flex items-center justify-between gap-2 rounded-2xl border p-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-primary font-bold text-primary-foreground">{i + 1}</span>
                  <div><p className="font-semibold">{a.patientName}, {a.age}</p><p className="text-sm text-muted-foreground">{a.time} · {a.phone}</p></div>
                </div>
                <button onClick={() => setStatus(a.id, "Completed")} className={`${btnOutline} py-2`}>Mark done</button>
              </li>
            ))}
          </ol>
        </Card>
      </div>
      <Card>
        <h2 className="mb-1 font-display text-xl font-semibold">Slot management</h2>
        <p className="mb-4 text-muted-foreground">Tap a free slot to block it; tap again to reopen. Booked slots can't be changed.</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {Array.from({ length: 7 }, (_, i) => addDays(i)).map((iso) => (
            <button key={iso} onClick={() => setDay(iso)} aria-pressed={day === iso}
              className={`rounded-xl border-2 px-4 py-2 font-semibold ${day === iso ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>
              {new Date(iso + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {TIMES.map((tm) => {
            const booked = dayAppts.find((a) => a.time === tm);
            const blocked = d.blocked.includes(`${day}|${tm}`);
            return (
              <button key={tm} disabled={!!booked} onClick={() => toggleBlock(d.id, `${day}|${tm}`)}
                className={`rounded-xl border-2 p-3 text-left ${booked ? "border-primary/30 bg-secondary" : blocked ? "border-destructive/40 bg-destructive/10" : "bg-card hover:border-primary"}`}>
                <span className="block font-semibold">{tm}</span>
                <span className={`text-sm ${booked ? "text-primary" : blocked ? "text-destructive" : "text-success"}`}>{booked ? `Booked: ${booked.patientName}` : blocked ? "Blocked" : "Available"}</span>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function AdminView() {
  const { doctors, patients, appointments, removeDoctor, removePatient, reset } = useStore();
  const stats = [["Patients", patients.length], ["Doctors", doctors.length], ["Appointments", appointments.length], ["Confirmed", appointments.filter((a) => a.status === "Confirmed").length]];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([k, v]) => <Card key={k}><p className="text-muted-foreground">{k}</p><p className="font-display text-4xl font-bold text-primary">{v}</p></Card>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-display text-xl font-semibold">Doctors</h2>
          <ul className="divide-y">
            {doctors.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-2 py-3">
                <div><p className="font-semibold">{d.name}</p><p className="text-sm text-muted-foreground">{d.specialty} · {d.location}</p></div>
                <button onClick={() => confirm(`Remove ${d.name}?`) && removeDoctor(d.id)} className={`${btnDanger} py-2`}>Remove</button>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-3 font-display text-xl font-semibold">Patients</h2>
          <ul className="divide-y">
            {patients.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 py-3">
                <div><p className="font-semibold">{p.name}, {p.age}</p><p className="text-sm text-muted-foreground">{p.phone} · {appointments.filter((a) => a.phone === p.phone).length} appointments</p></div>
                <button onClick={() => confirm(`Remove ${p.name}?`) && removePatient(p.id)} className={`${btnDanger} py-2`}>Remove</button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <button onClick={() => confirm("Reset all data to the demo defaults?") && reset()} className={btnOutline}>Reset demo data</button>
    </div>
  );
}
