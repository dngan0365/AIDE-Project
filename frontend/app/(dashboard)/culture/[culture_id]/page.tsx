"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getStory, Story } from "@/api/story";
import { listScenes, Scene } from "@/api/scene";
import { listCharactersForStory, Character } from "@/api/character";

export default function CultureDetailPage() {
  const { culture_id } = useParams<{ culture_id: string }>();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStory(culture_id), listScenes(culture_id), listCharactersForStory(culture_id)])
      .then(([s, sc, ch]) => {
        setStory(s);
        setScenes(sc.sort((a: Scene, b: Scene) => a.scene_order - b.scene_order));
        setCharacters(ch);
      })
      .finally(() => setLoading(false));
  }, [culture_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex items-center justify-center transition-colors">
        <div className="w-10 h-10 border-2 border-[#4ad4e4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex items-center justify-center transition-colors">
        <p className="font-['Cinzel'] text-gray-400 dark:text-white/30">Story not found.</p>
      </div>
    );
  }

  const firstScene = scenes[0];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white font-['Crimson_Text'] transition-colors duration-300">

      {/* Hero */}
      <div className="relative h-[55vh] sm:h-[65vh] lg:h-[70vh] min-h-[400px] sm:min-h-[500px] overflow-hidden">
        {story.cover_image_url ? (
          <img
            src={story.cover_image_url}
            alt={story.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#d0f5f8] to-[#f0feff] dark:from-[#0d1f24] dark:to-[#0a0a0f]" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0a0a0f] via-white/50 dark:via-[#0a0a0f]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 dark:from-[#0a0a0f]/80 to-transparent" />

        {/* Back button */}
        <div className="absolute top-5 sm:top-8 left-4 sm:left-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 dark:text-white/50 hover:text-[#4ad4e4] dark:hover:text-white transition-colors font-['Cinzel'] text-xs tracking-widest"
          >
            ← BACK
          </button>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-8 sm:pb-12 max-w-4xl">
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="font-['Cinzel'] text-xs tracking-widest px-3 py-1.5 border border-[#4ad4e4]/60 text-[#4ad4e4] dark:text-[#4ad4e4] rounded-full capitalize bg-white/60 dark:bg-transparent">
              {story.culture_type}
            </span>
            <span className="font-['Cinzel'] text-xs tracking-widest px-3 py-1.5 border border-gray-300 dark:border-white/20 text-gray-500 dark:text-white/50 rounded-full bg-white/60 dark:bg-transparent">
              {story.country}
            </span>
          </div>
          <h1 className="font-['Cinzel'] text-3xl sm:text-5xl md:text-6xl font-bold leading-tight mb-3 sm:mb-4 text-gray-900 dark:text-white drop-shadow-2xl">
            {story.title}
          </h1>
          <p className="text-gray-600 dark:text-white/70 text-base sm:text-xl leading-relaxed max-w-2xl line-clamp-3 sm:line-clamp-none">
            {story.description}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Meta strip */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-8 mb-10 sm:mb-14 py-5 sm:py-6 border-y border-gray-100 dark:border-white/5">
          {[
            { label: "DIFFICULTY", value: story.difficulty },
            { label: "DURATION", value: story.estimated_time },
            { label: "SCENES", value: `${scenes.length} chapters` },
            { label: "TOPIC", value: story.culture_topic },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="font-['Cinzel'] text-xs tracking-widest text-[#4ad4e4]/60 dark:text-[#4ad4e4]/50 mb-1">{label}</p>
              <p className="text-gray-800 dark:text-white font-medium capitalize">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">

          {/* Scenes */}
          <div className="lg:col-span-2">
            <h2 className="font-['Cinzel'] text-sm tracking-[0.2em] text-[#4ad4e4] mb-6 sm:mb-8">CHAPTERS</h2>
            <div className="space-y-3 relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-[#4ad4e4]/30 via-[#4ad4e4]/10 to-transparent" />

              {scenes.map((scene, i) => (
                <Link key={scene.id} href={`/culture/${culture_id}/${scene.id}`}>
                  <div className="group flex items-start gap-4 sm:gap-5 pl-2 cursor-pointer">
                    {/* Node */}
                    <div className="relative z-10 flex-shrink-0 w-7 h-7 rounded-full border border-[#4ad4e4]/40 bg-white dark:bg-[#0a0a0f] flex items-center justify-center text-[#4ad4e4] text-xs font-['Cinzel'] group-hover:bg-[#4ad4e4] group-hover:text-white dark:group-hover:text-black transition-all mt-3">
                      {i + 1}
                    </div>
                    {/* Card */}
                    <div className="flex-1 bg-gray-50 dark:bg-[#13121a] border border-gray-100 dark:border-white/5 rounded-xl p-4 sm:p-5 group-hover:border-[#4ad4e4]/40 dark:group-hover:border-[#4ad4e4]/30 transition-all mb-3 shadow-sm dark:shadow-none">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className="text-[#4ad4e4]/70 dark:text-[#4ad4e4]/50 text-xs font-['Cinzel'] tracking-wider capitalize">
                            {scene.scene_type}
                          </span>
                          <p className="text-gray-700 dark:text-white font-medium mt-1 leading-snug line-clamp-2 group-hover:text-[#4ad4e4] transition-colors text-sm sm:text-base">
                            {scene.narrative_text?.slice(0, 100) || "No content"}...
                          </p>
                        </div>
                        <span className="text-gray-300 dark:text-white/20 ml-4 group-hover:text-[#4ad4e4] transition-colors flex-shrink-0">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Start CTA */}
            {firstScene && (
              <div className="mt-8 sm:mt-10">
                <Link href={`/culture/${culture_id}/${firstScene.id}`}>
                  <button className="w-full sm:w-auto px-8 sm:px-10 py-4 bg-[#4ad4e4] text-white dark:text-black font-['Cinzel'] tracking-[0.2em] font-bold rounded-xl hover:bg-[#77DAE6] transition-all text-sm hover:shadow-[0_0_40px_rgba(74,212,228,0.35)] dark:hover:shadow-[0_0_40px_rgba(74,212,228,0.2)]">
                    BEGIN JOURNEY ✦
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Characters sidebar */}
          <div>
            <h2 className="font-['Cinzel'] text-sm tracking-[0.2em] text-[#4ad4e4] mb-6 sm:mb-8">CHARACTERS</h2>
            <div className="space-y-3 sm:space-y-4">
              {characters.length === 0 ? (
                <p className="text-gray-400 dark:text-white/20 text-sm italic">No characters assigned.</p>
              ) : (
                characters.map((char) => (
                  <div
                    key={char.id}
                    className="bg-gray-50 dark:bg-[#13121a] border border-gray-100 dark:border-white/5 rounded-xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4 shadow-sm dark:shadow-none"
                  >
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-[#1e1d2a] flex-shrink-0 border border-[#4ad4e4]/25 dark:border-[#4ad4e4]/20">
                      {char.avatar_image_url ? (
                        <img src={char.avatar_image_url} alt={char.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#4ad4e4] text-lg font-['Cinzel']">
                          {char.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-['Cinzel'] text-gray-900 dark:text-white text-sm font-semibold truncate">{char.name}</p>
                      <p className="text-[#4ad4e4]/60 dark:text-[#4ad4e4]/50 text-xs capitalize mt-0.5">{char.role}</p>
                      <p className="text-gray-500 dark:text-white/40 text-xs mt-2 leading-relaxed line-clamp-2">{char.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}