"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { apiUrl, loadSession } from "./api";

type Handlers = Record<string, (payload: never) => void>;

// Uma única conexão por aba, compartilhada entre todos os componentes que a usam
let shared: { socket: Socket; token: string; users: number } | null = null;

function acquire(token: string) {
  if (shared && shared.token !== token) {
    shared.socket.disconnect();
    shared = null;
  }
  shared ??= { socket: io(apiUrl(), { auth: { token } }), token, users: 0 };
  shared.users++;
  return shared;
}

function release(entry: NonNullable<typeof shared>) {
  if (--entry.users > 0) return;
  entry.socket.disconnect();
  if (shared === entry) shared = null;
}

// Mantém uma conexão socket.io autenticada enquanto o componente estiver montado
export function useSocket(handlers: Handlers, onReconnect?: () => void) {
  const handlersRef = useRef(handlers);
  const reconnectRef = useRef(onReconnect);

  useEffect(() => {
    handlersRef.current = handlers;
    reconnectRef.current = onReconnect;
  });

  useEffect(() => {
    const token = loadSession()?.token;
    if (!token) return;

    const entry = acquire(token);
    const { socket } = entry;
    const listeners = Object.keys(handlersRef.current).map((event) => {
      const listener = (payload: unknown) => handlersRef.current[event]?.(payload as never);
      socket.on(event, listener);
      return [event, listener] as const;
    });
    // Reconexão perde eventos emitidos no intervalo: recarrega o estado
    const onReconnectEvent = () => reconnectRef.current?.();
    socket.io.on("reconnect", onReconnectEvent);

    return () => {
      for (const [event, listener] of listeners) socket.off(event, listener);
      socket.io.off("reconnect", onReconnectEvent);
      release(entry);
    };
  }, []);
}
