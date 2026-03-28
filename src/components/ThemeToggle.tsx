export default function ThemeToggle() {
  return (
    <button
      type="button"
      disabled
      aria-label="Dark theme only"
      title="Dark theme only"
      className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] shadow-[0_8px_22px_rgba(30,90,72,0.08)]"
    >
      Dark
    </button>
  )
}
