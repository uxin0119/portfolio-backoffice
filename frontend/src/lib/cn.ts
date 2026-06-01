/** 의존성 없는 className 병합 (falsy 제거 + 공백 정리) */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}
