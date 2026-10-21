const allowedHosts = new Set(["bluepeace.co.kr", "www.bluepeace.co.kr"]);
const naverKeys = ["n_keyword", "n_query", "n_ad_group", "n_ad"];
const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
const allowedKeys = [...naverKeys, ...utmKeys];

function text(value, maxLength) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, maxLength)
    : "";
}

function parseUrl(value) {
  if (typeof value !== "string" || value.length > 3000) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url : null;
  } catch { return null; }
}

function referralSource(hostname) {
  if (hostname === "search.naver.com" || hostname.endsWith(".search.naver.com")) return "Naver";
  if (hostname === "google.com" || hostname.endsWith(".google.com")) return "Google";
  if (hostname === "search.daum.net") return "Daum";
  if (hostname === "bing.com" || hostname.endsWith(".bing.com")) return "Bing";
  return hostname;
}

export function parseMarketingTouch(value, siteOrigin = "https://www.bluepeace.co.kr") {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const landing = parseUrl(source.landing_url);
  const site = parseUrl(siteOrigin);
  if (!landing || !site || (!allowedHosts.has(landing.hostname) && landing.host !== site.host)) return null;
  const referrer = parseUrl(source.referrer_url);
  const external = referrer && referrer.hostname !== landing.hostname && !allowedHosts.has(referrer.hostname) ? referrer : null;
  const params = landing.searchParams;
  const pick = (key, length = 200) => text(params.get(key), length);
  const allowed = new URL(landing.pathname, landing.origin);
  for (const key of allowedKeys) {
    const parameter = pick(key);
    if (parameter) allowed.searchParams.set(key, parameter);
  }
  const naverAd = naverKeys.some(key => Boolean(pick(key)));
  const utmSource = pick("utm_source", 100);
  const refSource = external ? referralSource(external.hostname) : "";
  const safeReferrer = external ? new URL(external.origin) : null;
  if (safeReferrer && ["Naver", "Google", "Daum", "Bing"].includes(refSource)) {
    const searchKey = refSource === "Naver" ? "query" : "q";
    const searchTerm = text(external.searchParams.get(searchKey), 200);
    if (searchTerm) safeReferrer.searchParams.set(searchKey, searchTerm);
  }
  const trafficSource = utmSource || (naverAd ? "Naver" : refSource);
  const trafficMedium = pick("utm_medium", 100) || (naverAd ? "paid_search" : refSource ? (["Naver", "Google", "Daum", "Bing"].includes(refSource) ? "organic" : "referral") : "direct");
  const organicTerm = external && ["Naver", "Google", "Daum", "Bing"].includes(refSource)
    ? text(external.searchParams.get(refSource === "Naver" ? "query" : "q"), 200) : "";
  return {
    landing_url: allowed.toString().slice(0, 2500),
    referrer_url: safeReferrer ? safeReferrer.toString().slice(0, 500) : null,
    traffic_source: text(trafficSource, 100) || null,
    traffic_medium: trafficMedium,
    traffic_campaign: pick("utm_campaign") || null,
    traffic_term: pick("utm_term") || organicTerm || null,
    traffic_content: pick("utm_content") || null,
    naver_keyword: pick("n_keyword") || null,
    naver_query: pick("n_query") || null,
    naver_ad_group: /^[\w-]{1,100}$/.test(pick("n_ad_group", 100)) ? pick("n_ad_group", 100) : null,
    naver_ad: /^[\w-]{1,100}$/.test(pick("n_ad", 100)) ? pick("n_ad", 100) : null,
    device_type: ["모바일", "태블릿", "PC"].includes(source.device_type) ? source.device_type : null,
  };
}

export function parseMarketingAttribution(value, siteOrigin) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const first = parseMarketingTouch(source.first_touch || source, siteOrigin);
  const latest = parseMarketingTouch(source.latest_touch || source.first_touch || source, siteOrigin);
  return { first, latest };
}
