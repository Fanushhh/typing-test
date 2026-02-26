

import type { StorageRecord } from "./types.js";

export default function transformData(data: string) {
  return data
    .split("")
    .map((char) => `<span class="input-char">${char}</span>`)
    .join("");
}

export function getStorageData() {
  const raw = window.localStorage.getItem("history");

  let storage: StorageRecord[] = [];

  try {
    const parsed = raw ? JSON.parse(raw) : [];
    // Validate parsed data is an array
    if (Array.isArray(parsed)) {
      // Filter items to ensure they have a numeric WPM property
      storage = parsed.filter((item) => item && typeof item.WPM === "number");
    }
  } catch {
    // If JSON.parse fails, fallback to empty array
    storage = [];
  }
  return storage;
}