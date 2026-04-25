import { MessageCircle } from "lucide-react";

const PHONE = "2348001234567"; // Nigeria WhatsApp number (no +)

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${PHONE}?text=${encodeURIComponent("Hi Taste Kitchen, I'd like to place an order.")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
