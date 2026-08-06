import {
  SparklesIcon,
  XMarkIcon,
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: "break" | "info" | "success" | "error";
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastOverlayProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastOverlay({ toasts, onDismiss }: ToastOverlayProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-40 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none select-none">
      {toasts.map((toast) => {
        const type = toast.type || "info";

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-zinc-900/95 dark:bg-zinc-900/95 text-white border border-zinc-700/60 shadow-2xl backdrop-blur-xl rounded-2xl p-3.5 flex items-start gap-3 transition-all duration-300 animate-slide-in"
          >
            <div
              className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                type === "success"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : type === "error"
                  ? "bg-rose-500/20 text-rose-400"
                  : type === "break"
                  ? "bg-sky-500/20 text-sky-400"
                  : "bg-sky-500/20 text-sky-400"
              }`}
            >
              {type === "success" && <CheckCircleIcon className="w-4 h-4" />}
              {type === "error" && <ExclamationTriangleIcon className="w-4 h-4" />}
              {type === "break" && <SparklesIcon className="w-4 h-4" />}
              {type === "info" && <BellIcon className="w-4 h-4" />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-white truncate">{toast.title}</h4>
              <p className="text-[11px] text-zinc-300 leading-snug mt-0.5">{toast.message}</p>

              {toast.actionLabel && toast.onAction && (
                <button
                  onClick={() => {
                    toast.onAction?.();
                    onDismiss(toast.id);
                  }}
                  className="mt-2 text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>{toast.actionLabel}</span>
                </button>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg shrink-0 transition-colors cursor-pointer"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
