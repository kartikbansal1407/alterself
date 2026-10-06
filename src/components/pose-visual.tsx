const points = [
  [50, 12],
  [50, 23],
  [35, 30],
  [65, 30],
  [25, 47],
  [75, 47],
  [20, 65],
  [80, 65],
  [42, 53],
  [58, 53],
  [39, 73],
  [61, 73],
  [35, 94],
  [65, 94],
] as const;

const lines = [
  [0, 1], [1, 2], [1, 3], [2, 4], [4, 6], [3, 5], [5, 7],
  [2, 8], [3, 9], [8, 9], [8, 10], [10, 12], [9, 11], [11, 13],
] as const;

export function PoseVisual() {
  return (
    <div className="pose-stage" aria-label="Illustration of private on-device pose tracking" role="img">
      <div className="stage-grid" />
      <div className="tracking-pill"><span /> Tracking on device</div>
      <svg viewBox="0 0 100 108" aria-hidden="true">
        {lines.map(([from, to]) => (
          <line key={`${from}-${to}`} x1={points[from][0]} y1={points[from][1]} x2={points[to][0]} y2={points[to][1]} />
        ))}
        {points.map(([x, y], index) => <circle key={index} cx={x} cy={y} r={index === 0 ? 4.5 : 2.1} />)}
      </svg>
      <div className="metric-card metric-one"><span>KNEE ANGLE</span><strong>92°</strong><i>Stable</i></div>
      <div className="metric-card metric-two"><span>FORM SIGNAL</span><strong>Clear</strong><i>High confidence</i></div>
      <div className="stage-caption"><span>01</span> Your video stays on this device</div>
    </div>
  );
}

