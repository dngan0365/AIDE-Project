"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

/* ─── Data ─────────────────────────────────────────────────────────── */
const CULTURES = [
  {
    flag: "/countries/VN.svg", country: "Vietnam", color: "#da2020", accent: "#ffd700",
    items: [
      {
        name: "Nhã nhạc cung đình Huế",
        desc: "Royal court music performed for Vietnamese emperors — a UNESCO intangible heritage of humanity.",
        image: "/cultures/NhaNhacCungDinhHue.jpg",
      },
      {
        name: "Dân ca Quan họ",
        desc: "Antiphonal folk duet singing tradition of the Red River Delta, exchanged between groups of singers.",
        image: "/cultures/DanCaQuanHo.jpg",
      },
      {
        name: "Tín ngưỡng thờ Mẫu Tam phủ",
        desc: "Mother Goddess worship of the Three Realms — a living spiritual practice blending trance, music and ritual.",
        image: "/cultures/ThoMau.jpg",
      },
    ],
  },
  {
    flag: "/countries/TH.svg", country: "Thailand", color: "#2d6dc8", accent: "#f5a623",
    items: [
      {
        name: "Khon",
        desc: "Masked dance drama drawing from the Ramakien epic, performed by elaborately costumed dancers. UNESCO-listed.",
        image: "/cultures/Khon.jpg",
      },
      {
        name: "Songkran",
        desc: "Joyful water festival marking the Thai New Year each April — a nationwide celebration of renewal.",
        image: "/cultures/Songkran.jpg",
      },
    ],
  },
  {
    flag: "/countries/ID.svg", country: "Indonesia", color: "#ce1126", accent: "#f4c430",
    items: [
      {
        name: "Wayang",
        desc: "Intricate shadow puppet theatre performed through the night — a UNESCO masterpiece of oral and intangible heritage.",
        image: "/cultures/Wayang.jpg",
      },
      {
        name: "Batik",
        desc: "Traditional wax-resist fabric art where each pattern carries deep philosophical and cultural meaning.",
        image: "/cultures/Batik.webp",
      },
    ],
  },
  {
    flag: "/countries/MY.svg", country: "Malaysia", color: "#cc0001", accent: "#ffd700",
    items: [
      {
        name: "Mak Yong",
        desc: "Ancient royal dance theatre of Kelantan, blending music, song, comedy and ritual healing.",
        image: "/cultures/Mak Yong.webp",
      },
      {
        name: "Dikir Barat",
        desc: "Energetic group singing performance with call-and-response rhythms, hand gestures and vibrant costumes.",
        image: "/cultures/Dikir Barat.webp",
      },
    ],
  },
  {
    flag: "/countries/SG.svg", country: "Singapore", color: "#ef3340", accent: "#ffdd00",
    items: [
      {
        name: "Multicultural Tapestry",
        desc: "A harmonious weave of Chinese, Malay and Indian traditions living side by side in a single city.",
        image: "/cultures/MulticulturalTapestry.webp",
      },
      {
        name: "Thaipusam",
        desc: "Spectacular Hindu festival of devotion where devotees carry ornate kavadis in a grand procession.",
        image: "/cultures/Thaipusam.jpg",
      },
      {
        name: "Hawker Culture",
        desc: "UNESCO-listed communal dining heritage — Singapore's beloved street food stalls are a democratic institution.",
        image: "/cultures/HawkerCulture.jpg",
      },
    ],
  },
  {
    flag: "/countries/PH.svg", country: "Philippines", color: "#0038a8", accent: "#fcd116",
    items: [
      {
        name: "Hudhud Chants",
        desc: "UNESCO epic chanting tradition of the Ifugao rice-terrace people, narrating heroic ancestral stories.",
        image: "/cultures/HudhudChants.jpg",
      },
      {
        name: "Sinulog Festival",
        desc: "Grand religious street festival in Cebu honouring the Santo Niño with dance, music and procession.",
        image: "/cultures/SinulogFestival.webp",
      },
    ],
  },
  {
    flag: "/countries/BN.svg", country: "Brunei", color: "#f7e017", accent: "#00843d",
    items: [
      {
        name: "Islamic Traditions",
        desc: "Sacred rituals and the revered art of Qur'anic recitation at the heart of Bruneian identity.",
        image: "/cultures/IslamicTraditions.jpg",
      },
      {
        name: "Adat Istiadat Melayu",
        desc: "Elaborate Royal Malay customs of the Sultanate — centuries-old ceremonies governing court and community.",
        image: "/cultures/AdatIstiadatMelayu.jpg",
      },
    ],
  },
  {
    flag: "/countries/KH.svg", country: "Cambodia", color: "#032ea1", accent: "#e00025",
    items: [
      {
        name: "Apsara Dance",
        desc: "Classical royal dance depicting the celestial nymphs of Angkor mythology, in gilded costume and precise gesture.",
        image: "/cultures/ApsaraDance.jpg",
      },
      {
        name: "Sbek Thom",
        desc: "UNESCO large-figure shadow puppet theatre rooted in the Angkorian era, performed only at ceremonies.",
        image: "/cultures/SbekThom.jpg",
      },
    ],
  },
  {
    flag: "/countries/LA.svg", country: "Laos", color: "#ce1126", accent: "#0040a7",
    items: [
      {
        name: "Lamvong",
        desc: "Graceful traditional circle dance where performers move in slow, concentric rings at festivals and ceremonies.",
        image: "/cultures/Lamvong.jpeg",
      },
      {
        name: "Bun Pi Mai",
        desc: "Lao New Year water festival filled with temple offerings, boat processions and communal celebration.",
        image: "/cultures/BunPiMai.jpg",
      },
    ],
  },
  {
    flag: "/countries/MM.svg", country: "Myanmar", color: "#fecb00", accent: "#34b233",
    items: [
      {
        name: "Thingyan",
        desc: "Exuberant water festival celebrating the Burmese New Year — the largest annual event in the country.",
        image: "/cultures/Thingyan.jpg",
      },
      {
        name: "Yoke thé",
        desc: "Elaborate traditional marionette theatre with intricately carved puppets controlled by dozens of strings.",
        image: "/cultures/Yoke thé.jpg",
      },
    ],
  },
  {
    flag: "/countries/TL.svg", country: "Timor-Leste", color: "#dc241f", accent: "#ffc726",
    items: [
      {
        name: "Tais",
        desc: "Vibrant hand-woven textile art — each cloth a unique map of the weaver's ancestral identity and story.",
        image: "/cultures/Tais.jpg",
      },
      {
        name: "Oral Traditions",
        desc: "Living community rituals, chanting and storytelling passed through generations as the nation's living memory.",
        image: "/cultures/oral trandition.jpg",
      },
    ],
  },
];

/* ─── Component ─────────────────────────────────────────────────────── */
export default function CultureShowcase() {
  const [activeCountry, setActiveCountry]   = useState(0);
  const [activeCulture, setActiveCulture]   = useState(0);
  const [transitioning, setTransitioning]   = useState(false);
  const [visible, setVisible]               = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const selectCountry = (idx: number) => {
    if (idx === activeCountry || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveCountry(idx);
      setActiveCulture(0);
      setTransitioning(false);
    }, 300);
  };

  const selectCulture = (idx: number) => {
    if (idx === activeCulture || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveCulture(idx);
      setTransitioning(false);
    }, 220);
  };

  const country = CULTURES[activeCountry];
  const culture = country.items[activeCulture];

  return (
    <section
      ref={sectionRef}
      className="relative py-20 overflow-hidden bg-[#f4fbfc] dark:bg-[#060f13]"
    >
      <style>{`
        @keyframes cs-fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cs-fadeIn  { from{opacity:0;transform:scale(1.04)}      to{opacity:1;transform:scale(1)} }
        @keyframes cs-slideR  { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        .cs-img-enter  { animation: cs-fadeIn .5s cubic-bezier(.22,.68,0,1.2) both; }
        .cs-text-enter { animation: cs-slideR .4s cubic-bezier(.22,.68,0,1.2) both; }
        .cs-tabs::-webkit-scrollbar { display:none; }
        .cs-tabs { scrollbar-width:none; }
      `}</style>

      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.055]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(74,212,228,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(74,212,228,.7) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div
        className={`max-w-6xl mx-auto px-6 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* ── Section header ── */}
        <div className="text-center mb-12">
          <span className="font-body text-[0.7rem] tracking-[0.18em] uppercase px-3 py-[3px] border border-[#4ad4e4] text-[#4ad4e4] rounded-full">
            Cultural Heritage
          </span>
          <h2 className="font-display font-black mt-4 mb-2 text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[1.15] text-[#0e1f24] dark:text-[#d4f1f5]">
            Living <span className="text-[#4ad4e4]">Traditions</span>
          </h2>
          <div className="w-16 h-[3px] bg-gradient-to-r from-[#4ad4e4] to-[#77DAE6] rounded mx-auto mb-4" />
          <p className="font-body text-[#2e5a6a] dark:text-[#5ba8b8] max-w-xl mx-auto text-[clamp(.9rem,1.4vw,1.05rem)] font-light leading-relaxed">
            Each nation carries millennia of unique cultural expression. Select a country, then explore each of its traditions.
          </p>
        </div>

        {/* ── Country tab strip ── */}
        <div className="cs-tabs flex gap-3 overflow-x-auto pb-3 mb-8 justify-start md:justify-start">
          {CULTURES.map((c, i) => (
            <button
            key={c.country}
            onClick={() => selectCountry(i)}
            className={`
                flex-shrink-0 flex items-center gap-1.5 px-3.5 py-[7px] rounded-full
                font-body text-[0.82rem] tracking-wide border transition-all duration-200
                ${i === activeCountry
                ? "bg-[#4ad4e4] border-[#4ad4e4] text-[#041820] font-semibold shadow-[0_4px_16px_rgba(74,212,228,0.35)]"
                : "bg-white/60 dark:bg-[#0a1e24]/80 border-[rgba(74,212,228,0.25)] text-[#0e1f24] dark:text-[#8ecfda] hover:border-[#4ad4e4] hover:bg-white dark:hover:bg-[#0f2d36]"
                }
            `}
            >
            <Image
                src={c.flag}
                alt={c.country}
                width={18}
                height = {20}
                className="rounded-sm object-cover flex-shrink-0"
            />
            <span className="hidden sm:inline">{c.country}</span>
            </button>
          ))}
        </div>

        {/* ── Main card ── */}
        <div className="rounded-3xl overflow-hidden border border-[rgba(74,212,228,0.18)] dark:border-[rgba(74,212,228,0.10)] bg-white/70 dark:bg-[#071318]/80 backdrop-blur-sm shadow-[0_8px_48px_rgba(74,212,228,0.07)]">
          <div className="flex flex-col lg:flex-row">

            {/* ═══ LEFT SIDEBAR — culture list ═══ */}
            <div className="lg:w-[240px] xl:w-[260px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-[rgba(74,212,228,0.12)] p-5 flex flex-col gap-1.5">
                <p className="font-body text-[0.65rem] tracking-[0.18em] uppercase text-[#4ad4e4] mb-3 px-1 flex items-center gap-1.5">
                <Image
                    src={country.flag}
                    alt={country.country}
                    width={18}
                    height = {20}
                    style={{ height: "auto" }}
                    className="rounded-sm object-cover"
                />
                {country.country}
                </p>

              {country.items.map((item, i) => (
                <button
                  key={item.name}
                  onClick={() => selectCulture(i)}
                  className={`
                    text-left rounded-xl px-3.5 py-3 transition-all duration-200 group
                    ${i === activeCulture
                      ? "bg-[rgba(74,212,228,0.10)] border border-[rgba(74,212,228,0.35)]"
                      : "border border-transparent hover:bg-[rgba(74,212,228,0.05)] hover:border-[rgba(74,212,228,0.18)]"
                    }
                  `}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-200
                        ${i === activeCulture
                          ? "bg-[#4ad4e4] shadow-[0_0_6px_rgba(74,212,228,0.9)]"
                          : "bg-[rgba(74,212,228,0.3)] group-hover:bg-[rgba(74,212,228,0.6)]"
                        }`}
                    />
                    <span
                      className={`font-body text-[0.875rem] leading-snug transition-colors duration-200
                        ${i === activeCulture
                          ? "text-[#0e1f24] dark:text-[#d4f1f5] font-medium"
                          : "text-[#2e5a6a] dark:text-[#5ba8b8]"
                        }`}
                    >
                      {item.name}
                    </span>
                  </div>
                </button>
              ))}

              {/* culture progress pills */}
              <div className="flex gap-1.5 mt-auto pt-5 px-1">
                {country.items.map((_, i) => (
                  <button
                    aria-label={`Select culture ${i + 1}`}
                    key={i}
                    onClick={() => selectCulture(i)}
                    className={`h-1 rounded-full flex-1 transition-all duration-300
                      ${i === activeCulture ? "bg-[#4ad4e4]" : "bg-[rgba(74,212,228,0.2)] hover:bg-[rgba(74,212,228,0.45)]"}`}
                  />
                ))}
              </div>
            </div>

            {/* ═══ RIGHT — image + detail ═══ */}
            <div className="flex-1 flex flex-col">

              {/* Hero image */}
              <div
                className="relative w-full overflow-hidden"
                style={{ height: "clamp(220px, 35vw, 340px)" }}
              >
                {/* image fades on transition */}
                <div className={`absolute inset-0 transition-opacity duration-300 ${transitioning ? "opacity-0" : "opacity-100"}`}>
                  <Image
                    key={`${activeCountry}-${activeCulture}`}
                    src={culture.image}
                    alt={culture.name}
                    fill
                    className="object-cover cs-img-enter"
                    sizes="(max-width:1024px) 100vw, 72vw"
                  />
                </div>

                {/* Colour wash */}
                <div
                  className="absolute inset-0 opacity-[0.18] mix-blend-screen pointer-events-none z-10"
                  style={{ background: country.color }}
                />

                {/* Gradient overlays */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#041820]/85 via-[#041820]/25 to-transparent" />

                {/* Top accent strip */}
                <div className="absolute top-0 left-0 right-0 h-[3px] z-20 bg-gradient-to-r from-[#4ad4e4] via-[#77DAE6] to-[#4ad4e4]" />

                {/* Culture name on image */}
                <div
                  className={`absolute bottom-0 left-0 right-0 z-20 p-6 transition-all duration-300 ${
                    transitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                  }`}
                >
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="font-display font-black text-white text-[clamp(1.1rem,2.2vw,1.6rem)] leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                        {culture.name}
                      </p>
                      <div
                        className="h-[2px] w-10 mt-2 rounded"
                        style={{ background: country.accent }}
                      />
                    </div>
                    <Image
                    src={country.flag}
                    alt={country.country}
                    width={52}
                    height={52}
                    className="rounded-sm object-cover drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] flex-shrink-0"
                    />
                  </div>
                </div>
              </div>

              {/* Description + nav */}
              <div
                className={`flex-1 p-6 lg:p-8 flex flex-col justify-between transition-all duration-300 ${
                  transitioning ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0"
                }`}
              >
                <div>
                  <span className="font-body text-[0.65rem] tracking-[0.18em] uppercase text-[#4ad4e4]">
                    {country.country} · Cultural Heritage
                  </span>
                  <p className="font-body text-[#1e3a42] dark:text-[#8ecfda] font-light leading-[1.8] text-[clamp(.95rem,1.4vw,1.1rem)] mt-3 max-w-2xl">
                    {culture.desc}
                  </p>
                </div>

                {/* Nav row */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[rgba(74,212,228,0.10)]">
                  <div className="flex gap-2">
                    <button
                      onClick={() => selectCulture((activeCulture - 1 + country.items.length) % country.items.length)}
                      aria-label="Previous tradition"
                      className="w-8 h-8 rounded-full border border-[rgba(74,212,228,0.3)] flex items-center justify-center text-[#4ad4e4] text-xs hover:bg-[#4ad4e4] hover:text-[#041820] hover:border-[#4ad4e4] transition-all duration-200"
                    >←</button>
                    <button
                      onClick={() => selectCulture((activeCulture + 1) % country.items.length)}
                      aria-label="Next tradition"
                      className="w-8 h-8 rounded-full border border-[rgba(74,212,228,0.3)] flex items-center justify-center text-[#4ad4e4] text-xs hover:bg-[#4ad4e4] hover:text-[#041820] hover:border-[#4ad4e4] transition-all duration-200"
                    >→</button>
                  </div>
                  <span className="font-body text-[0.75rem] text-[#2e5a6a] dark:text-[#3d7a8a]">
                    {activeCulture + 1} / {country.items.length} traditions
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Country progress strip ── */}
        <div
          className="mt-5 grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${CULTURES.length}, 1fr)` }}
        >
          {CULTURES.map((c, i) => (
            <button
              key={c.country}
              title={c.country}
              onClick={() => selectCountry(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === activeCountry
                  ? "bg-[#4ad4e4]"
                  : "bg-[rgba(74,212,228,0.18)] hover:bg-[rgba(74,212,228,0.45)]"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}