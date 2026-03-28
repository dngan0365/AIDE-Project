/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getStory, Story, startStory, checkStartStory, UserStory } from "@/api/story";
import { listScenes, Scene, advanceScene } from "@/api/scene";
import { listCharactersForStory, Character } from "@/api/character";
import MarkdownDisplay from "@/components/markdown/MarkdownDisplay";

export default function CultureDetailPage() {
  const { culture_id } = useParams<{ culture_id: string }>();
  const router = useRouter();

  const [story, setStory] = useState<Story | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [userStory, setUserStory] = useState<UserStory | null>(null);
  const [loading, setLoading] = useState(true);

  // Scene picker modal state
  const [showScenePicker, setShowScenePicker] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getStory(culture_id),
      listScenes(culture_id),
      listCharactersForStory(culture_id),
      checkStartStory(culture_id).catch(() => null),
    ]).then(([s, sc, ch, us]) => {
      setStory(s);
      setScenes(sc.sort((a: Scene, b: Scene) => a.scene_order - b.scene_order));
      setCharacters(ch);
      setUserStory(us);
    }).finally(() => setLoading(false));
  }, [culture_id]);

  /* ── derived state ── */
  const status = userStory?.status ?? "not_started";

  const currentSceneIndex = userStory?.current_scene_id
    ? scenes.findIndex((s) => s.id === userStory.current_scene_id)
    : -1;

  // Scenes trước current đều là completed
  const completedCount = currentSceneIndex === -1
    ? 0
    : status === "completed"
    ? scenes.length
    : currentSceneIndex;

  const progressPct = scenes.length > 0 ? Math.round((completedCount / scenes.length) * 100) : 0;

  // Index của scene tiếp theo có thể chọn
  const nextSceneIndex = currentSceneIndex + 1;

  /* ── scene selectable check ── */
  // Chỉ cho phép chọn current scene hoặc next scene
  function isSelectable(index: number): boolean {
    if (status === "completed") return false;
    return index === currentSceneIndex || index === nextSceneIndex;
  }

  /* ── handlers ── */
  async function handleBeginJourney() {
    setStarting(true);
    setStartError(null);
    try {
      await startStory(culture_id);
      const us = await checkStartStory(culture_id);
      setUserStory(us);
      setShowScenePicker(true);
    } catch (err) {
      console.error(err);
      setStartError("Failed to start the story. Please try again.");
    } finally {
      setStarting(false);
    }
  }

  async function handleContinueJourney() {
    if (!userStory?.current_scene_id) return;

    try {
      const nextScene = await advanceScene(
        userStory.current_scene_id,
        culture_id
      );

      // update state để progress bar sync
      const us = await checkStartStory(culture_id);
      setUserStory(us);

      // navigate tới scene mới
      router.push(`/culture/${culture_id}/${nextScene.id}`);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSelectScene(sceneId: string, index: number) {
    if (!isSelectable(index)) return;

    setShowScenePicker(false);
    try {
      if (index === currentSceneIndex) {
        // Clicking the current scene → just navigate, no advance
        router.push(`/culture/${culture_id}/${sceneId}`);
      } else {
        // Clicking the next scene → advance from current, navigate to returned scene
        const sourceSceneId = userStory?.current_scene_id ?? sceneId;
        const nextScene = await advanceScene(sourceSceneId, culture_id);
        // Refresh userStory so progress bar and state update
        const us = await checkStartStory(culture_id);
        setUserStory(us);
        router.push(`/culture/${culture_id}/${nextScene.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  /* ── scene status helpers ── */
  function sceneStatus(index: number): "completed" | "current" | "locked" {
    if (status === "completed") return "completed";
    if (index < completedCount) return "completed";
    if (index === currentSceneIndex) return "current";
    return "locked";
  }

  /* ── loading / not found ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex items-center justify-center transition-colors">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white font-['Crimson_Text'] transition-colors duration-300">

      {/* Hero */}
      <div className="relative h-[55vh] sm:h-[65vh] lg:h-[70vh] min-h-100 sm:min-h-[500px] overflow-hidden">
        {story.cover_image_url ? (
          <img
            src={story.cover_image_url}
            alt={story.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-[#d0f5f8] to-[#f0feff] dark:from-[#0d1f24] dark:to-[#0a0a0f]" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-white dark:from-[#0a0a0f] via-white/50 dark:via-[#0a0a0f]/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-white/70 dark:from-[#0a0a0f]/80 to-transparent" />

        <div className="absolute top-5 sm:top-8 left-4 sm:left-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 dark:text-white/50 hover:text-primary dark:hover:text-white transition-colors font-['Cinzel'] text-xs tracking-widest"
          >
            ← BACK
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-8 sm:pb-12 max-w-4xl">
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="font-['Cinzel'] text-xs tracking-widest px-3 py-1.5 border border-[#4ad4e4]/60 text-[#4ad4e4] rounded-full capitalize bg-white/60 dark:bg-transparent">
              {story.culture_type}
            </span>
            <span className="font-['Cinzel'] text-xs tracking-widest px-3 py-1.5 border border-gray-300 dark:border-white/20 text-gray-500 dark:text-white/50 rounded-full bg-white/60 dark:bg-transparent">
              {story.country}
            </span>
            {status === "completed" && (
              <span className="font-['Cinzel'] text-xs tracking-widest px-3 py-1.5 border border-emerald-400/60 text-emerald-500 dark:text-emerald-400 rounded-full bg-white/60 dark:bg-transparent">
                ✦ COMPLETED
              </span>
            )}
            {status === "in_progress" && (
              <span className="font-['Cinzel'] text-xs tracking-widest px-3 py-1.5 border border-amber-400/60 text-amber-500 dark:text-amber-400 rounded-full bg-white/60 dark:bg-transparent">
                ◈ IN PROGRESS
              </span>
            )}
          </div>

          <h1 className="font-['Cinzel'] text-3xl sm:text-5xl md:text-6xl font-bold leading-tight mb-3 sm:mb-4 text-gray-900 dark:text-white drop-shadow-2xl">
            {story.title}
          </h1>
          <p className="text-gray-600 dark:text-white/70 text-base sm:text-xl leading-relaxed max-w-2xl line-clamp-3 sm:line-clamp-none">
            {story.description}
          </p>
          {story.content && (
            <div className="mt-6 sm:mt-8 bg-gray-50 dark:bg-[#13121a] border border-gray-100 dark:border-white/5 rounded-xl p-5 sm:p-6 shadow-sm">
              <h2 className="font-['Cinzel'] text-sm tracking-[0.2em] text-primary mb-4">
                CULTURE INSIGHT
              </h2>

              <MarkdownDisplay value={story.content} />
            </div>
          )}
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

          {status !== "not_started" && scenes.length > 0 && (
            <div className="col-span-2 sm:col-span-1 sm:ml-auto">
              <p className="font-['Cinzel'] text-xs tracking-widest text-[#4ad4e4]/60 dark:text-[#4ad4e4]/50 mb-1">
                PROGRESS
              </p>
              <div className="flex items-center gap-3">
                <div className="w-32 sm:w-40 h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#4ad4e4] transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="font-['Cinzel'] text-xs text-gray-500 dark:text-white/50 tabular-nums">
                  {completedCount}/{scenes.length}
                </span>
              </div>
              {userStory?.xp_earned != null && userStory.xp_earned > 0 && (
                <p className="font-['Cinzel'] text-xs text-[#4ad4e4] mt-1 tracking-wide">
                  +{userStory.xp_earned} XP earned
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">

          {/* Scenes */}
          <div className="lg:col-span-2">
            <h2 className="font-['Cinzel'] text-sm tracking-[0.2em] text-[#4ad4e4] mb-6 sm:mb-8">CHAPTERS</h2>
            <div className="space-y-3 relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-[#4ad4e4]/30 via-[#4ad4e4]/10 to-transparent" />

              {scenes.map((scene, i) => {
                const sStatus = sceneStatus(i);
                const isCurrent = sStatus === "current";
                const isDone = sStatus === "completed";
                const selectable = isSelectable(i);

                // Completed scenes → Link (read-only view), others → div
                const sceneContent = (
                  <div className="group flex items-start gap-4 sm:gap-5 pl-2">
                    <div
                      className={`relative z-10 flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-['Cinzel'] transition-all mt-3
                        ${isDone
                          ? "border-emerald-400 bg-emerald-400 text-white"
                          : isCurrent
                          ? "border-[#4ad4e4] bg-[#4ad4e4] text-white dark:text-black animate-pulse"
                          : "border-[#4ad4e4]/40 bg-white dark:bg-[#0a0a0f] text-[#4ad4e4]"
                        }`}
                    >
                      {isDone ? "✓" : i + 1}
                    </div>

                    <div
                      className={`flex-1 border rounded-xl p-4 sm:p-5 transition-all mb-3 shadow-sm dark:shadow-none
                        ${isDone
                          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-500/15"
                          : isCurrent
                          ? "bg-[#4ad4e4]/5 border-[#4ad4e4]/40 dark:border-[#4ad4e4]/30"
                          : "bg-gray-50 dark:bg-[#13121a] border-gray-100 dark:border-white/5"
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[#4ad4e4]/70 dark:text-[#4ad4e4]/50 text-xs font-['Cinzel'] tracking-wider capitalize">
                              {scene.scene_type}
                            </span>
                            {isCurrent && (
                              <span className="font-['Cinzel'] text-[10px] tracking-widest px-2 py-0.5 rounded-full bg-[#4ad4e4]/15 text-[#4ad4e4] border border-[#4ad4e4]/30">
                                CURRENT
                              </span>
                            )}
                            {isDone && (
                              <span className="font-['Cinzel'] text-[10px] tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                DONE
                              </span>
                            )}
                            {/* Lock icon for non-accessible scenes */}
                            {sStatus === "locked" && status !== "not_started" && (
                              <span className="font-['Cinzel'] text-[10px] tracking-widest px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/25 border border-gray-200 dark:border-white/10">
                                🔒 LOCKED
                              </span>
                            )}
                          </div>
                          <p
                            className={`font-medium mt-1 leading-snug line-clamp-2 transition-colors text-sm sm:text-base
                              ${isDone
                                ? "text-gray-400 dark:text-white/40"
                                : isCurrent
                                ? "text-[#4ad4e4]"
                                : "text-gray-400 dark:text-white/25"
                              }`}
                          >
                            {scene.narrative_text?.slice(0, 100) || "No content"}...
                          </p>
                        </div>
                        <span
                          className={`ml-4 transition-colors flex-shrink-0
                            ${isDone ? "text-emerald-400" : isCurrent ? "text-[#4ad4e4]" : "text-gray-200 dark:text-white/10"}`}
                        >
                          {isDone ? "→" : isCurrent ? "→" : "🔒"}
                        </span>
                      </div>
                    </div>
                  </div>
                );

                // Completed scenes are navigable links (review only)
                if (isDone) {
                  return (
                    <Link key={scene.id} href={`/culture/${culture_id}/${scene.id}`}>
                      <div className="cursor-pointer">{sceneContent}</div>
                    </Link>
                  );
                }

                // Current scene → direct navigate
                if (isCurrent) {
                  return (
                    <div
                      key={scene.id}
                      className="cursor-pointer"
                      onClick={() => handleSelectScene(scene.id, i)}
                    >
                      {sceneContent}
                    </div>
                  );
                }

                // Locked scenes → not clickable
                return (
                  <div key={scene.id} className="cursor-not-allowed opacity-60">
                    {sceneContent}
                  </div>
                );
              })}
            </div>

            {/* ── CTA ── */}
            {scenes.length > 0 && (
              <div className="mt-8 sm:mt-10 space-y-2">

                {status === "not_started" && (
                  <button
                    onClick={handleBeginJourney}
                    disabled={starting}
                    className="w-full sm:w-auto px-8 sm:px-10 py-4 bg-[#4ad4e4] text-white dark:text-black font-['Cinzel'] tracking-[0.2em] font-bold rounded-xl hover:bg-[#77DAE6] transition-all text-sm hover:shadow-[0_0_40px_rgba(74,212,228,0.35)] dark:hover:shadow-[0_0_40px_rgba(74,212,228,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                  >
                    {starting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        STARTING…
                      </>
                    ) : (
                      "BEGIN JOURNEY ✦"
                    )}
                  </button>
                )}

                {status === "in_progress" && (
                  <button
                    onClick={handleContinueJourney}
                    className="w-full sm:w-auto px-8 sm:px-10 py-4 bg-[#4ad4e4] text-white dark:text-black font-['Cinzel'] tracking-[0.2em] font-bold rounded-xl hover:bg-[#77DAE6] transition-all text-sm hover:shadow-[0_0_40px_rgba(74,212,228,0.35)] dark:hover:shadow-[0_0_40px_rgba(74,212,228,0.2)] flex items-center gap-3"
                  >
                    CONTINUE JOURNEY ◈
                  </button>
                )}

                {status === "completed" && (
                  <div className="flex items-center gap-4">
                    <div className="px-8 py-4 border border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-['Cinzel'] tracking-[0.2em] font-bold rounded-xl text-sm flex items-center gap-3">
                      ✦ JOURNEY COMPLETE
                    </div>
                    {userStory?.xp_earned != null && (
                      <span className="font-['Cinzel'] text-sm text-[#4ad4e4]">
                        +{userStory.xp_earned} XP
                      </span>
                    )}
                  </div>
                )}

                {startError && (
                  <p className="text-red-400 text-xs font-['Cinzel'] tracking-wide">{startError}</p>
                )}
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

      {/* ── Scene Picker Modal (hiện sau BEGIN, chỉ cho chọn scene hợp lệ) ── */}
      {showScenePicker && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowScenePicker(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#13121a] rounded-2xl border border-gray-100 dark:border-white/8 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-['Cinzel'] text-base font-bold text-gray-900 dark:text-white tracking-wide">
                  START YOUR JOURNEY
                </h3>
                <p className="text-gray-400 dark:text-white/30 text-xs mt-1 font-['Cinzel'] tracking-widest">
                  BEGIN FROM YOUR CURRENT SCENE
                </p>
              </div>
              <button
                onClick={() => setShowScenePicker(false)}
                className="text-gray-300 dark:text-white/20 hover:text-gray-500 dark:hover:text-white/60 transition-colors text-lg leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh] px-4 py-4 space-y-2">
              {scenes.map((scene, i) => {
                const selectable = isSelectable(i);
                return (
                  <button
                    key={scene.id}
                    disabled={!selectable}
                    onClick={() => {
                      if (!selectable) return;
                      handleSelectScene(scene.id, i);
                    }}
                    className={`w-full text-left group flex items-start gap-4 p-4 rounded-xl border transition-all
                      ${selectable
                        ? "border-gray-100 dark:border-white/5 hover:border-[#4ad4e4]/50 dark:hover:border-[#4ad4e4]/30 hover:bg-gray-50 dark:hover:bg-[#1a1929] cursor-pointer"
                        : "border-gray-100 dark:border-white/5 opacity-35 cursor-not-allowed"
                      }`}
                  >
                    <span
                      className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-['Cinzel'] transition-all mt-0.5
                        ${selectable
                          ? "border-[#4ad4e4]/40 text-[#4ad4e4] group-hover:bg-[#4ad4e4] group-hover:text-white dark:group-hover:text-black"
                          : "border-gray-300 dark:border-white/10 text-gray-300 dark:text-white/20"
                        }`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-['Cinzel'] tracking-wider capitalize block
                          ${selectable ? "text-[#4ad4e4]/60" : "text-gray-300 dark:text-white/20"}`}>
                          {scene.scene_type}
                        </span>
                        {i === currentSceneIndex && (
                          <span className="font-['Cinzel'] text-[10px] tracking-widest px-2 py-0.5 rounded-full bg-[#4ad4e4]/15 text-[#4ad4e4] border border-[#4ad4e4]/30">
                            CURRENT
                          </span>
                        )}
                        {i === nextSceneIndex && currentSceneIndex >= 0 && (
                          <span className="font-['Cinzel'] text-[10px] tracking-widest px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                            NEXT
                          </span>
                        )}
                        {!selectable && (
                          <span className="text-[10px] text-gray-300 dark:text-white/20">🔒</span>
                        )}
                      </div>
                      <p className={`text-sm leading-snug line-clamp-2 transition-colors font-['Crimson_Text']
                        ${selectable
                          ? "text-gray-700 dark:text-white/80 group-hover:text-[#4ad4e4]"
                          : "text-gray-300 dark:text-white/20"
                        }`}>
                        {scene.narrative_text?.slice(0, 120) || "No content"}…
                      </p>
                    </div>
                    <span className={`transition-colors flex-shrink-0 mt-1
                      ${selectable
                        ? "text-gray-200 dark:text-white/15 group-hover:text-[#4ad4e4]"
                        : "text-gray-100 dark:text-white/10"
                      }`}>
                      {selectable ? "→" : "🔒"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5">
              <button
                onClick={() => setShowScenePicker(false)}
                className="w-full py-2.5 text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 font-['Cinzel'] text-xs tracking-widest transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}