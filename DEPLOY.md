# 배포 가이드 (무료 구성)

Oracle VM 전체이관 대신, **새 집이 필요한 FE/BE만** 무료 PaaS에 올리고 DB·파일은 Supabase 무료를 그대로 둔다.

```
[사용자] → Vercel(frontoffice, backoffice)  ──API──▶  Koyeb(Spring Boot)  ──▶  Supabase Postgres
                                                                          └──▶  Supabase Storage(이미지)
```

| 구성 | 호스트 | 비용 | 비고 |
|---|---|---|---|
| Postgres DB | **Supabase** | 무료 | 그대로 유지(이관 X) |
| 이미지 파일 | **Supabase Storage** | 무료 | 그대로 유지(106개 업로드 완료) |
| 백엔드 Spring Boot | **Koyeb** | 무료 | 512MB/0.1vCPU, Docker, scale-to-zero |
| frontoffice (소비자) | **Vercel** | 무료 | Next.js, 항상 켜짐 |
| backoffice (관리자) | **Vercel** | 무료 | 별도 프로젝트 |

전제: 이 레포가 GitHub(`uxin0119/portfolio-backoffice`)에 푸시되어 있어야 함. 시크릿은 레포에 없고 각 대시보드 환경변수로 주입.

---

## 1) 백엔드 → Koyeb

1. https://app.koyeb.com 가입(카드 불필요) → GitHub 연동.
2. **Create Web Service → GitHub →** 이 레포 선택.
3. 빌드 설정:
   - **Builder: Dockerfile**
   - **Work directory / Dockerfile location: `backend`** (Dockerfile이 `backend/Dockerfile`)
   - Build context = `backend`
4. **Instance: Free**, Region: Frankfurt(또는 Washington). Min/Max scale 0~1(또는 1로 두면 콜드스타트 없음, 무료 한도 내).
5. **Port: 8080** (앱이 `server.port=${PORT:8080}`로 PORT를 읽음. Koyeb이 PORT 주입).
6. **Health check**: HTTP path `/actuator/health`.
7. **Environment variables**(아래 표) 입력 후 Deploy.
8. 배포되면 공개 URL 확보: `https://<app>-<org>.koyeb.app` → **이게 FE의 `NEXT_PUBLIC_API_BASE`**.

### Koyeb 환경변수
| 키 | 값(로컬 `application-local.properties`에서 복사) |
|---|---|
| `DB_URL` | `jdbc:postgresql://aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres` |
| `DB_USERNAME` | `postgres.<project-ref>` (Supabase 세션 풀러 사용자) |
| `DB_PASSWORD` | (Supabase DB 비밀번호) |
| `TOSS_SECRET_KEY` | `test_sk_...` (Toss 테스트 시크릿) |
| `STORAGE_TYPE` | `supabase` |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `SUPABASE_SERVICE_KEY` | (Supabase service_role JWT) |
| `SUPABASE_BUCKET` | `product-images` |
| `CORS_ALLOWED_ORIGINS` | (2단계에서 받은 Vercel 도메인들, 쉼표구분) — **처음엔 임시로 비워두거나 `*` 금지, 아래 4단계서 채움** |

> 값들은 `backend/src/main/resources/application-local.properties`(gitignore됨)에 이미 있음. 거기서 복사. **레포에 커밋 금지.**

---

## 2) 프론트엔드 → Vercel (프로젝트 2개)

각 앱마다 Vercel 프로젝트를 따로 만든다.

### frontoffice (소비자)
1. https://vercel.com 가입(카드 불필요) → GitHub 연동 → 이 레포 Import.
2. **Root Directory: `frontoffice`**.
3. Framework: Next.js(자동 감지).
4. 환경변수:
   - `NEXT_PUBLIC_API_BASE` = (1단계 Koyeb URL)
   - `NEXT_PUBLIC_TOSS_CLIENT_KEY` = `test_ck_...` (로컬 `frontoffice/.env.local`에서 복사)
5. Deploy → 도메인 확보(예: `https://portfolio-frontoffice.vercel.app`).

### backoffice (관리자)
1. **New Project**, 같은 레포, **Root Directory: `backoffice`**.
2. 환경변수: `NEXT_PUBLIC_API_BASE` = (Koyeb URL).
3. Deploy → 도메인 확보(예: `https://portfolio-backoffice.vercel.app`).

---

## 3) CORS 연결 (닭-달걀 해결 순서)

1. 먼저 Koyeb(BE) 배포 → URL 확보.
2. Vercel(FE) 2개 배포 → 두 도메인 확보.
3. **Koyeb `CORS_ALLOWED_ORIGINS` 를 두 Vercel 도메인으로 갱신** 후 재배포:
   ```
   https://portfolio-frontoffice.vercel.app,https://portfolio-backoffice.vercel.app
   ```

---

## 4) 콜드스타트 완화 (선택)

Koyeb 무료가 무트래픽 시 0으로 스케일 → 첫 요청이 느림. 시연 전 깨워두기:
- https://cron-job.org 무료로 `https://<koyeb-url>/actuator/health` 를 5~10분마다 핑.
- 또는 Koyeb min scale=1(무료 한도 내면).

---

## 5) 점검 체크리스트
- [ ] `GET https://<koyeb>/actuator/health` → `{"status":"UP"}`
- [ ] `GET https://<koyeb>/api/products` → 상품 JSON(이미지 URL은 Supabase Storage)
- [ ] frontoffice에서 상품 목록·이미지 로드, 체크아웃 결제창 동작
- [ ] backoffice CRUD 동작
- [ ] 브라우저 콘솔 CORS 에러 없음
