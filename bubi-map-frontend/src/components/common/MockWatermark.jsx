// Overlays a "MOCK DATA" watermark on its children when `active` is true,
// so placeholder values are never mistaken for real data.
export function MockWatermark({ active = true, children, className = "" }) {
  return (
    <div className={`mock-watermark-host ${className}`.trim()}>
      {children}
      {active && (
        <div
          className="mock-watermark"
          aria-hidden="true"
          title="Ez a vezérlő mintaadatokat jelenít meg"
        >
          <span>MOCK DATA</span>
        </div>
      )}
    </div>
  );
}
