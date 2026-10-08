import Link from "next/link";

const tabs = [
  { href: "/members", label: "Current members" },
  { href: "/members/exec", label: "Exec board" },
  { href: "/alumni", label: "Alumni" },
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
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
