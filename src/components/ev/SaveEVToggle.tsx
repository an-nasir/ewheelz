"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SaveEVToggleProps {
  evId: string;
  initialSaved?: boolean;
}

export default function SaveEVToggle({ evId, initialSaved = false }: SaveEVToggleProps) {
  const { data: session, status } = useSession();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If we're authenticated, we could fetch the real state or rely on initialSaved from the server
    setIsSaved(initialSaved);
  }, [initialSaved]);

  const toggleSave = async () => {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    setIsPending(true);
    const action = isSaved ? "unsave" : "save";

    try {
      const res = await fetch("/api/user/save-ev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evId, action }),
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
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] shadow-sm disabled:opacity-50 ${
        isSaved
          ? "bg-rose-500 text-white border-rose-600"
          : "bg-white/10 text-white border border-white/20 backdrop-blur-md hover:bg-white/20"
      }`}
    >
      <span className="text-base">{isSaved ? "❤️" : "🤍"}</span>
      <span>{isSaved ? "Saved" : "Save car"}</span>
    </button>
  );
}
