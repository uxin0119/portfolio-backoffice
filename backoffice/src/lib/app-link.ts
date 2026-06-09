import { useEffect, useState } from "react";

/**
 * 상대 앱(백오피스↔프론트오피스) 링크를 환경별로 해석.
 * 우선순위: ① 환경변수(env) → ② 로컬(localhost)이면 같은 호스트의 localPort → ③ 배포 URL.
 * SSR/최초 렌더는 env??deployed로 시작하고, 마운트 후 localhost면 로컬 주소로 교체(href만 갱신).
 */
export function useCounterpartUrl(env: string | undefined, deployed: string, localPort: string): string {
  const [url, setUrl] = useState(env ?? deployed);
  useEffect(() => {
    if (env) return;
    const h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1") {
      setUrl(`${window.location.protocol}//${h}:${localPort}`);
    }
  }, [env, deployed, localPort]);
  return url;
}
