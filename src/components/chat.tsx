"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useState, useRef } from "react";
import { DefaultChatTransport } from 'ai';

// Cloudinary設定
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const ENDPOINT = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export default function Chat() {
  const [input, setInput] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { messages, sendMessage, setMessages, status } =
    useChat({
      transport: new DefaultChatTransport({
        api: "/api/chat",
      })
    });

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET as string);

      const res = await fetch(ENDPOINT, { method: 'POST', body: formData });
      if (!res.ok) {
        throw new Error('画像のアップロードに失敗しました');
      }
      
      const json = await res.json();
      console.log('Uploaded image URL:', json.secure_url);
      setUploadedImageUrl(json.secure_url);
      return json.secure_url;
    } catch (error) {
      console.log(UPLOAD_PRESET);
      console.error('画像アップロードエラー:', error);
      alert('画像のアップロードに失敗しました');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください');
        return;
      }
      await uploadImage(file);
    }
  };

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    
    const parts: any[] = [];
    
    if (input.trim()) {
      parts.push({ type: 'text', text: input });
    }
    
    if (uploadedImageUrl) {
      parts.push({ 
        type: 'file', 
        url: uploadedImageUrl,
        mediaType: 'image/*'
      });
    }
    
    sendMessage({ 
      role: 'user',
      parts: parts
    });
    
    setInput('');
    setUploadedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


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
              <div className="flex flex-col gap-2">
                {message.parts.map((part, index) => {
                  if (part.type === 'text') {
                    return (
                      <div key={index} className="whitespace-pre-wrap text-gray-800">
                        {part.text}
                      </div>
                    );
                  }
                  
                  if (part.type === 'file' && part.mediaType?.startsWith('image/')) {
                    return (
                      <div key={index}>
                        <img 
                          src={part.url} 
                          alt="添付画像"
                          className="max-w-sm rounded-lg border border-gray-300"
                        />
                      </div>
                    );
                  }
                  
                  return null;
                })}
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

      <form onSubmit={handleSubmit} className="space-y-2">
        {uploadedImageUrl && (
          <div className="relative inline-block">
            <img 
              src={uploadedImageUrl} 
              alt="アップロード画像" 
              className="max-h-32 rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={() => {
                setUploadedImageUrl(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={status === "streaming" || status === "submitted" || isUploading}
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={status === "streaming" || status === "submitted" || isUploading}
            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            title="画像を添付"
          >
            {isUploading ? '📤' : '📎'}
          </button>
          
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="メッセージを入力してください..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
            disabled={status === "streaming" || status === "submitted"}
          />
          
          <button
            type="submit"
            disabled={(status === "streaming" || status === "submitted") || (!input.trim() && !uploadedImageUrl)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            送信
          </button>
        </div>
      </form>
    </div>
  );
}
