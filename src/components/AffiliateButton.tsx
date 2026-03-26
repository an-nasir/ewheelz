"use client";

export default function AffiliateButton({
  evModelId,
  dealerName,
  url,
  utmParams,
}: {
  evModelId: string;
  dealerName: string;
  url: string;
  utmParams?: string | null;
}) {
  const handleClick = async () => {
    try {
      await fetch("/api/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evModelId, dealerName }),
      });
    } catch (e) {
      console.error(e);
    }
    
    // Append UTM params
    const finalUrl = utmParams ? (url.includes('?') ? `${url}&${utmParams}` : `${url}?${utmParams}`) : url;
    window.open(finalUrl, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors border border-emerald-600/30"
    >
      Buy from {dealerName}
    </button>
  );
}
