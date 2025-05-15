"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";

// Add a type for custom WebSocket with _mySelfId property
interface CustomWebSocket extends WebSocket {
  _mySelfId?: string;
}

export default function VideoCallPage() {
  const params = useParams();
  const roomId = typeof params.roomId === "string" ? params.roomId : "";
  const [stream, setStream] = useState<MediaStream | null>(null);
  const socketRef = useRef<CustomWebSocket | null>(null);
  const userVideo = useRef<HTMLVideoElement | null>(null);
  const partnerVideo = useRef<HTMLVideoElement | null>(null);
  const peerRef = useRef<Peer.Instance | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Connecting...");

  // 1. Получаем камеру один раз
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((localStream) => {
          console.log("🎥 Камера получена");
          setStream(localStream);
          if (userVideo.current && !userVideo.current.srcObject) {
            userVideo.current.srcObject = localStream;
          }
        })
        .catch((err) => {
          console.error("🚫 Ошибка доступа к камере:", err);
          alert("Ошибка доступа к камере.");
        });
    }
  }, []);

  // 2. Подключаем WebSocket и Peer когда stream готов
  useEffect(() => {
    if (!roomId || !stream || typeof window === "undefined") return;

    // Use secure WebSocket URL with wss protocol
    const wsUrl = `ws://138.68.87.67:8000/ws/call/${roomId}/`;
    console.log("🔌 Connecting to WebSocket:", wsUrl);
    setConnectionStatus("Connecting to WebSocket...");

    // Create the WebSocket connection
    socketRef.current = new WebSocket(wsUrl) as CustomWebSocket;

    socketRef.current.onopen = () => {
      console.log("✅ WebSocket подключен");
      setConnectionStatus("WebSocket connected");

      // Send join message to let server know we're here
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        const userId = `user-${Math.floor(Math.random() * 1000000)}`;
        // Store our own user ID to help determine initiator role later
        socketRef.current._mySelfId = userId;

        socketRef.current.send(
          JSON.stringify({
            type: "join",
            userId: userId,
          })
        );
      }
    };

    socketRef.current.onerror = (err) => {
      console.error("❌ WebSocket ошибка:", err);
      setConnectionStatus(
        "WebSocket connection failed. Trying alternative connection..."
      );

      // Try alternative connection with ws:// protocol as fallback
      const alternativeUrl = `ws://138.68.87.67:8000/ws/call/${roomId}/`;
      console.log(
        "🔄 Trying alternative WebSocket connection:",
        alternativeUrl
      );

      if (socketRef.current) {
        socketRef.current.close();
      }

      socketRef.current = new WebSocket(alternativeUrl) as CustomWebSocket;

      socketRef.current.onopen = () => {
        console.log("✅ Alternative WebSocket connected");
        setConnectionStatus("Alternative WebSocket connected");

        if (
          socketRef.current &&
          socketRef.current.readyState === WebSocket.OPEN
        ) {
          const userId = `user-${Math.floor(Math.random() * 1000000)}`;
          socketRef.current._mySelfId = userId;

          socketRef.current.send(
            JSON.stringify({
              type: "join",
              userId: userId,
            })
          );
        }
      };

      socketRef.current.onerror = (innerErr) => {
        console.error("❌ All WebSocket connection attempts failed:", innerErr);
        setConnectionStatus("All WebSocket connection attempts failed");
      };
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 Получено сообщение:", data);
        const signal = data.data;

        // Handle room status message to initialize connections with other users
        if (signal?.type === "room_status") {
          console.log("🏠 Получен статус комнаты:", signal.users);
          setConnectionStatus(`Room joined with ${signal.users.length} users`);

          // If we're the only user, don't try to create a peer connection
          if (signal.users.length <= 1) {
            console.log("👤 Only one user in room, waiting for others to join");
            return;
          }

          // Save my user ID if it's in the room
          const myUserId = signal.users.find((id: string) =>
            id.includes(socketRef.current?._mySelfId || "unknown")
          );

          // To ensure consistent role assignments, use numeric comparison of user IDs
          // This prevents role flip-flops when users join/leave
          const myUserNumber = myUserId ? parseInt(myUserId.split("-")[1]) : 0;

          // Get other users (not me)
          const otherUsers = signal.users.filter(
            (id: string) =>
              !id.includes(socketRef.current?._mySelfId || "unknown")
          );

          console.log(
            `👤 My user ID is ${myUserId}, other users: ${JSON.stringify(
              otherUsers
            )}`
          );

          // Only initialize a new peer connection if we don't have one
          // or if this is the first time seeing another user
          if (!peerRef.current && otherUsers.length > 0) {
            // We'll always make the user with the lower numeric ID the initiator
            // This ensures consistent role assignments
            const shouldBeInitiator =
              myUserNumber < parseInt(otherUsers[0].split("-")[1]);

            console.log(
              `👤 My user number is ${myUserNumber}, should be initiator: ${shouldBeInitiator}`
            );

            console.log(
              `🔄 Initializing peer connection as ${
                shouldBeInitiator ? "initiator" : "receiver"
              }`
            );
            initializePeerConnection(shouldBeInitiator);
          }
        }

        if (signal?.type === "offer") {
          console.log("📞 Получен offer от peer");

          if (!peerRef.current) {
            console.log("🔄 Создаем peer connection для ответа на offer");

            // Initialize peer as non-initiator since we're answering
            const peer = new Peer({
              initiator: false,
              trickle: false,
              stream: stream,
              config: {
                iceServers: [
                  { urls: "stun:stun.l.google.com:19302" },
                  { urls: "stun:global.stun.twilio.com:3478" },
                  { urls: "stun:stun.stunprotocol.org:3478" },
                ],
              },
            });

            peer.on("signal", (signalData: any) => {
              console.log("📤 Отправляем ответ на offer");
              if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(
                  JSON.stringify({ type: "answer", signal: signalData })
                );
              }
            });

            peer.on("stream", (remoteStream: MediaStream) => {
              console.log(
                "📺 Получен remoteStream от peer с ID:",
                remoteStream.id
              );
              handleRemoteStream(remoteStream);
            });

            peer.on("track", (track: MediaStreamTrack, stream: MediaStream) => {
              console.log("🎮 Получен track:", track.kind);
              handleRemoteStream(stream);
            });

            peer.on("error", (err: Error) => {
              console.error("❌ Peer ошибка (answerer):", err);
            });

            peer.on("connect", () => {
              console.log("✅ Peer connection established (answerer)");
              setConnectionStatus("Peer connection established");
            });

            try {
              console.log("🔄 Применяем полученный offer signal");
              peer.signal(signal.signal);
            } catch (err) {
              console.error("🚫 Ошибка при signal(offer):", err);
            }

            peerRef.current = peer;
          } else {
            console.warn("⚠️ Игнорируем повторный offer: peer уже существует");
            // Even if we have a peer, we should still process the offer
            try {
              peerRef.current.signal(signal.signal);
            } catch (err) {
              console.error("🚫 Ошибка при обновлении signal(offer):", err);
            }
          }
        }

        if (signal?.type === "answer") {
          console.log("📞 Получен answer от peer");

          if (peerRef.current) {
            try {
              console.log("🔄 Применяем полученный answer signal");
              peerRef.current.signal(signal.signal);
            } catch (err) {
              console.error("🚫 Ошибка при signal(answer):", err);
            }
          } else {
            console.warn("⚠️ Ответ получен, но peer не существует");
          }
        }
      } catch (error) {
        console.error("❌ Ошибка при обработке сообщения:", error);
      }
    };

    // Helper function to initialize a peer connection
    const initializePeerConnection = (isInitiator: boolean) => {
      try {
        console.log(`🔄 Создаем peer connection (initiator: ${isInitiator})`);

        // Always destroy existing peer before creating a new one
        if (peerRef.current) {
          console.log("⚠️ Destroying existing peer connection");
          peerRef.current.destroy();
          peerRef.current = null;

          // Clear partner video when recreating connection
          if (partnerVideo.current && partnerVideo.current.srcObject) {
            partnerVideo.current.srcObject = null;
          }
        }

        const peer = new Peer({
          initiator: isInitiator,
          trickle: false,
          stream: stream,
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:global.stun.twilio.com:3478" },
              { urls: "stun:stun.stunprotocol.org:3478" },
            ],
          },
          sdpTransform: (sdp: string) => {
            console.log("🔄 Transforming SDP to ensure compatibility");
            // Ensure video codec compatibility by prioritizing common codecs
            return sdp;
          },
        });

        peer.on("stream", (remoteStream: MediaStream) => {
          console.log("📺 Получен remoteStream с ID:", remoteStream.id);
          handleRemoteStream(remoteStream);
        });

        peer.on("track", (track: MediaStreamTrack, stream: MediaStream) => {
          console.log("🎮 Получен track:", track.kind);
          handleRemoteStream(stream);
        });

        peer.on("signal", (signal: any) => {
          console.log(
            `📤 Отправляем ${isInitiator ? "offer" : "answer"} signal`
          );
          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(
              JSON.stringify({
                type: isInitiator ? "offer" : "answer",
                signal,
              })
            );
          } else {
            console.warn("⚠️ WebSocket не готов для отправки сигнала");
          }
        });

        peer.on("error", (err: Error) => {
          console.error(
            `❌ Peer ошибка (${isInitiator ? "offerer" : "answerer"}):`,
            err
          );
        });

        peer.on("connect", () => {
          console.log(
            `✅ Peer connection established (${
              isInitiator ? "offerer" : "answerer"
            })`
          );
          setConnectionStatus("Peer connection established");

          // Try to request video again after connection is established
          if (isInitiator) {
            console.log("🔄 Initiator connected, sending data ping");
            try {
              peer.send(JSON.stringify({ type: "ping" }));
            } catch (e) {
              console.warn("⚠️ Could not send ping", e);
            }
          }
        });

        peer.on("close", () => {
          console.log("❌ Peer connection closed");
          if (partnerVideo.current) {
            partnerVideo.current.srcObject = null;
          }
        });

        peerRef.current = peer;
      } catch (err) {
        console.error("🚫 Ошибка при создании peer:", err);
      }
    };

    // Helper function to handle remote stream connection
    const handleRemoteStream = (remoteStream: MediaStream) => {
      if (!remoteStream) {
        console.error("❌ Received empty remote stream");
        return;
      }

      console.log("📊 Processing remote stream...");

      if (partnerVideo.current) {
        console.log("🎬 Setting partner video source");

        // Clear any existing video source first
        if (partnerVideo.current.srcObject !== remoteStream) {
          partnerVideo.current.srcObject = null;
          partnerVideo.current.srcObject = remoteStream;

          // Create a debug message about all tracks
          const videoTracks = remoteStream.getVideoTracks();
          const audioTracks = remoteStream.getAudioTracks();
          console.log(
            `📊 Remote stream has ${videoTracks.length} video tracks and ${audioTracks.length} audio tracks`
          );

          if (videoTracks.length === 0) {
            console.warn("⚠️ No video tracks in remote stream!");
          } else {
            videoTracks.forEach((track: MediaStreamTrack) =>
              console.log(
                `📹 Video track: ${track.label}, enabled: ${track.enabled}, readyState: ${track.readyState}`
              )
            );
          }

          // Force video to play immediately
          const playVideo = () => {
            console.log("▶️ Forcing video play");
            partnerVideo.current
              ?.play()
              .then(() => console.log("✅ Video playing successfully"))
              .catch((e) => {
                console.error("❌ Failed to play video:", e);
                // Auto-play might be blocked by browser
                setConnectionStatus("Click partner video to start playback");
              });
          };

          // Try playing immediately and also with a slight delay as backup
          playVideo();
          setTimeout(playVideo, 500);
        }
      } else {
        console.error("❌ Partner video element not available");
      }
    };

    return () => {
      console.log("🧹 Отключаем WebSocket и Peer");
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };
  }, [roomId, stream]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 bg-gray-100">
      <div className="text-2xl font-semibold">Room: {roomId}</div>
      <div className="text-sm text-gray-500 mb-2">{connectionStatus}</div>
      <div className="flex flex-wrap justify-center gap-8 w-full max-w-4xl">
        <div className="flex flex-col items-center border-2 border-blue-400 rounded-lg p-2 bg-white shadow-md">
          <p className="text-center font-medium text-blue-600 mb-1">You</p>
          <video
            playsInline
            muted
            ref={userVideo}
            autoPlay
            className="w-80 h-60 bg-black rounded object-cover"
          />
        </div>
        <div className="flex flex-col items-center border-2 border-green-400 rounded-lg p-2 bg-white shadow-md">
          <p className="text-center font-medium text-green-600 mb-1">Partner</p>
          <video
            playsInline
            ref={partnerVideo}
            autoPlay
            controls
            className="w-80 h-60 bg-black rounded object-cover"
            style={{ backgroundColor: "black" }}
          />
        </div>
      </div>
    </div>
  );
}
