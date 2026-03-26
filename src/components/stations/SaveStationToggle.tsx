"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SaveStationToggleProps {
  stationId: string;
  initialSaved?: boolean;
}

export default function SaveStationToggle({ stationId, initialSaved = false }: SaveStationToggleProps) {
  const { status } = useSession();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsSaved(initialSaved);
  }, [initialSaved]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    setIsPending(true);
    const action = isSaved ? "unsave" : "save";

    try {
      const res = await fetch("/api/user/save-station", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stationId, action }),
      });

      if (res.ok) {
        setIsSaved(!isSaved);
      }
    } catch (error) {
      console.error("Failed to toggle save:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={toggleSave}
      disabled={isPending}
      className={`p-2.5 rounded-2xl transition-all shadow-sm flex items-center justify-center hover:scale-[1.10] active:scale-95 disabled:opacity-50 ${
        isSaved
          ? "bg-rose-50 text-rose-500 border-rose-200"
          : "bg-white text-slate-400 border border-slate-200 hover:border-indigo-300 hover:text-indigo-400"
      }`}
      title={isSaved ? "Saved to your list" : "Save this station"}
    >
      <span className="text-xl leading-none">{isSaved ? "❤️" : "🤍"}</span>
    </button>
  );
}
