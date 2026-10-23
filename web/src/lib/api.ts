import type { Session } from "./types";

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

// No app desktop (Electron) o preload expõe o endereço do servidor achado na rede
declare global {
  interface Window {
    controlmesa?: {
      apiUrl(): string;
      rediscover(): Promise<string | null>;
      printHtml?(html: string): Promise<boolean>;
    };
  }
}

export function apiUrl() {
  return (typeof window !== "undefined" && window.controlmesa?.apiUrl()) || DEFAULT_API_URL;
}

const STORAGE_KEY = "controlmesa:session";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session | null) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // armazenamento indisponível: a sessão vale só até recarregar
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
}

export async function api<T>(path: string, { method = "GET", body, query }: RequestOptions = {}): Promise<T> {
  const token = loadSession()?.token;
  const send = () => {
    const url = new URL(path, apiUrl());
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }
    return fetch(url, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res: Response;
  try {
    res = await send();
  } catch {
    // Servidor mudou de endereço? No app desktop procura de novo e repete uma vez
    const found = await window.controlmesa?.rediscover();
    if (!found) throw new ApiError("Não foi possível conectar ao servidor", 0);
    try {
      res = await send();
    } catch {
      throw new ApiError("Não foi possível conectar ao servidor", 0);
    }
  }

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (data as { error?: string } | null)?.error ?? "Erro inesperado";
    if (res.status === 401 && token) {
      saveSession(null);
      // recarga completa descarta qualquer estado da sessão anterior
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
    }
    throw new ApiError(message, res.status);
  }
  return data as T;
}

export function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Erro inesperado";
}
