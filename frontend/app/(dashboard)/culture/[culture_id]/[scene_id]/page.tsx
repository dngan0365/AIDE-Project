/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getScene, Scene, getSceneChoices, SceneChoice, submitSceneChoice, SceneChoiceSubmit } from "@/api/scene";
import { getCharacter, Character } from "@/api/character";
import { listChallengesForScene, Challenge } from "@/api/challenge";
import ChatBot from "@/components/chat/ChatBot";
import MarkdownDisplay from "@/components/markdown/MarkdownDisplay";

export default function ScenePage() {
  const { culture_id, scene_id } = useParams<{ culture_id: string; scene_id: string }>();
  const router = useRouter();

  const [scene, setScene] = useState<Scene | null>(null);
  const [choices, setChoices] = useState<SceneChoice[]>([]);
  const [character, setCharacter] = useState<Character | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      getScene(scene_id),
      getSceneChoices(scene_id),
      listChallengesForScene(scene_id),
    ]).then(async ([sc, ch, chall]) => {
      setScene(sc);
      setChoices(ch);
      setChallenges(chall);
      if (sc.character_id) {
        try {
          const char = await getCharacter(sc.character_id);
          setCharacter(char);
        } catch {}
      }
      setLoading(false);
      setTimeout(() => setTextVisible(true), 100);
    });
  }, [scene_id]);

  const handleChoiceSelect = (choiceId: string) => {
    if (revealed) return;
    setSelectedChoice(choiceId);
  };

  const handleReveal = async () => {
    if (!selectedChoice) return;

    const choice = choices.find((c) => c.id === selectedChoice);
    if (!choice) return;

    await submitSceneChoice(choice.id, culture_id);

    setRevealed(true);
  };

  const handleProceed = async () => {
    const choice = choices.find((c) => c.id === selectedChoice);
    if (!choice) return;

    setSubmitting(true);
    try {
      await submitSceneChoice(choice.id, culture_id );

      router.push(`/culture/${culture_id}/${choice.next_scene_id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#060608] flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-['Cinzel'] text-primary/70 dark:text-primary/50 text-xs tracking-widest">
            ENTERING THE STORY
          </p>
        </div>
      </div>
    );
  }

  if (!scene) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#060608] flex items-center justify-center transition-colors duration-300">
        <p className="font-['Cinzel'] text-black/30 dark:text-white/30">Scene not found.</p>
      </div>
    );
  }

  const hasChallenges = challenges.length > 0;

  return (
    <div className="min-h-screen bg-white dark:bg-[#060608] text-black dark:text-white font-['Crimson_Text'] relative overflow-hidden transition-colors duration-300">

      {/* Background image */}
      {scene.background_image_url && (
        <div className="fixed inset-0">
          <img
            src={scene.background_image_url}
            alt=""
            className="w-full h-full object-cover opacity-10 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/60 dark:from-[#060608] dark:via-[#060608]/80 dark:to-[#060608]/60" />
        </div>
      )}

      {/* Ambient light */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-primary/5 dark:bg-primary/5 blur-[120px] sm:blur-[180px] rounded-full" />
      </div>

      {/* Nav */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6">
        <button
          onClick={() => router.push(`/culture/${culture_id}`)}
          className="font-['Cinzel'] text-xs tracking-widest text-black/40 dark:text-white/30 hover:text-black/80 dark:hover:text-white/70 transition-colors"
        >
          ← STORY
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden sm:inline font-['Cinzel'] text-xs tracking-wider text-black/30 dark:text-white/20 capitalize">
            {scene.scene_type}
          </span>
          {hasChallenges && (
            <Link href={`/culture/${culture_id}/${scene_id}/challenge`}>
              <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 border border-primary/50 dark:border-primary/40 rounded-full text-primary text-xs font-['Cinzel'] tracking-wider hover:bg-primary/10 transition-colors">
                <span>⚡</span>
                <span className="hidden xs:inline">CHALLENGE</span>
                <span className="xs:hidden">({challenges.length})</span>
                <span className="hidden xs:inline">({challenges.length})</span>
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pb-20 sm:pb-24">

        {/* Character */}
        {character && (
          <div
            className={`flex items-center gap-3 sm:gap-4 mb-8 sm:mb-10 transition-all duration-700 ${
              textVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-primary/40 bg-[#e8fafb] dark:bg-[#13121a] flex-shrink-0 shadow-sm">
              {character.avatar_image_url ? (
                <img
                  src={character.avatar_image_url}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary text-xl">
                  {character.name[0]}
                </div>
              )}
            </div>
            <div>
              <p className="font-['Cinzel'] text-black dark:text-white text-sm font-semibold">{character.name}</p>
              <p className="text-primary/70 text-xs capitalize">{character.role}</p>
            </div>
          </div>
        )}

        {/* Narrative */}
        <div
          className={`transition-all duration-700 delay-200 ${
            textVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Decorative quote mark */}
          <div className="text-primary/10 font-['Cinzel'] text-6xl sm:text-8xl leading-none mb-1 sm:mb-2 select-none">
            &quot;
          </div>

          <div className="bg-[#f0fafb]/90 dark:bg-[#0d0c14]/80 backdrop-blur-sm border border-primary/20 dark:border-primary/10 rounded-2xl p-6 sm:p-8 md:p-10 relative shadow-sm dark:shadow-none">
            {/* Corner decorations */}
            <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-primary/40 dark:border-primary/30" />
            <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-primary/40 dark:border-primary/30" />
            <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-primary/40 dark:border-primary/30" />
            <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-primary/40 dark:border-primary/30" />

            <p className="text-black/85 dark:text-white/90 text-lg sm:text-xl md:text-2xl leading-relaxed tracking-wide">
              {scene.narrative_text}
            </p>
            {scene.content && (
              <div className="mt-6 sm:mt-8 bg-white/80 dark:bg-[#13121a]/80 border border-black/10 dark:border-white/10 rounded-xl p-5 sm:p-6 backdrop-blur-sm">
                
                <h3 className="font-['Cinzel'] text-xs tracking-[0.2em] text-primary/60 mb-3">
                  CULTURAL INSIGHT
                </h3>

                <MarkdownDisplay value={scene.content} />
              </div>
            )}
            {scene.reference && scene.reference.length > 0 && (
              <div className="mt-6 sm:mt-8">
                
                <h3 className="font-['Cinzel'] text-xs tracking-[0.2em] text-primary/60 mb-3">
                  REFERENCES
                </h3>

                <div className="space-y-2">
                  {scene.reference.map((ref, i) => (
                    <a
                      key={i}
                      href={ref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-cyan-600 dark:text-cyan-400 hover:underline break-all"
                    >
                      [{i + 1}] {ref}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Choices */}
        {choices.length > 0 && (
          <div
            className={`mt-8 sm:mt-10 transition-all duration-700 delay-500 ${
              textVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <p className="font-['Cinzel'] text-xs tracking-[0.2em] sm:tracking-[0.3em] text-primary/60 mb-4 sm:mb-5">
              WHAT WILL YOU DO?
            </p>

            <div className="space-y-2 sm:space-y-3">
              {choices.map((choice, i) => {
                const isSelected = selectedChoice === choice.id;
                const isWrong = revealed && isSelected && choice.xp_reward === 0;
                const isCorrect = revealed && choice.xp_reward > 0;

                return (
                  <button
                    key={choice.id}
                    onClick={() => handleChoiceSelect(choice.id)}
                    disabled={revealed}
                    className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all duration-300 ${
                      revealed && isCorrect
                        ? "border-emerald-500/60 bg-emerald-50 dark:bg-emerald-900/20"
                        : revealed && isSelected && isWrong
                        ? "border-red-500/60 bg-red-50 dark:bg-red-900/20"
                        : isSelected
                        ? "border-primary bg-primary/10 dark:bg-primary/10"
                        : "border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#13121a] hover:border-primary/50 dark:hover:border-primary/40 hover:bg-[#f0fafb] dark:hover:bg-[#13121a] shadow-sm dark:shadow-none"
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <span
                        className={`font-['Cinzel'] text-sm w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 border ${
                          revealed && isCorrect
                            ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                            : revealed && isSelected && isWrong
                            ? "border-red-500 text-red-600 dark:text-red-400"
                            : isSelected
                            ? "border-primary text-primary"
                            : "border-black/20 dark:border-white/20 text-black/40 dark:text-white/30"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm sm:text-base leading-relaxed ${
                            isSelected || (revealed && isCorrect)
                              ? "text-black dark:text-white"
                              : "text-black/70 dark:text-white/70"
                          }`}
                        >
                          {choice.choice_text}
                        </p>
                        {revealed && choice.description && (
                          <p className="text-black/50 dark:text-white/50 text-xs sm:text-sm mt-2 leading-relaxed">
                            {choice.description}
                          </p>
                        )}
                      </div>
                      {revealed && isCorrect && (
                        <span className="text-primary text-xs sm:text-sm font-['Cinzel'] flex-shrink-0 whitespace-nowrap">
                          +{choice.xp_reward} XP
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="mt-5 sm:mt-6 flex gap-3 sm:gap-4">
              {!revealed ? (
                <button
                  onClick={handleReveal}
                  disabled={!selectedChoice}
                  className="flex-1 sm:flex-none px-6 sm:px-8 py-3 bg-primary text-black font-['Cinzel'] tracking-widest text-xs sm:text-sm font-bold rounded-xl hover:bg-[#77DAE6] transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(74,212,228,0.35)]"
                >
                  CONFIRM CHOICE
                </button>
              ) : (
                <button
                  disabled={submitting}
                  onClick={handleProceed}
                  className="flex-1 sm:flex-none px-6 sm:px-8 py-3 bg-primary text-black font-['Cinzel'] tracking-widest text-xs sm:text-sm font-bold rounded-xl hover:bg-[#77DAE6] transition-all hover:shadow-[0_0_30px_rgba(74,212,228,0.35)]"
                >
                  CONTINUE →
                </button>
              )}
            </div>
          </div>
        )}

        {/* No choices — just continue */}
        {choices.length === 0 && (
          <div
            className={`mt-8 sm:mt-10 transition-all duration-700 delay-500 ${
              textVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {hasChallenges ? (
              <Link href={`/culture/${culture_id}/${scene_id}/challenge`}>
                <button className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-primary text-black font-['Cinzel'] tracking-widest text-xs sm:text-sm font-bold rounded-xl hover:bg-[#77DAE6] transition-all hover:shadow-[0_0_40px_rgba(74,212,228,0.35)]">
                  TAKE CHALLENGE ⚡
                </button>
              </Link>
            ) : (
              <button
                onClick={() => router.push(`/culture/${culture_id}`)}
                className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 border border-primary/50 text-primary font-['Cinzel'] tracking-widest text-xs sm:text-sm rounded-xl hover:bg-primary/10 transition-all"
              >
                RETURN TO STORY
              </button>
            )}
          </div>
        )}
      </div>
      {scene && (scene.scene_type === "dialogue" || scene.scene_type === "choice") && (
      <ChatBot
        sceneId={scene.id}
        characterId={scene.character_id}
      />
    )}
    </div>
  );
}