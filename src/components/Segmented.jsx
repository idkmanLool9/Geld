export default function Segmented({ label, options, value, onChange, icons = false }) {
  return (
    <div role="group" aria-label={label} className="segmented">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          aria-label={o.ariaLabel}
          className={`seg ${icons ? 'seg-icon' : ''} ${value === o.value ? 'is-on' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
