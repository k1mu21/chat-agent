"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

const FIXED_THREAD_ID = "default-chat-thread";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      body: {
        threadId: FIXED_THREAD_ID,
      },
    });

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 bg-white">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-700 mt-8">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              コードレビューエージェント
            </h2>
            <p>コードを送信してレビューを受けましょう！</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-100 ml-8 text-gray-800"
                  : "bg-gray-100 mr-8 text-gray-800"
              }`}
            >
              <div className="font-semibold mb-2 text-gray-900">
                {message.role === "user" ? "あなた" : "エージェント"}
              </div>
              <div className="whitespace-pre-wrap text-gray-800">
                {message.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="bg-gray-100 mr-8 p-4 rounded-lg">
            <div className="font-semibold mb-2 text-gray-900">エージェント</div>
            <div className="text-gray-600">考え中...</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="コードやメッセージを入力してください..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          送信
        </button>
      </form>
    </div>
  );
}
