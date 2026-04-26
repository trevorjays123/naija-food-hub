import { MessageCircle } from "lucide-react";
import { useState } from "react";

const PHONE = "2348058174134"; // Nigeria WhatsApp number (no +)
const DEFAULT_MESSAGE = "Hi Taste Kitchen, I'd like to place an order.";

export function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  const buildLink = (msg: string) =>
    `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;

  const quickActions = [
    { label: "Place an order", msg: "Hi Taste Kitchen, I'd like to place an order." },
    { label: "Ask about the menu", msg: "Hello! Could you tell me more about today's menu?" },
    { label: "Track my order", msg: "Hi, I'd like to check the status of my order." },
    { label: "Reservations & catering", msg: "Hello, I'd like to enquire about reservations / catering." },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-72 rounded-2xl bg-brand-secondary shadow-2xl border border-brand-primary/10 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-[#25D366] text-white px-4 py-3">
            <p className="font-semibold text-sm">Chat with Taste Kitchen</p>
            <p className="text-xs opacity-90">Typically replies within minutes</p>
          </div>
          <div className="p-3 flex flex-col gap-2">
            {quickActions.map((a) => (
              <a
                key={a.label}
                href={buildLink(a.msg)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="text-sm text-brand-primary hover:bg-brand-primary/5 rounded-lg px-3 py-2 transition-colors"
              >
                {a.label}
              </a>
            ))}
            <a
              href={`tel:+${PHONE}`}
              className="text-xs text-center text-brand-primary/60 hover:text-brand-primary mt-1 pt-2 border-t border-brand-primary/10"
            >
              Or call +234 805 817 4134
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat with us on WhatsApp"
        aria-expanded={open}
        className="relative h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" aria-hidden />
        <MessageCircle className="w-7 h-7 relative" />
      </button>
    </div>
  );
}
