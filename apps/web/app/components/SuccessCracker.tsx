export function SuccessCracker({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`success-cracker-stage${compact ? " success-cracker-stage--compact" : ""}`}
      aria-hidden="true"
    >
      <span className="success-cracker-piece success-cracker-piece--left-1" />
      <span className="success-cracker-piece success-cracker-piece--left-2" />
      <span className="success-cracker-piece success-cracker-piece--left-3" />
      <span className="success-cracker-piece success-cracker-piece--left-4" />
      <span className="success-cracker-piece success-cracker-piece--left-5" />
      <span className="success-cracker-piece success-cracker-piece--right-1" />
      <span className="success-cracker-piece success-cracker-piece--right-2" />
      <span className="success-cracker-piece success-cracker-piece--right-3" />
      <span className="success-cracker-piece success-cracker-piece--right-4" />
      <span className="success-cracker-piece success-cracker-piece--right-5" />
    </div>
  );
}
