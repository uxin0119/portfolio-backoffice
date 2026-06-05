# 백엔드 배포용 (Koyeb/Render 등). 멀티스테이지: Gradle 빌드 → JRE 실행.
FROM eclipse-temurin:23-jdk AS build
WORKDIR /app
COPY . .
RUN chmod +x gradlew && ./gradlew bootJar -x test --no-daemon

FROM eclipse-temurin:23-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
# PaaS가 PORT 환경변수로 리슨 포트 주입(application.properties의 server.port=${PORT:8080}).
EXPOSE 8080
# 런타임 환경변수: PORT / DB_URL / DB_USERNAME / DB_PASSWORD / TOSS_SECRET_KEY
#   STORAGE_TYPE / SUPABASE_URL / SUPABASE_SERVICE_KEY / SUPABASE_BUCKET / CORS_ALLOWED_ORIGINS
# 무료 티어(512MB) 대비 JVM 메모리 튜닝: 컨테이너 메모리의 70%만 힙, 저메모리 친화 SerialGC.
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70.0", "-XX:+UseSerialGC", "-jar", "app.jar"]
