"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Check, AlertCircle } from "lucide-react";

type State = { ok?: boolean; message?: string } | null;
type Action = (prev: State, fd: FormData) => Promise<State>;

export default function ActionForm({
  action,
  children,
  submitLabel = "Salvar",
  resetOnSuccess = false,
  compact = false,
}: {
  action: Action;
  children: React.ReactNode;
  submitLabel?: string;
  resetOnSuccess?: boolean;
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (state?.message) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 3500);
      return () => clearTimeout(t);
    }
  }, [state]);

  return (
    <form
      action={formAction}
      // limpa campos após sucesso quando pedido (formulários de "adicionar")
      key={resetOnSuccess && state?.ok ? Math.random() : undefined}
      className="space-y-4"
    >
      {children}
      <div className={`flex items-center gap-3 ${compact ? "" : "pt-1"}`}>
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </button>
        {visible && state?.message && (
          <span
            className={`inline-flex items-center gap-1.5 text-sm ${
              state.ok ? "text-brand" : "text-red-600"
            }`}
          >
            {state.ok ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
