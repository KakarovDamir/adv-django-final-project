'use client';

import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { useParams } from 'next/navigation';

export default function VideoCallPage() {
  const params = useParams();
  const roomId = typeof params.roomId === 'string' ? params.roomId : '';
  const [stream, setStream] = useState<MediaStream | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const userVideo = useRef<HTMLVideoElement | null>(null);
  const partnerVideo = useRef<HTMLVideoElement | null>(null);
  const peerRef = useRef<Peer.Instance | null>(null);

  // 1. Получаем камеру один раз
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((localStream) => {
        console.log('🎥 Камера получена');
        setStream(localStream);
        if (userVideo.current && !userVideo.current.srcObject) {
          userVideo.current.srcObject = localStream;
        }
      })
      .catch((err) => {
        console.error('🚫 Ошибка доступа к камере:', err);
        alert('Ошибка доступа к камере.');
      });
  }, []);

  // 2. Подключаем WebSocket и Peer когда stream готов
  useEffect(() => {
    if (!roomId || !stream) return;

    console.log('🔥 Подключаем WebSocket в room:', roomId);
    socketRef.current = new WebSocket(`ws://localhost:8000/ws/call/${roomId}/`);

    socketRef.current.onopen = () => console.log('✅ WebSocket подключен');

    socketRef.current.onerror = (err) => console.error('❌ WebSocket ошибка', err);

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const signal = data.data;

      if (signal.type === 'offer') {
        if (!peerRef.current) {
          const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
          });

          peer.on('signal', (signal: Peer.SignalData) => {
            socketRef.current?.send(JSON.stringify({ type: 'answer', signal }));
          });

          peer.on('stream', (remoteStream: MediaStream) => {
            console.log('📺 Получен remoteStream');
            if (partnerVideo.current && !partnerVideo.current.srcObject) {
              partnerVideo.current.srcObject = remoteStream;
            }
          });

          try {
            peer.signal(signal.signal);
          } catch (err) {
            console.error('🚫 Ошибка при signal(offer):', err);
          }

          peerRef.current = peer;
        } else {
          console.warn('⚠️ Игнорируем повторный offer: peer уже существует');
        }
      }

      if (signal.type === 'answer') {
        if (peerRef.current) {
          try {
            peerRef.current.signal(signal.signal);
          } catch (err) {
            console.error('🚫 Ошибка при signal(answer):', err);
          }
        } else {
          console.warn('⚠️ Ответ получен, но peer уже уничтожен');
        }
      }
    };

    // Инициатор peer
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on('signal', (signal) => {
      socketRef.current?.send(JSON.stringify({ type: 'offer', signal }));
    });

    peer.on('stream', (remoteStream) => {
      console.log('📺 Пришёл remoteStream');
      if (partnerVideo.current && !partnerVideo.current.srcObject) {
        partnerVideo.current.srcObject = remoteStream;
      }
    });

    peerRef.current = peer;

    return () => {
      console.log('🧹 Отключаем WebSocket и Peer');
      socketRef.current?.close();
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };
  }, [roomId, stream]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="text-2xl font-semibold">Room: {roomId}</div>
      <div className="flex gap-8">
        <div>
          <p className="text-center">Вы</p>
          <video playsInline muted ref={userVideo} autoPlay className="w-64 h-48 bg-black rounded" />
        </div>
        <div>
          <p className="text-center">Собеседник</p>
          <video playsInline ref={partnerVideo} autoPlay className="w-64 h-48 bg-black rounded" />
        </div>
      </div>
    </div>
  );
}
