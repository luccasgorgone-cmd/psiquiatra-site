"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, ExternalLink } from "lucide-react";

type Msg = { role: "bot" | "user"; text: string };

export default function AgentWidget({
  greeting,
  quickReplies,
  whatsappHref,
}: {
  greeting: string;
  quickReplies: string[];
  whatsappHref: string;
}) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "bot", text: greeting }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || loading) return;
    setMsgs((m) => [...m, { role: "user", text: t }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t }),
      });
      const data = await res.json();
      setMsgs((m) => [...m, { role: "bot", text: data.reply || "…" }]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "bot", text: "Tive um problema para responder. Tente pelo WhatsApp. 🙏" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        aria-label="Abrir assistente"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand text-ivory shadow-lift transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-40 flex h-[30rem] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-ink/10 bg-ivory shadow-lift"
          >
            <div className="flex items-center justify-between bg-brand px-5 py-4 text-ivory">
              <div>
                <p className="font-serif text-base leading-none">Assistente</p>
                <p className="mt-1 text-xs text-ivory/70">Costuma responder na hora</p>
              </div>
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-300" />
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-sand/40 p-4">
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto bg-brand text-ivory"
                      : "bg-white text-graphite shadow-soft"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {loading && (
                <div className="w-16 rounded-2xl bg-white px-4 py-3 shadow-soft">
                  <span className="flex gap-1">
                    <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
                    <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:120ms]" />
                    <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:240ms]" />
                  </span>
                </div>
              )}

              {msgs.length <= 1 && quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {quickReplies.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="rounded-full border border-brand/30 bg-white px-3 py-1.5 text-xs text-brand transition-colors hover:bg-brand hover:text-ivory"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {whatsappHref && whatsappHref !== "#" && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener"
                className="flex items-center justify-center gap-2 border-t border-ink/10 bg-white py-2.5 text-xs font-medium text-brand hover:bg-sand/50"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Prefere falar no WhatsApp?
              </a>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-ink/10 bg-ivory p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escreva sua mensagem…"
                className="flex-1 rounded-full border border-ink/12 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand text-ivory disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
