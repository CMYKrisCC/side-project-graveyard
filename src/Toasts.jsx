export default function Toasts({ toasts, onAction, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toasts">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          <p>{toast.message}</p>
          {toast.actionLabel && (
            <button type="button" onClick={() => onAction(toast)}>
              {toast.actionLabel}
            </button>
          )}
          <button
            type="button"
            className="toast__dismiss"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
