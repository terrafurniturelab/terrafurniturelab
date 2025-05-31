import React from "react";

interface ModalCenterProps {
  open: boolean;
  onClose: () => void;
  status?: "success" | "error" | "info";
  title: string;
  description?: string;
  okText?: string;
}

const statusIcons = {
  success: (
    <svg className="w-16 h-16 text-green-500 mb-4 p-2" fill="none" viewBox="0 0 26 26" stroke="currentColor">
      <circle cx="12" cy="12" r="10" fill="#bbf7d0" />
      <path d="M8 12l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg className="w-16 h-16 text-red-500 mb-4" fill="none" viewBox="0 0 26 26" stroke="currentColor">
      <circle cx="12" cy="12" r="10" fill="#fee2e2" />
      <path d="M15 9l-6 6M9 9l6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg className="w-16 h-16 text-blue-500 mb-4 p-2" fill="none" viewBox="0 0 26 26" stroke="currentColor">
      <circle cx="12" cy="12" r="10" fill="#dbeafe" />
      <path d="M12 8v4m0 4h.01" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export default function ModalCenter({
  open,
  onClose,
  status = "info",
  title,
  description,
  okText = "OK",
}: ModalCenterProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center animate-scale-in">
        {statusIcons[status]}
        <h2 className="text-xl font-bold text-center mb-2">{title}</h2>
        {description && <p className="text-gray-600 text-center mb-6">{description}</p>}
        <button
          onClick={onClose}
          className="cursor-pointer px-8 py-2 text-white rounded-full font-semibold text-lg shadow bg-[#553939] hover:bg-[#3f2a2a]  transition"
        >
          {okText}
        </button>
      </div>
      <style jsx global>{`
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0 }
          to { transform: scale(1); opacity: 1 }
        }
        .animate-scale-in { animation: scale-in 0.2s; }
      `}</style>
    </div>
  );
} 