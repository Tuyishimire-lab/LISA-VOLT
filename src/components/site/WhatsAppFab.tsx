import { MessageCircle } from "lucide-react";

export function WhatsAppFab() {
  return (
    <a
      href="https://wa.me/250788286465"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl hover:scale-105 active:scale-95 transition-transform"
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" />
      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-yellow border-2 border-white animate-pulse" />
    </a>
  );
}
