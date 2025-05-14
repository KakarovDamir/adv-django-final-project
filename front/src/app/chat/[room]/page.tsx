/* eslint-disable */
"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ChatRoom() {
  const { room } = useParams();
  const socketRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<
    { username: string; message: string; isLocal?: boolean }[]
  >([]);
  const [input, setInput] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Connecting...");
  const [errorMessage, setErrorMessage] = useState<string>("");
  // Generate a random username with 4-digit ID
  const username =
    "User" +
    Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");

  // Debug function to log with timestamp
  const logWithTime = (msg: string, data?: any) => {
    const time = new Date().toLocaleTimeString();
    if (data) {
      console.log(`[${time}] ${msg}`, data);
    } else {
      console.log(`[${time}] ${msg}`);
    }
  };

  useEffect(() => {
    if (!room) return;

    // Determine WebSocket connection options
    const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";

    // Use the current host by default (should work in most cases)
    let wsUrl = `${protocol}${window.location.host}/ws/chat/${room}/`;

    logWithTime(`🔄 Connecting to WebSocket at: ${wsUrl}`);
    setConnectionStatus("Connecting to WebSocket server...");

    // Create and set up WebSocket connection
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      logWithTime("✅ WebSocket connected successfully");
      setConnectionStatus("Connected to chat server");

      // Send a join message
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            username: username,
            message: "has joined the chat",
            type: "join",
          })
        );
      }
    };

    socketRef.current.onerror = () => {
      logWithTime("❌ WebSocket connection failed");
      setConnectionStatus("Connection failed");
      setErrorMessage("Could not connect to chat server");

      // Try fallback connection if needed
      if (process.env.NEXT_PUBLIC_WS_URL) {
        const fallbackUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/chat/${room}/`;
        logWithTime(`🔄 Trying fallback WebSocket at: ${fallbackUrl}`);

        try {
          if (socketRef.current) {
            socketRef.current.close();
          }

          socketRef.current = new WebSocket(fallbackUrl);

          socketRef.current.onopen = () => {
            logWithTime("✅ Fallback WebSocket connected");
            setConnectionStatus("Connected to chat server");
            setErrorMessage("");

            // Send a join message on the fallback connection
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(
                JSON.stringify({
                  username: username,
                  message: "has joined the chat",
                  type: "join",
                })
              );
            }
          };

          socketRef.current.onerror = () => {
            logWithTime("❌ All WebSocket connection attempts failed");
            setConnectionStatus("All connection attempts failed");
            setErrorMessage("Could not connect to any chat server");
          };

          // Set up the message handler for the fallback connection
          socketRef.current.onmessage = handleWebSocketMessage;
        } catch (err) {
          logWithTime("❌ Error creating fallback WebSocket:", err);
          setErrorMessage("Failed to create fallback connection");
        }
      }
    };

    // Message handler function
    const handleWebSocketMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        logWithTime("📩 Message received:", data);

        // Handle different message types
        if (data.type === "chat") {
          const newMessage = {
            username: data.username,
            message: data.message,
            isLocal: data.username === username,
          };

          setMessages((prev) => [...prev, newMessage]);
        } else if (data.type === "join" || data.type === "leave") {
          // Handle system messages (joins/leaves)
          const systemMessage = {
            username: "System",
            message: `${data.username} ${data.message}`,
          };

          setMessages((prev) => [...prev, systemMessage]);
        }
      } catch (error) {
        logWithTime("❌ Error processing message:", error);
      }
    };

    socketRef.current.onmessage = handleWebSocketMessage;

    // Handle connection close
    socketRef.current.onclose = (event) => {
      logWithTime(`WebSocket closed: ${event.code} ${event.reason}`);
      setConnectionStatus("Disconnected from chat server");

      if (event.code !== 1000) {
        // Normal closure
        setErrorMessage(`Connection closed unexpectedly (${event.code})`);
      }
    };

    // Cleanup function
    return () => {
      logWithTime("🧹 Cleaning up WebSocket connection");

      if (socketRef.current) {
        // Send a leave message if possible
        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(
            JSON.stringify({
              username: username,
              message: "has left the chat",
              type: "leave",
            })
          );
        }

        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [room, username]);

  const sendMessage = () => {
    const trimmedInput = input.trim();

    if (!trimmedInput) return;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const messageObj = {
        username: username,
        message: trimmedInput,
        type: "chat",
      };

      logWithTime("📤 Sending message:", messageObj);
      socketRef.current.send(JSON.stringify(messageObj));

      // Add the message to local state immediately for better UX
      setMessages((prev) => [
        ...prev,
        { username: username, message: trimmedInput, isLocal: true },
      ]);

      setInput("");
    } else {
      logWithTime("⚠️ Cannot send message - not connected");
      setConnectionStatus("Not connected to chat server");
      setErrorMessage("Cannot send message - connection lost");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Chat Room: {room}</h2>
      <div className="flex items-center gap-2 mb-2">
        <div className="text-sm text-gray-500">{connectionStatus}</div>
        <div className="text-xs text-blue-500">Your name: {username}</div>
      </div>
      {errorMessage && (
        <div className="text-sm text-red-500 mb-2">{errorMessage}</div>
      )}
      <div className="border rounded p-2 h-64 overflow-y-auto bg-white text-black">
        {messages.length === 0 ? (
          <div className="text-gray-400 text-center my-8">No messages yet</div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-1 ${msg.isLocal ? "text-right" : ""} ${
                msg.username === "System"
                  ? "text-gray-500 italic text-center"
                  : ""
              }`}
            >
              {msg.username !== "System" && <strong>{msg.username}: </strong>}
              {msg.message}
            </div>
          ))
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          className="border p-2 flex-1 rounded text-black"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          disabled={
            !socketRef.current ||
            socketRef.current.readyState !== WebSocket.OPEN
          }
        />
        <button
          className={`px-4 py-2 rounded ${
            socketRef.current && socketRef.current.readyState === WebSocket.OPEN
              ? "bg-blue-500 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          onClick={sendMessage}
          disabled={
            !socketRef.current ||
            socketRef.current.readyState !== WebSocket.OPEN
          }
        >
          Send
        </button>
      </div>
    </div>
  );
}
