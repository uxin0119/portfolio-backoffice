# 배포 가이드 (무료 구성)

Oracle VM 전체이관 대신, **새 집이 필요한 FE/BE만** 무료 PaaS에 올리고 DB·파일은 Supabase 무료를 그대로 둔다.

## 🟢 라이브 URL
| 구성 | URL |
|---|---|
| 소비자(frontoffice) | https://portfolio-frontoffice.vercel.app |
| 관리자(backoffice) | https://portfolio-backoffice-pi.vercel.app |
| 백엔드 API | https://portfolio-backoffice-50wb.onrender.com |
| 헬스체크 | https://portfolio-backoffice-50wb.onrender.com/actuator/health |

```
[사용자] → Vercel(frontoffice, backoffice)  ──API──▶  Render(Spring Boot)  ──▶  Supabase Postgres
                                                                          └──▶  Supabase Storage(이미지)
```

| 구성 | 호스트 | 비용 | 비고 |
|---|---|---|---|
| Postgres DB | **Supabase** | 무료 | 그대로 유지(이관 X) |
| 이미지 파일 | **Supabase Storage** | 무료 | 그대로 유지(106개 업로드 완료) |
| 백엔드 Spring Boot | **Render** | 무료 | 512MB/0.1vCPU, Docker, 15분 무트래픽 시 sleep |
| frontoffice (소비자) | **Vercel** | 무료 | Next.js, 항상 켜짐 |
| backoffice (관리자) | **Vercel** | 무료 | 별도 프로젝트 |

> Koyeb은 2026년 기준 무료 티어 폐지($30/월)라 Render로 결정.

전제: 이 레포가 GitHub(`uxin0119/portfolio-backoffice`)에 푸시되어 있어야 함. 시크릿은 레포에 없고 각 대시보드 환경변수로 주입.

---

## 1) 백엔드 → Render (Web Service, Docker)

1. https://dashboard.render.com 가입(카드 불필요) → GitHub 연동.
2. **New → Web Service →** 이 레포 선택.
3. 설정:
   - **Language: Docker** (자동 감지, `backend/Dockerfile`)
   - **Root Directory: `backend`** (모노레포)
   - **Instance Type: Free** (512MB)
   - 포트: 앱이 `server.port=${PORT:8080}`로 Render의 PORT(10000) 자동 수신
4. **Environment Variables**(아래 표) 입력 후 Deploy.
5. 공개 URL = FE의 `NEXT_PUBLIC_API_BASE`.

### Render 환경변수 (총 9개)
| 키 | 값 출처 (`backend/.../application-local.properties`) |
|---|---|
| `DB_URL` | `jdbc:postgresql://aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require` |
| `DB_USERNAME` | `postgres.<project-ref>` |
| `DB_PASSWORD` | (Supabase DB 비밀번호) — 시크릿 |
| `TOSS_SECRET_KEY` | `test_sk_...` — 시크릿 |
| `STORAGE_TYPE` | `supabase` |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `SUPABASE_SERVICE_KEY` | (Supabase service_role JWT) — 시크릿 |
| `SUPABASE_BUCKET` | `product-images` |
| `CORS_ALLOWED_ORIGINS` | `https://portfolio-frontoffice.vercel.app,https://portfolio-backoffice-pi.vercel.app` |

> 시크릿 3개(DB_PASSWORD/SUPABASE_SERVICE_KEY/TOSS_SECRET_KEY)는 gitignore된 로컬 파일에서 복사. **레포에 커밋 금지.**

---

## 2) 프론트엔드 → Vercel (프로젝트 2개)

각 앱마다 Vercel 프로젝트를 따로 만든다(Import → Root Directory 지정).

### frontoffice (소비자) — `portfolio-frontoffice`
- **Root Directory: `frontoffice`**, Framework: Next.js(자동)
- 환경변수:
  - `NEXT_PUBLIC_API_BASE` = `https://portfolio-backoffice-50wb.onrender.com`
  - `NEXT_PUBLIC_TOSS_CLIENT_KEY` = `test_ck_...` (공개 클라이언트키)

### backoffice (관리자) — `portfolio-backoffice`
- **Root Directory: `backoffice`**, Framework: Next.js(자동)
- 환경변수: `NEXT_PUBLIC_API_BASE` = `https://portfolio-backoffice-50wb.onrender.com`

---

## 3) CORS 연결 (순서)
1. Render(BE) 배포 → URL 확보.
2. Vercel(FE) 2개 배포 → 두 도메인 확보.
3. Render `CORS_ALLOWED_ORIGINS` 에 두 도메인(쉼표구분) 등록 → Save, rebuild, and deploy.

---

## 4) 콜드스타트 완화 (선택)
Render 무료는 15분 무트래픽 시 sleep → 첫 요청 30~60초. 시연 전 깨워두기:
- https://cron-job.org 무료로 `https://portfolio-backoffice-50wb.onrender.com/actuator/health` 를 10분마다 핑.

---

## 5) 점검 체크리스트
- [x] `GET /actuator/health` → `{"status":"UP"}`
- [x] `GET /api/products` → 상품 JSON(이미지 URL은 Supabase Storage)
- [ ] frontoffice 상품 목록·이미지 로드, 체크아웃 결제창
- [ ] backoffice CRUD
- [ ] 브라우저 콘솔 CORS 에러 없음
