import type { CIEPoint, ExternalCIEPoint } from "./cie-types";
import type { DiagramType } from "./cie-constants";

export interface SharedState {
  points: ExternalCIEPoint[];
  diagramType: DiagramType;
}

export const URL_PARAM_KEY = "d";
export const URL_MAX_LENGTH = 2000;

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    input.length + ((4 - (input.length % 4)) % 4),
    "="
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function encodeState(points: CIEPoint[], diagramType: DiagramType): string {
  const external: ExternalCIEPoint[] = points.map(({ name, uPrime, vPrime }) => ({
    name,
    uPrime,
    vPrime,
  }));
  const payload = { d: diagramType, p: external };
  return toBase64Url(JSON.stringify(payload));
}

export function decodeState(encoded: string): SharedState | null {
  try {
    const json = fromBase64Url(encoded);
    const parsed = JSON.parse(json);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray(parsed.p) ||
      (parsed.d !== "1976uv" && parsed.d !== "1931xy")
    ) {
      return null;
    }
    const points: ExternalCIEPoint[] = [];
    for (const item of parsed.p) {
      if (
        !item ||
        typeof item.name !== "string" ||
        typeof item.uPrime !== "number" ||
        typeof item.vPrime !== "number"
      ) {
        return null;
      }
      points.push({ name: item.name, uPrime: item.uPrime, vPrime: item.vPrime });
    }
    return { diagramType: parsed.d, points };
  } catch {
    return null;
  }
}

export function buildShareUrl(points: CIEPoint[], diagramType: DiagramType): string {
  if (typeof window === "undefined") return "";
  const encoded = encodeState(points, diagramType);
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set(URL_PARAM_KEY, encoded);
  return url.toString();
}

export function readSharedStateFromUrl(): SharedState | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get(URL_PARAM_KEY);
  if (!encoded) return null;
  return decodeState(encoded);
}
