"use client";
import { useState, useEffect, useRef } from "react";

const ASEAN_COUNTRIES = [
  { code: "BN", label: "Brunei",       capital: "Bandar Seri Begawan", population: "450K",  currency: "Brunei Dollar"     },
  { code: "KH", label: "Cambodia",     capital: "Phnom Penh",          population: "17M",   currency: "Cambodian Riel"    },
  { code: "ID", label: "Indonesia",    capital: "Jakarta",             population: "277M",  currency: "Indonesian Rupiah" },
  { code: "LA", label: "Laos",         capital: "Vientiane",           population: "7M",    currency: "Lao Kip"           },
  { code: "MY", label: "Malaysia",     capital: "Kuala Lumpur",        population: "33M",   currency: "Malaysian Ringgit" },
  { code: "MM", label: "Myanmar",      capital: "Naypyidaw",           population: "55M",   currency: "Myanmar Kyat"      },
  { code: "PH", label: "Philippines",  capital: "Manila",              population: "115M",  currency: "Philippine Peso"   },
  { code: "SG", label: "Singapore",    capital: "Singapore",           population: "6M",    currency: "Singapore Dollar"  },
  { code: "TH", label: "Thailand",     capital: "Bangkok",             population: "72M",   currency: "Thai Baht"         },
  { code: "TL", label: "Timor-Leste",  capital: "Dili",                population: "1.4M",  currency: "US Dollar"         },
  { code: "VN", label: "Vietnam",      capital: "Hanoi",               population: "98M",   currency: "Vietnamese Dong"   },
];

const COUNTRY_COLORS: Record<string, string> = {
  BN: "#F9C74F", KH: "#FFD93D", ID: "#FF4D6D", LA: "#6BCB77",
  MY: "#3A86FF", MM: "#4D96FF", PH: "#4CC9F0", SG: "#F72585",
  TH: "#FF9F43", TL: "#99BB55", VN: "#FF6B6B",
};

const ASEAN_CODES = new Set(ASEAN_COUNTRIES.map((c) => c.code));

// Maps <g id="..."> values from the SVG to ISO-2 codes
const NAME_TO_CODE: Record<string, string> = {
  "brunei":                                   "BN",
  "brunei darussalam":                         "BN",
  "cambodia":                                  "KH",
  "indonesia":                                 "ID",
  "laos":                                      "LA",
  "lao pdr":                                   "LA",
  "lao people's democratic republic":          "LA",
  "lao peoples democratic republic":           "LA",
  "malaysia":                                  "MY",
  "myanmar":                                   "MM",
  "myanmar (burma)":                           "MM",
  "burma":                                     "MM",
  "philippines":                               "PH",
  "the philippines":                           "PH",
  "singapore":                                 "SG",
  "thailand":                                  "TH",
  "timor-leste":                               "TL",
  "timor leste":                               "TL",
  "east timor":                                "TL",
  "vietnam":                                   "VN",
  "viet nam":                                  "VN",
};

/**
 * SE Asia crop for viewBox="0 0 825 387"
 * Tweak these numbers if your SVG places the region differently.
 */
const ASEAN_VIEWBOX = "590 120 135 110";

type Country = (typeof ASEAN_COUNTRIES)[0];

/** Resolve a <g id="..."> to an ASEAN ISO-2 code, or null. */
function resolveCode(g: SVGGElement): string | null {
  const rawId = (g.getAttribute("id") ?? "").trim();

  // 1. Direct ISO-2 (e.g. id="VN")
  if (ASEAN_CODES.has(rawId.toUpperCase())) return rawId.toUpperCase();

  // 2. Full country name (e.g. id="Vietnam")
  const lower = rawId.toLowerCase();
  if (NAME_TO_CODE[lower]) return NAME_TO_CODE[lower];

  // 3. data-id attribute
  const dataId = (g.getAttribute("data-id") ?? "").trim().toUpperCase();
  if (ASEAN_CODES.has(dataId)) return dataId;

  // 4. <title> child (Wikipedia-style SVGs)
  const title = g.querySelector("title")?.textContent?.trim() ?? "";
  if (ASEAN_CODES.has(title.toUpperCase())) return title.toUpperCase();
  if (NAME_TO_CODE[title.toLowerCase()]) return NAME_TO_CODE[title.toLowerCase()];

  return null;
}

function lighten(hex: string, amount = 0.4): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.round(((num >> 16) & 0xff) + (255 - ((num >> 16) & 0xff)) * amount));
  const g = Math.min(255, Math.round(((num >> 8)  & 0xff) + (255 - ((num >> 8)  & 0xff)) * amount));
  const b = Math.min(255, Math.round( (num        & 0xff) + (255 -  (num        & 0xff)) * amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export default function AseanMapPage() {
  const [selected, setSelected]   = useState<Country | null>(null);
  const [imgError, setImgError]   = useState<Record<string, boolean>>({});
  const [svgContent, setSvgContent] = useState<string>("");
  const mapRef = useRef<HTMLDivElement>(null);

  // ── 1. Load /public/worldMap.svg ─────────────────────────────────────────
  useEffect(() => {
    fetch("/worldMap.svg")
      .then((r) => r.text())
      .then(setSvgContent)
      .catch(console.error);
  }, []);

  // ── 2. Crop to ASEAN + colour/wire countries ──────────────────────────────
  useEffect(() => {
    if (!svgContent || !mapRef.current) return;
    const container = mapRef.current;

    // Crop SVG to just SE Asia
    const svgEl = container.querySelector<SVGSVGElement>("svg");
    if (svgEl) {
      svgEl.setAttribute("viewBox", ASEAN_VIEWBOX);
      svgEl.setAttribute("width", "100%");
      svgEl.removeAttribute("height");
      svgEl.style.display    = "block";
      svgEl.style.transition = "all 0.4s ease";
    }

    const allGroups = Array.from(container.querySelectorAll<SVGGElement>("svg g[id]"));
    const aseanGroups: { el: SVGGElement; code: string }[] = [];
    const otherGroups: SVGGElement[] = [];

    allGroups.forEach((g) => {
      const code = resolveCode(g);
      if (code) aseanGroups.push({ el: g, code });
      else otherGroups.push(g);
    });

    // Non-ASEAN countries — subtle muted fill that works in both light & dark
    otherGroups.forEach((g) => {
      g.querySelectorAll("path").forEach((p) => {
        p.setAttribute("fill",         "#cbd5e1"); // slate-300 — visible on white bg
        p.setAttribute("stroke",       "#94a3b8"); // slate-400
        p.setAttribute("stroke-width", "0.1");
      });
      g.style.cursor     = "default";
      g.onclick          = null;
      g.onmouseenter     = null;
      g.onmouseleave     = null;
    });

    // ASEAN countries — coloured + interactive
    aseanGroups.forEach(({ el: group, code }) => {
      const isActive = selected?.code === code;
      const base     = COUNTRY_COLORS[code];
      const lit      = lighten(base);

      group.querySelectorAll("path").forEach((p) => {
        p.setAttribute("fill",         isActive ? lit : base);
        p.setAttribute("stroke",       "#ffffff");
        p.setAttribute("stroke-width", isActive ? "0.2" : "0.05");
        p.setAttribute("filter",       isActive ? "brightness(1.08)" : "none");
      });

      group.style.cursor     = "pointer";
      group.style.transition = "opacity 0.15s";

      group.onmouseenter = () => {
        if (!isActive) group.querySelectorAll("path").forEach((p) => p.setAttribute("fill", lit));
        group.style.opacity = "0.82";
      };
      group.onmouseleave = () => {
        if (!isActive) group.querySelectorAll("path").forEach((p) => p.setAttribute("fill", base));
        group.style.opacity = "1";
      };
      group.onclick = () => {
        const country = ASEAN_COUNTRIES.find((c) => c.code === code) ?? null;
        setSelected((prev) => (prev?.code === code ? null : country));
      };
    });
  }, [svgContent, selected]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 flex flex-col">
      <main className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full px-4 py-8 gap-8">

        {/* ── Map panel ── */}
        <div className="flex-1">
          <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden p-4 transition-colors duration-300">
            {svgContent ? (
              <div
                ref={mapRef}
                className="w-full h-auto"
                dangerouslySetInnerHTML={{ __html: svgContent }}
                style={{ lineHeight: 0 }}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500 text-sm">
                Loading map…
              </div>
            )}
            <p className="text-center text-slate-400 dark:text-slate-500 text-xs mt-3">
              Click a country on the map or in the list to explore
            </p>
          </div>
        </div>

        {/* ── Side panel ── */}
        <div className="w-full lg:w-80 flex flex-col gap-4">

          {/* Info card */}
          {selected ? (
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                borderColor: COUNTRY_COLORS[selected.code] + "55",
                background: `linear-gradient(135deg, ${COUNTRY_COLORS[selected.code]}18, ${COUNTRY_COLORS[selected.code]}06)`,
              }}
            >
              {/* Flag / hero area */}
              <div className="relative h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden transition-colors duration-300">
                {!imgError[selected.code] ? (
                  <img
                    src={`/countries/${selected.code}.svg`}
                    alt={`Flag of ${selected.label}`}
                    className="w-full h-full object-cover"
                    onError={() => setImgError((e) => ({ ...e, [selected.code]: true }))}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                      style={{ background: COUNTRY_COLORS[selected.code] }}
                    >
                      {selected.code}
                    </div>
                    <span className="text-slate-400 text-xs">Flag unavailable</span>
                  </div>
                )}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(to top, ${COUNTRY_COLORS[selected.code]}dd 0%, transparent 55%)`,
                  }}
                />
                <div className="absolute bottom-3 left-4">
                  <h2 className="text-white text-xl font-bold drop-shadow">{selected.label}</h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/20 dark:bg-black/40 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/40 transition-all text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Stats */}
              <div className="p-4 space-y-3">
                {[
                  { label: "Capital",    value: selected.capital    },
                  { label: "Population", value: selected.population },
                  { label: "Currency",   value: selected.currency   },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">{label}</span>
                    <span className="text-slate-900 dark:text-white text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
              <div className="h-1 w-full" style={{ background: COUNTRY_COLORS[selected.code] }} />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-6 text-center transition-colors duration-300">
              <div className="text-4xl mb-3">🗺️</div>
              <p className="text-slate-700 dark:text-slate-300 font-medium">Select a country</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Click the map or choose below</p>
            </div>
          )}

          {/* Member state list */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden transition-colors duration-300">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10">
              <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">Member States</p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-72 overflow-y-auto">
              {ASEAN_COUNTRIES.map((country) => {
                const isActive = selected?.code === country.code;
                return (
                  <button
                    key={country.code}
                    onClick={() => setSelected(isActive ? null : country)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all
                      hover:bg-slate-50 dark:hover:bg-white/5
                      ${isActive ? "bg-slate-100 dark:bg-white/10" : ""}`}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: COUNTRY_COLORS[country.code] }}
                    />
                    <span
                      className={`text-sm flex-1 ${
                        isActive
                          ? "text-slate-900 dark:text-white font-medium"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {country.label}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600 text-xs font-mono">
                      {country.code}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}