"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { listChallengesForScene, Challenge, submitChallengeAttempt, getUserAttempts } from "@/api/challenge";

type AttemptResult = { correct: boolean; xp?: number; message?: string } | null;

export default function ChallengePage() {
  const { culture_id, scene_id } = useParams<{ culture_id: string; scene_id: string }>();
  const router = useRouter();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AttemptResult>(null);
  const [completed, setCompleted] = useState(false);
  const [totalXp, setTotalXp] = useState(0);
  const [attempts, setAttempts] = useState<number>(0);

  useEffect(() => {
    listChallengesForScene(scene_id)
      .then(setChallenges)
      .finally(() => setLoading(false));
  }, [scene_id]);

  const challenge = challenges[current];

  const reset = () => {
    setAnswer("");
    setSelectedOption(null);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!challenge) return;
    const answerGiven = challenge.type === "quiz" ? (selectedOption ?? "") : answer;
    if (!answerGiven.trim()) return;

    setSubmitting(true);
    try {
      await submitChallengeAttempt(challenge.id, answerGiven);
      const isCorrect =
        answerGiven.trim().toLowerCase() === challenge.correct_answer.trim().toLowerCase();
      const xpEarned = isCorrect ? 50 : 0;
      setResult({ correct: isCorrect, xp: xpEarned });
      if (isCorrect) setTotalXp((p) => p + xpEarned);
    } catch {
      setResult({ correct: false, message: "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (current + 1 >= challenges.length) {
      setCompleted(true);
    } else {
      setCurrent((c) => c + 1);
      reset();
    }
  };

  const getOptions = (ch: Challenge): string[] => {
    if (!ch.options) return [];
    if (Array.isArray(ch.options)) return ch.options as string[];
    return Object.values(ch.options) as string[];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#060608] flex items-center justify-center transition-colors duration-300">
        <div className="w-10 h-10 border-2 border-[#4ad4e4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#060608] flex flex-col items-center justify-center gap-6 transition-colors duration-300">
        <p className="font-['Cinzel'] text-black/30 dark:text-white/30">No challenges for this scene.</p>
        <button
          onClick={() => router.back()}
          className="font-['Cinzel'] text-xs tracking-widest text-[#4ad4e4] hover:underline"
        >
          ← RETURN
        </button>
      </div>
    );
  }

  // Completed state
  if (completed) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#060608] flex items-center justify-center font-['Crimson_Text'] transition-colors duration-300">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#e8fafb_0%,_white_70%)] dark:bg-[radial-gradient(ellipse_at_center,_#1a1025_0%,_#060608_70%)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-[#4ad4e4]/8 blur-[120px] sm:blur-[150px] rounded-full" />
        </div>

        <div className="relative text-center max-w-md mx-auto px-6">
          <div className="text-5xl sm:text-6xl mb-5 sm:mb-6 text-[#4ad4e4]">✦</div>
          <p className="font-['Cinzel'] text-xs tracking-[0.3em] sm:tracking-[0.4em] text-[#4ad4e4]/70 dark:text-[#4ad4e4]/60 mb-3">
            CHALLENGE COMPLETE
          </p>
          <h1 className="font-['Cinzel'] text-3xl sm:text-4xl font-bold text-black dark:text-white mb-4">
            Well Done!
          </h1>
          <p className="text-black/50 dark:text-white/50 text-base sm:text-lg mb-8">
            You answered {challenges.length} challenge{challenges.length > 1 ? "s" : ""} and earned{" "}
            <span className="text-[#4ad4e4] font-semibold">{totalXp} XP</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => router.push(`/culture/${culture_id}/${scene_id}`)}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 border border-[#4ad4e4]/50 text-[#4ad4e4] font-['Cinzel'] tracking-widest text-xs sm:text-sm rounded-xl hover:bg-[#4ad4e4]/10 transition-all"
            >
              ← BACK TO SCENE
            </button>
            <button
              onClick={() => router.push(`/culture/${culture_id}`)}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-[#4ad4e4] text-black font-['Cinzel'] tracking-widest text-xs sm:text-sm font-bold rounded-xl hover:bg-[#77DAE6] transition-all hover:shadow-[0_0_30px_rgba(74,212,228,0.3)]"
            >
              CONTINUE STORY →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const options = getOptions(challenge);
  const progress = ((current) / challenges.length) * 100;
  const typeLabel: Record<string, string> = {
    quiz: "QUIZ",
    puzzle: "PUZZLE",
    riddle: "RIDDLE",
    matching: "MATCHING",
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#060608] text-black dark:text-white font-['Crimson_Text'] relative transition-colors duration-300">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#e8fafb_0%,_white_70%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,_#0f0a1e_0%,_#060608_70%)]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-[#4ad4e4]/6 blur-[120px] sm:blur-[150px] rounded-full" />
        <div className="absolute top-0 right-0 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] bg-[#4ad4e4]/4 blur-[80px] sm:blur-[100px] rounded-full" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="font-['Cinzel'] text-xs tracking-widest text-black/30 dark:text-white/30 hover:text-black/70 dark:hover:text-white/70 transition-colors"
        >
          ← SCENE
        </button>
        <div className="flex items-center gap-4">
          <span className="font-['Cinzel'] text-xs tracking-widest text-[#4ad4e4]/60 dark:text-[#4ad4e4]/50">
            {current + 1} / {challenges.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-8 mb-8 sm:mb-10">
        <div className="h-1 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#4ad4e4] to-[#77DAE6] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Challenge card */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pb-20 sm:pb-24">

        {/* Type badge */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <span className="px-3 py-1.5 border border-[#4ad4e4]/50 bg-[#4ad4e4]/10 text-[#4ad4e4] text-xs font-['Cinzel'] tracking-widest rounded-full">
            {typeLabel[challenge.type] ?? challenge.type.toUpperCase()}
          </span>
          {challenge.max_attempt > 0 && (
            <span className="text-black/30 dark:text-white/25 text-xs font-['Cinzel']">
              MAX {challenge.max_attempt} ATTEMPTS
            </span>
          )}
        </div>

        {/* Question / narrative */}
        <div className="bg-[#f0fafb]/90 dark:bg-[#0d0c14]/80 backdrop-blur-sm border border-[#4ad4e4]/15 dark:border-[#4ad4e4]/10 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 relative shadow-sm dark:shadow-none">
          <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-[#4ad4e4]/40 dark:border-[#4ad4e4]/30" />
          <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-[#4ad4e4]/40 dark:border-[#4ad4e4]/30" />
          <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-[#4ad4e4]/40 dark:border-[#4ad4e4]/30" />
          <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-[#4ad4e4]/40 dark:border-[#4ad4e4]/30" />

          <p className="text-lg sm:text-xl md:text-2xl text-black/85 dark:text-white/90 leading-relaxed">
            {challenge.correct_answer ? "What is the answer?" : "Complete this challenge."}
          </p>
          {challenge.options && typeof challenge.options === "object" && "question" in challenge.options && (
            <p className="text-lg sm:text-xl md:text-2xl text-black/85 dark:text-white/90 leading-relaxed mt-2">
              {String((challenge.options as Record<string, unknown>).question)}
            </p>
          )}
        </div>

        {/* Input area */}
        {challenge.type === "quiz" && options.length > 0 ? (
          <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
            {options.map((opt, i) => {
              const isSelected = selectedOption === opt;
              const isCorrect = result && opt === challenge.correct_answer;
              const isWrong = result && isSelected && !result.correct;

              return (
                <button
                  key={i}
                  onClick={() => !result && setSelectedOption(opt)}
                  disabled={!!result}
                  className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all duration-300 ${
                    isCorrect
                      ? "border-emerald-500/60 bg-emerald-50 dark:bg-emerald-900/20"
                      : isWrong
                      ? "border-red-500/60 bg-red-50 dark:bg-red-900/20"
                      : isSelected
                      ? "border-[#4ad4e4] bg-[#4ad4e4]/10"
                      : "border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#13121a] hover:border-[#4ad4e4]/50 dark:hover:border-[#4ad4e4]/40 hover:bg-[#f0fafb] dark:hover:bg-[#13121a] shadow-sm dark:shadow-none"
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span
                      className={`font-['Cinzel'] text-sm w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 border ${
                        isCorrect
                          ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                          : isWrong
                          ? "border-red-500 text-red-600 dark:text-red-400"
                          : isSelected
                          ? "border-[#4ad4e4] text-[#4ad4e4]"
                          : "border-black/20 dark:border-white/20 text-black/40 dark:text-white/30"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span
                      className={`text-sm sm:text-base flex-1 ${
                        isSelected || isCorrect
                          ? "text-black dark:text-white"
                          : "text-black/70 dark:text-white/70"
                      }`}
                    >
                      {opt}
                    </span>
                    {isCorrect && (
                      <span className="ml-auto text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex-shrink-0">
                        ✓ Correct
                      </span>
                    )}
                    {isWrong && (
                      <span className="ml-auto text-red-600 dark:text-red-400 text-xs sm:text-sm flex-shrink-0">
                        ✗ Wrong
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mb-6 sm:mb-8">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={!!result}
              placeholder="Enter your answer..."
              rows={3}
              className="w-full bg-white/80 dark:bg-[#13121a] border border-black/10 dark:border-white/10 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-black dark:text-white placeholder-black/25 dark:placeholder-white/20 focus:outline-none focus:border-[#4ad4e4]/60 dark:focus:border-[#4ad4e4]/50 transition-colors resize-none text-base sm:text-lg shadow-sm dark:shadow-none"
            />
          </div>
        )}

        {/* Feedback */}
        {result && (
          <div
            className={`mb-5 sm:mb-6 p-4 sm:p-5 rounded-xl border ${
              result.correct
                ? "border-emerald-500/40 bg-emerald-50 dark:bg-emerald-900/20"
                : "border-red-500/40 bg-red-50 dark:bg-red-900/20"
            }`}
          >
            <div className="flex items-start sm:items-center gap-3">
              <span className="text-xl sm:text-2xl mt-0.5 sm:mt-0">
                {result.correct ? "✦" : "✗"}
              </span>
              <div>
                <p
                  className={`font-['Cinzel'] text-xs sm:text-sm font-semibold ${
                    result.correct
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {result.correct ? "CORRECT!" : "INCORRECT"}
                </p>
                {result.correct && result.xp && (
                  <p className="text-black/50 dark:text-white/50 text-xs sm:text-sm mt-0.5">
                    +{result.xp} XP earned
                  </p>
                )}
                {!result.correct && (
                  <p className="text-black/50 dark:text-white/50 text-xs sm:text-sm mt-0.5">
                    The answer was:{" "}
                    <span className="text-black dark:text-white">{challenge.correct_answer}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action */}
        <div className="flex gap-3 sm:gap-4">
          {!result ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || (challenge.type === "quiz" ? !selectedOption : !answer.trim())}
              className="flex-1 sm:flex-none px-6 sm:px-8 py-3 bg-[#4ad4e4] text-black font-['Cinzel'] tracking-widest text-xs sm:text-sm font-bold rounded-xl hover:bg-[#77DAE6] transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(74,212,228,0.3)]"
            >
              {submitting ? "SUBMITTING..." : "SUBMIT ANSWER"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 sm:flex-none px-6 sm:px-8 py-3 bg-[#4ad4e4] text-black font-['Cinzel'] tracking-widest text-xs sm:text-sm font-bold rounded-xl hover:bg-[#77DAE6] transition-all hover:shadow-[0_0_30px_rgba(74,212,228,0.3)]"
            >
              {current + 1 >= challenges.length ? "FINISH ✦" : "NEXT →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}