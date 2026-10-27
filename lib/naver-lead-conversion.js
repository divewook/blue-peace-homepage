// Naver's wcs.trans guide classifies a saved consultation application as `lead`.
const consentKey = "bluepeace_naver_tracking_consent";
const consentEvent = "bluepeace:naver-consent-changed";
const scriptId = "bluepeace-naver-wcs";
function accountId() { return process.env.NEXT_PUBLIC_NAVER_WCS_ACCOUNT_ID; }
let scriptPromise;
let lastPageView = null;
const leadsInFlight = new Set();

export function isNaverTrackingEnabled() {
  return process.env.NEXT_PUBLIC_NAVER_WCS_ENABLED === "true" && Boolean(accountId());
}

export function getNaverTrackingConsent() {
  try { return sessionStorage.getItem(consentKey); } catch { return null; }
}

export function setNaverTrackingConsent(accepted) {
  try { sessionStorage.setItem(consentKey, accepted ? "yes" : "no"); } catch {}
  window.dispatchEvent(new Event(consentEvent));
}

export function onNaverTrackingConsentChanged(listener) {
  window.addEventListener(consentEvent, listener);
  return () => window.removeEventListener(consentEvent, listener);
}

export function isNewConsultationConversion(result) {
  return Boolean(result && typeof result.id === "string" && result.id && result.duplicate !== true);
}

function loadNaverScript() {
  if (window.wcs?.trans) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://wcs.naver.net/wcslog.js";
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Naver conversion script unavailable"));
    document.head.appendChild(script);
  }).catch(error => {
    document.getElementById?.(scriptId)?.remove();
    scriptPromise = null;
    throw error;
  });
  return scriptPromise;
}

async function ready() {
  if (!isNaverTrackingEnabled() || getNaverTrackingConsent() !== "yes") return false;
  // The official common tag sets wa before loading wcslog.js, then sets cookie scope.
  window.wcs_add = { ...(window.wcs_add || {}), wa: accountId() };
  await loadNaverScript();
  if (!window.wcs?.inflow || !window.wcs_do || !window.wcs?.trans) return false;
  window.wcs.inflow("bluepeace.co.kr");
  return true;
}

export async function reportNaverPageView(pathname) {
  if (pathname !== "/" && pathname !== "/inquiry") return false;
  try {
    if (!await ready() || getNaverTrackingConsent() !== "yes") return false;
    const page = `${window.location.pathname}${window.location.search}`;
    if (lastPageView === page) return false;
    window.wcs_do();
    lastPageView = page;
    return true;
  } catch { return false; }
}

export async function reportNaverLeadOnce(result, consented) {
  if (!consented || !isNaverTrackingEnabled() || !isNewConsultationConversion(result)) return false;
  const key = `bluepeace_naver_lead_${result.id}`;
  if (leadsInFlight.has(key)) return false;
  leadsInFlight.add(key);
  try {
    if (sessionStorage.getItem(key)) return false;
    // Complete the common page-view tag before sending the lead when consent
    // was first given on the inquiry form immediately before submission.
    await reportNaverPageView(window.location.pathname);
    if (!await ready() || getNaverTrackingConsent() !== "yes") return false;
    if (sessionStorage.getItem(key)) return false;
    // Reserve before sending so retries and concurrent responses cannot duplicate the event.
    sessionStorage.setItem(key, "1");
    // No name, phone, notes, course or customer ID is sent to the ad provider.
    window.wcs.trans({ type: "lead" });
    return true;
  } catch { return false; }
  finally { leadsInFlight.delete(key); }
}
