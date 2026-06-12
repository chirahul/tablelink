// Lightweight dependency-free SVG charts for the admin control panel.
// Server-renderable (no hooks/handlers).

const GOLD = "#B58E3C";
const GOLD_DEEP = "#8F6E2A";

function points(data: number[], w: number, h: number, pad = 6) {
  const max = Math.max(1, ...data);
  const min = Math.min(0, ...data);
  const span = max - min || 1;
  const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
  return data.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });
}

export function LineChart({
  data,
  labels,
  color = GOLD,
}: {
  data: number[];
  labels?: string[];
  color?: string;
}) {
  const W = 320;
  const H = 130;
  const pts = points(data, W, H);
  const line = pts.map((p) => p.join(",")).join(" ");
  const area = `${pts[0]?.[0] ?? 0},${H} ${line} ${pts[pts.length - 1]?.[0] ?? W},${H}`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[130px]" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`area-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#area-${color.slice(1)})`} />
        <polyline
          points={line}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={2.5} fill={color} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      {labels && (
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          {labels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function BarChart({ data, labels }: { data: number[]; labels?: string[] }) {
  const max = Math.max(1, ...data);
  return (
    <div>
      <div className="flex items-end gap-1.5 h-[130px]">
        {data.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{
              height: `${(v / max) * 100}%`,
              minHeight: 2,
              background: `linear-gradient(180deg, ${GOLD}, ${GOLD_DEEP})`,
            }}
            title={String(v)}
          />
        ))}
      </div>
      {labels && (
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          {labels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sparkline({ data, color = "#3f9b54" }: { data: number[]; color?: string }) {
  const W = 80;
  const H = 28;
  const pts = points(data, W, H, 3)
    .map((p) => p.join(","))
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-20 h-7" preserveAspectRatio="none">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export type DonutSegment = { label: string; value: number; color: string };

export function DonutChart({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: DonutSegment[];
  centerValue: string | number;
  centerLabel?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const R = 60;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="w-40 h-40 shrink-0 -rotate-90">
        <circle cx="80" cy="80" r={R} fill="none" stroke="#EAE0CC" strokeWidth="20" />
        {segments.map((s, i) => {
          const len = (s.value / total) * C;
          const el = (
            <circle
              key={i}
              cx="80"
              cy="80"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="20"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
        <text
          x="80"
          y="74"
          textAnchor="middle"
          className="rotate-90"
          transform="rotate(90 80 80)"
          fontSize="22"
          fontWeight="700"
          fill="#3A2E1C"
        >
          {centerValue}
        </text>
        {centerLabel && (
          <text
            x="80"
            y="96"
            textAnchor="middle"
            transform="rotate(90 80 80)"
            fontSize="11"
            fill="#8C7A5A"
          >
            {centerLabel}
          </text>
        )}
      </svg>
      <div className="space-y-2 text-sm">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="ml-auto font-semibold tabular-nums">
              {s.value.toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
