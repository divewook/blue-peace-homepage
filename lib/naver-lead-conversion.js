// The account ID is intentionally unset until this domain is approved in Naver Ads.
// Naver's wcs.trans guide uses `lead` for a completed consultation application.
export function isNewConsultationConversion(result) {
  return Boolean(result && typeof result.id === "string" && result.id && result.duplicate !== true);
}

function loadNaverScript() {
  return new Promise((resolve, reject) => {
    if (window.wcs?.trans) return resolve();
    const script = document.createElement("script");
    script.src = "https://wcs.naver.net/wcslog.js";
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Naver conversion script unavailable"));
    document.head.appendChild(script);
  });
}

export async function reportNaverLeadOnce(result, consented) {
  const accountId = process.env.NEXT_PUBLIC_NAVER_WCS_ACCOUNT_ID;
  // Enable only after Naver approves this domain and the full common-tag setup is verified.
  if (!consented || !accountId || process.env.NEXT_PUBLIC_NAVER_WCS_ENABLED !== "true" || !isNewConsultationConversion(result)) return false;
  const key = `bluepeace_naver_lead_${result.id}`;
  try {
    if (sessionStorage.getItem(key)) return false;
    await loadNaverScript();
    if (!window.wcs?.trans) return false;
    window.wcs_add = { ...(window.wcs_add || {}), wa: accountId };
    window.wcs.inflow("bluepeace.co.kr");
    window.wcs_do?.();
    sessionStorage.setItem(key, "1");
    // Send no name, phone, notes, course or customer ID to the ad provider.
    window.wcs.trans({ type: "lead" });
    return true;
  } catch {
    return false;
  }
}
