type StateViewProps = {
  label: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function LoadingState({ label }: StateViewProps) {
  return <div className="state state-loading">{label}</div>;
}

export function EmptyState({ label, actionLabel, onAction }: StateViewProps) {
  return (
    <div className="state">
      <p>{label}</p>
      {actionLabel ? (
        <button type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function ErrorState({ label, actionLabel = "Retry", onAction }: StateViewProps) {
  return (
    <div className="state state-error" role="alert">
      <p>{label}</p>
      {onAction ? (
        <button type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
