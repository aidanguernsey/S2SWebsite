import Link from "next/link";

const tabs = [
  { href: "/members", label: "Current members", short: "Current" },
  { href: "/members/exec", label: "Exec board", short: "Exec" },
  { href: "/alumni", label: "Alumni", short: "Alumni" },
];

export function MemberTabs({ active }: { active: string }) {
  return (
    <nav className="tabs" aria-label="Member lists">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`btn ${t.href === active ? "btn-dark" : "btn-outline"}`}
          aria-current={t.href === active ? "page" : undefined}
        >
          {/* Phones show the short label so all three fit on one row. */}
          <span className="label-long">{t.label}</span>
          <span className="label-short">{t.short}</span>
        </Link>
      ))}
    </nav>
  );
}
