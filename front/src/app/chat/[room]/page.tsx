'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ChatRoom() {
  const { room } = useParams();
  const socketRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<{ username: string, message: string }[]>([]);
  const [input, setInput] = useState('');
  const username = 'User' + Math.floor(Math.random() * 1000); // или auth user

  useEffect(() => {
    if (!room) return;

    socketRef.current = new WebSocket(`ws://localhost:8000/ws/chat/${room}/`);

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat') {
        setMessages(prev => [...prev, { username: data.username, message: data.message }]);
      }
    };

    return () => {
      socketRef.current?.close();
    };
  }, [room]);

  const sendMessage = () => {
    if (socketRef.current && input.trim()) {
      socketRef.current.send(JSON.stringify({ username, message: input }));
      setInput('');
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Чат комнаты: {room}</h2>
      <div className="border rounded p-2 h-64 overflow-y-scroll bg-white text-black">
        {messages.map((msg, i) => (
          <div key={i}><strong>{msg.username}:</strong> {msg.message}</div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          className="border p-2 flex-1 rounded text-black"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button className="bg-blue-500 text-white px-4 rounded" onClick={sendMessage}>
          Отправить
        </button>
      </div>
    </div>
  );
}
