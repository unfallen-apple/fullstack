# 기존 FROM openjdk:21-jdk-slim 대신 아래 줄을 넣으세요.
FROM amazoncorretto:21-al2023-jdk

# 나머지는 그대로 두시면 됩니다.
WORKDIR /app
COPY . .
RUN chmod +x gradlew
RUN ./gradlew bootJar

EXPOSE 8080
ENTRYPOINT ["java", "-Xmx512m", "-Dserver.port=8080", "-jar", "build/libs/*.jar"]