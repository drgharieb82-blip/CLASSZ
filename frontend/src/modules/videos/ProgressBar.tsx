type ProgressBarProps = {
  value: number;
  label?: string;
  showValue?: boolean;
};

export function ProgressBar({ value, label = "Progress", showValue = true }: ProgressBarProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));

  return (
    <div>
      {(label || showValue) && (
        <div className="mb-3 flex items-center justify-between gap-3 text-sm">
          {label && <span className="font-semibold text-[#CBD5E1]">{label}</span>}
          {showValue && <span className="font-semibold text-[#F8FAFC]">{normalizedValue}%</span>}
        </div>
      )}
      <div
        className="h-2 overflow-hidden rounded-full bg-white/[0.08]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalizedValue}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#A855F7]"
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
}
