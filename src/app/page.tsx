"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); // New state for loading
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when new message is added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  type BotMessage = {
    content: string;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    console.log("input", input);
    setMessages((prev) => [...prev, userMsg]);

    try {
      setInput("");
      setIsLoading(true); // Start loading

      const res = await fetch("https://syr23cxixl.execute-api.us-east-1.amazonaws.com/ai-chat-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      console.log("body", { text: input });
      const data = await res.json();
      console.log(data);

      const botMessages: BotMessage[] = data.messages || [];

      botMessages.forEach((msg) => {
        setMessages((prev) => [...prev, { sender: "bot", text: msg.content }]);
      });
    } catch (err) {
      console.error("Error calling Lex:", err);
      setMessages((prev) => [...prev, { sender: "bot", text: "Error contacting bot." }]);
    } finally {
      setIsLoading(false); // Stop loading
    }

    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 bg-gray-100">
      <div className="bg-white rounded shadow p-3 max-w-2xl w-full px-2">
        <b>Knowlyzer</b> – Chat with Your Resumes and Project Docs
      </div>
      <div className="w-full max-w-2xl flex flex-col flex-grow overflow-y-auto bg-white rounded shadow p-4 mt-4 space-y-2">
        {messages.map((msg, index) => (
          <div key={index} className={`p-2 rounded-md ${msg.sender === "user" ? "bg-blue-100 self-end" : "bg-gray-200 self-start"}`}>
            {msg.text}
          </div>
        ))}

        {isLoading && (
          <div className="p-2 rounded-md bg-gray-200 self-start">
            <span>Loading...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="w-full max-w-2xl mt-4 flex">
        <input className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none" type="text" placeholder="Type your message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700">
          Send
        </button>
      </div>
    </div>
  );
}
