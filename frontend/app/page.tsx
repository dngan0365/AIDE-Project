/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Footer from "@/components/layout/Footer";
import DashboardEvent from "@/components/event/DashboardEvent";
import CultureShowcase from "@/components/dashboard/CultureShowcase";

const STATS = [
  { num: "10",    label: "Member Nations" },
  { num: "675M+", label: "Population" },
  { num: "3.6T",  label: "GDP (USD)" },
  { num: "1967",  label: "Founded" },
];

const COUNTRIES = [
  { code: "VN", label: "Vietnam" },
  { code: "TH", label: "Thailand" },
  { code: "ID", label: "Indonesia" },
  { code: "MY", label: "Malaysia" },
  { code: "SG", label: "Singapore" },
  { code: "PH", label: "Philippines" },
  { code: "BN", label: "Brunei" },
  { code: "KH", label: "Cambodia" },
  { code: "LA", label: "Laos" },
  { code: "MM", label: "Myanmar" },
  { code: "TL", label: "Timor-Leste" },
];
export default function Home() {
  return (
    <div className="font-sans bg-[#f4fbfc] dark:bg-[#050f12] text-[#0e1f24] dark:text-[#d4f1f5] min-h-screen">

      {/* ── HERO ── */}
      <div className="relative w-full overflow-hidden h-[340px] sm:h-[55vw] max-h-[640px]">
        <Image
          src="/cover.png"
          alt="ASEAN Cover"
          fill
          priority
          className="object-cover object-[center_80%] transition-transform duration-[8000ms] ease-linear hover:scale-[1.03]"
        />

        {/* layered gradient overlay — slightly deeper in dark mode */}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(2,18,22,0.18)] via-[rgba(2,18,22,0.50)] to-[rgba(2,18,22,0.78)] dark:from-[rgba(2,18,22,0.35)] dark:via-[rgba(2,18,22,0.65)] dark:to-[rgba(2,18,22,0.90)]" />

        {/* top accent strip */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#4ad4e4] via-[#77DAE6] to-[#4ad4e4]" />

        {/* hero text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <span className="font-body text-[0.7rem] tracking-[0.18em] uppercase px-3 py-[3px] border border-[#77DAE6] text-[#77DAE6] rounded-full animate-[fadeIn_1.1s_ease_both]">
            Southeast Asia
          </span>

          <h1 className="font-display text-white font-black leading-tight text-[clamp(2rem,5.5vw,4.5rem)] tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)] mt-4 animate-[fadeUp_0.9s_cubic-bezier(.22,.68,0,1.2)_0.2s_both]">
            Discover ASEAN
          </h1>

          <p className="font-display italic text-[#77DAE6] text-[clamp(1rem,2.5vw,1.75rem)] mt-1 animate-[fadeUp_0.9s_cubic-bezier(.22,.68,0,1.2)_0.3s_both]">
            Innovation &amp; Culture United
          </p>

          <div className="h-[2px] w-[clamp(80px,12vw,160px)] bg-gradient-to-r from-[#4ad4e4] to-[#77DAE6] origin-left mt-5 animate-[scaleIn_0.7s_cubic-bezier(.22,.68,0,1.2)_0.5s_both]" />

          <p className="font-body text-white/80 max-w-lg mt-4 font-light text-[clamp(0.9rem,1.6vw,1.15rem)] animate-[fadeUp_0.9s_cubic-bezier(.22,.68,0,1.2)_0.7s_both]">
            A Journey Through Southeast Asia's Rich Heritage and Cutting-Edge Technology
          </p>
        </div>
      </div>

      {/* ── STATS BAND ── */}
      {/* Always dark — deepens slightly in dark mode */}
      <div className="bg-gradient-to-r from-[#041820] to-[#062430] dark:from-[#020c10] dark:to-[#031218]">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ num, label }) => (
            <div key={label} className="text-center">
              <div className="font-display font-black text-[#4ad4e4] text-[clamp(1.6rem,3vw,2.4rem)]">
                {num}
              </div>
              <div className="font-body text-white/60 mt-1 text-[0.8rem] tracking-[0.12em] uppercase">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── WELCOME SECTION ── */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* text column */}
          <div className="flex-1 order-2 lg:order-1">
            <span className="font-body text-[0.7rem] tracking-[0.18em] uppercase px-3 py-[3px] border border-[#4ad4e4] text-[#4ad4e4] rounded-full">
              About
            </span>

            <h2 className="font-display font-black mt-4 mb-1 text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[1.15] text-[#0e1f24] dark:text-[#d4f1f5]">
              Welcome to{" "}
              <span className="text-[#4ad4e4]">AIASEAN</span>
            </h2>

            <div className="w-14 h-[2px] bg-gradient-to-r from-[#4ad4e4] to-[#77DAE6] rounded my-4" />

            <p className="font-body text-[#1e3a42] dark:text-[#8ecfda] font-light leading-[1.75] text-[clamp(1rem,1.5vw,1.2rem)]">
              Explore the vibrant tapestry of Southeast Asia with AIASEAN. Our platform celebrates
              the rich cultural heritage and groundbreaking innovations of the ASEAN region — from
              ancient traditions to modern technological advancements.
            </p>

            <p className="font-body text-[#2e5a6a] dark:text-[#5ba8b8] italic font-light leading-[1.8] text-[clamp(0.95rem,1.3vw,1.1rem)] mt-5">
              "Despite their remarkable diversity, ASEAN's ten nations share deep cultural
              connections shaped by millennia of history, geography, and trade — a unity
              that continues to drive the region forward."
            </p>

            <a
              href="#"
              className="font-body inline-flex items-center gap-2 mt-7 text-[0.95rem] tracking-[0.1em] uppercase text-[#4ad4e4] border-b border-[#4ad4e4] pb-[2px] no-underline transition-opacity hover:opacity-70"
            >
              Explore the Region
              <span className="text-[1.1rem]">→</span>
            </a>
          </div>

          {/* image column */}
          <div className="flex-1 order-1 lg:order-2 w-full">
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(74,212,228,0.12)] dark:shadow-[0_20px_60px_rgba(74,212,228,0.20)]">
              <Image
                src="/flag.png"
                alt="ASEAN Flag"
                width={600}
                height={420}
                className="w-full h-auto block object-cover"
              />
              <div className="absolute top-0 left-0 w-12 h-12 border-t-[3px] border-l-[3px] border-[#4ad4e4] rounded-tl-2xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[3px] border-r-[3px] border-[#4ad4e4] rounded-br-2xl" />
            </div>
          </div>

        </div>
      </div>

      {/* ── MEMBER NATIONS ── */}
      <div className="bg-gradient-to-br from-[#f0fbfc] to-[#e0f7fa] dark:from-[#071318] dark:to-[#0a1c22] border-t border-b border-[rgba(74,212,228,0.2)] dark:border-[rgba(74,212,228,0.15)]">
        <div className="max-w-5xl mx-auto px-6 py-14 text-center">
          <span className="font-body text-[0.7rem] tracking-[0.18em] uppercase px-3 py-[3px] border border-[#4ad4e4] text-[#4ad4e4] rounded-full">
            Member Nations
          </span>

          <h3 className="font-display font-bold mt-4 mb-2 text-[clamp(1.4rem,2.5vw,2rem)] text-[#0e1f24] dark:text-[#d4f1f5]">
            Ten Nations, One Vision
          </h3>

          <div className="w-16 h-[3px] bg-gradient-to-r from-[#4ad4e4] to-[#77DAE6] rounded-sm mx-auto mb-6" />

          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {COUNTRIES.map(({ code, label }) => (
              <span
                key={code}
                className="font-body inline-flex items-center gap-1.5 px-3.5 py-[5px]
                  bg-[#f0fbfc] dark:bg-[#0a1e24]
                  border border-[rgba(74,212,228,0.3)] dark:border-[rgba(74,212,228,0.2)]
                  text-[#0e1f24] dark:text-[#a8e6ef]
                  rounded-full text-[0.9rem] cursor-default transition-colors duration-200
                  hover:bg-[#d8f5f9] hover:border-[#4ad4e4]
                  dark:hover:bg-[#0f2d36] dark:hover:border-[#4ad4e4]"
              >
                <Image
                  src={`/countries/${code}.svg`}
                  alt={label}
                  width={20}
                  height={14}
                  className="rounded-sm object-cover"
                />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* Event List */}
      <DashboardEvent />
      {/* Culture Showcase */}
      <CultureShowcase />
      {/* Footer */}
      <Footer />
    </div>
  );
}