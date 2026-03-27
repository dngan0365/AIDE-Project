/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { sendMessage, getChatHistory } from "@/api/chat";
import { getCharacter, Character } from "@/api/character";

type Message = {
  role: "user" | "model";
  content: string;
};

type Props = {
  sceneId: string;
  characterId?: string;
};

export default function ChatBot({ sceneId, characterId }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [character, setCharacter] = useState<Character | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ================= LOAD CHARACTER =================
  useEffect(() => {
    if (characterId) {
      getCharacter(characterId).then(setCharacter);
    }
  }, [characterId]);

  // ================= LOAD HISTORY =================
  useEffect(() => {
    if (open) {
      getChatHistory(sceneId).then((history) => {
        if (history.length === 0 && character) {
          setMessages([
            {
              role: "model",
              content:
                character.description ||
                `Hello, I am ${character.name}. How can I help you?`,
            },
          ]);
        } else {
          setMessages(history);
        }
      });
    }
  }, [open, sceneId, character]);

  // ================= AUTO SCROLL =================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ================= SEND MESSAGE =================
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", content: input };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendMessage({
        scene_id: sceneId,
        character_id: characterId,
        message: input,
      });

      setMessages((prev) => [...prev, res]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Something went wrong. Try again." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="relative z-[9999]">
      {/* ================= FLOAT BUTTON ================= */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-[9999] w-14 h-14 rounded-full shadow-lg border border-primary/30 bg-white dark:bg-[#13121a] flex items-center justify-center hover:scale-105 transition"
        >
          {character?.avatar_image_url ? (
            <img
              src={character.avatar_image_url}
              alt="AI Character"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-primary font-bold">AI</span>
          )}
        </button>
      )}

      {/* ================= CHAT WINDOW ================= */}
      {open && (
        <div className="fixed bottom-4 right-4 z-[9999] w-[90vw] sm:w-[360px] h-[500px] bg-white dark:bg-[#13121a] border border-gray-200 dark:border-primary/20 rounded-2xl shadow-xl flex flex-col overflow-hidden">

          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              {character?.avatar_image_url && (
                <img
                  src={character.avatar_image_url}
                  alt="AI Character"
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <span className="text-sm font-semibold">
                {character?.name || "AI"}
              </span>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-primary"
            >
              ✕
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-xl max-w-[80%] ${
                    m.role === "user"
                      ? "bg-primary text-black"
                      : "bg-gray-100 dark:bg-white/10"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-xs text-gray-400 animate-pulse">
                Typing...
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <div className="p-3 border-t border-gray-200 dark:border-white/10 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#0a0a0f] text-sm focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-primary rounded-lg text-black text-sm hover:opacity-90"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}