# 백엔드 배포용 (Railway 등). 멀티스테이지: Gradle 빌드 → JRE 실행.
FROM eclipse-temurin:23-jdk AS build
WORKDIR /app
COPY . .
RUN chmod +x gradlew && ./gradlew bootJar -x test --no-daemon

FROM eclipse-temurin:23-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
# 런타임 환경변수: DB_URL / DB_USERNAME / DB_PASSWORD / TOSS_SECRET_KEY
ENTRYPOINT ["java", "-jar", "app.jar"]
