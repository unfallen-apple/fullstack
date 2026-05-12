# 1. 자바 21 버전 사용 (본인 프로젝트 자바 버전이 다르면 숫자만 바꾸세요)
FROM openjdk:21-jdk-slim

# 2. 컨테이너 내부 작업 폴더 설정
WORKDIR /app

# 3. 모든 파일 복사
COPY . .

# 4. gradlew 실행 권한 부여 및 빌드
RUN chmod +x gradlew
RUN ./gradlew bootJar

# 5. 앱 실행 (포트는 8080 고정)
EXPOSE 8080
ENTRYPOINT ["java", "-Xmx512m", "-Dserver.port=8080", "-jar", "build/libs/*.jar"]