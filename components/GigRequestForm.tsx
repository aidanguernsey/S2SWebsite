"use client";

import { useState } from "react";

type Status = { kind: "idle" | "sending" | "ok" | "error"; message?: string };

export function GigRequestForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus({ kind: "sending" });

    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/gig-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Something went wrong.");
      form.reset();
      setStatus({ kind: "ok", message: "Thanks! We'll be in touch soon." });
    } catch (err) {
      setStatus({ kind: "error", message: (err as Error).message });
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        Your name
        <input name="name" required autoComplete="name" />
      </label>
      <label>
        Email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Event type
        <select name="eventType" defaultValue="" required>
          <option value="" disabled>
            Choose one…
          </option>
          <option>Birthday</option>
          <option>Campus event</option>
          <option>Private party</option>
          <option>Other</option>
        </select>
      </label>
      <label>
        Event date
        <input name="date" type="date" />
      </label>
      <label className="full">
        Location
        <input name="location" />
      </label>
      <label className="full">
        Tell us more
        <textarea name="details" rows={4} />
      </label>
      {/* Honeypot: real people never see or fill this, bots usually do. */}
      <label className="visually-hidden" aria-hidden="true">
        Leave blank
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <button
        type="submit"
        className="btn btn-accent"
        disabled={status.kind === "sending"}
        style={{ justifySelf: "start" }}
      >
        {status.kind === "sending" ? "Sending…" : "Send request"}
      </button>
      {status.message && (
        <p className={`form-status ${status.kind}`} role="status">
          {status.message}
        </p>
      )}
    </form>
  );
}
