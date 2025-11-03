"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect } from "react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, setMessages, status } =
    useChat({
      api: "/api/chat",
    });

  // 過去のチャット履歴を読み込み
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await fetch('/api/chat/history');
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('履歴の読み込みに失敗しました:', error);
      }
    };

    loadChatHistory();
  }, [setMessages]);

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">補助金検索エージェント</h1>
        {messages.length > 0 && (
          <button
            onClick={async () => {
              try {
                await fetch('/api/chat/clear', { method: 'DELETE' });
                setMessages([]);
              } catch (error) {
                console.error('履歴のクリアに失敗しました:', error);
              }
            }}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            履歴をクリア
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-700 mt-8">
            <p>補助金情報を検索してみましょう</p>
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
        {(status === "streaming" || status === "submitted") && (
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
          placeholder="メッセージを入力してください..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
          disabled={status === "streaming" || status === "submitted"}
        />
        <button
          type="submit"
          disabled={(status === "streaming" || status === "submitted") || !input.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          送信
        </button>
      </form>
    </div>
  );
}
