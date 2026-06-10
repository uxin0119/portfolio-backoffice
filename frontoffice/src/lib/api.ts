// API 클라이언트. 백엔드 기본 http://localhost:8080 (필요 시 NEXT_PUBLIC_API_BASE로 override)
// 무료 서버(Render) 콜드스타트 대응: GET은 타임아웃+자동 재시도하고, 그동안 "깨우는 중" 배너 이벤트를 쏜다.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

const ATTEMPT_TIMEOUT = 20_000; // 시도당 타임아웃
const MAX_ATTEMPTS = 5;         // GET 재시도 횟수(총 ~90초: 콜드부팅 커버)
const RETRY_DELAY = 4_000;

let warming = false;
function setWarming(v: boolean) {
  if (warming === v || typeof window === "undefined") return;
  warming = v;
  window.dispatchEvent(new CustomEvent("api-warming", { detail: v }));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  // 변경 요청(POST 등)은 중복 실행 방지를 위해 재시도하지 않음
  const attempts = method === "GET" ? MAX_ATTEMPTS : 1;

  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ATTEMPT_TIMEOUT);
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
        cache: "no-store",
        signal: ctrl.signal,
        ...init,
      });
      clearTimeout(timer);
      // 게이트웨이 오류(502/503/504)는 콜드스타트 가능성 → 재시도 대상
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        throw new Error(`${res.status} (server waking)`);
      }
      setWarming(false);
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw Object.assign(
          new Error(`${res.status} ${res.statusText}${body ? ` — ${body}` : ""}`),
          { noRetry: true },
        );
      }
      const text = await res.text();
      return (text ? JSON.parse(text) : undefined) as T;
    } catch (e) {
      clearTimeout(timer);
      lastErr = e;
      const noRetry = typeof e === "object" && e !== null && "noRetry" in e;
      if (noRetry || i === attempts - 1) {
        setWarming(false);
        throw e;
      }
      setWarming(true); // 네트워크 실패/타임아웃 → 서버 기동 대기 후 재시도
      await sleep(RETRY_DELAY);
    }
  }
  throw lastErr;
}

export const won = (n: number) => "₩" + (n ?? 0).toLocaleString("ko-KR");
