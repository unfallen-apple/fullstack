FROM amazoncorretto:21-al2023-jdk

WORKDIR /app

# Explicitly set JAVA_HOME for the build process
ENV JAVA_HOME /usr/lib/jvm/java-21-amazon-corretto
ENV PATH $JAVA_HOME/bin:$PATH

# [추가] Gradle 빌드에 필요한 xargs(findutils)를 설치합니다.
RUN yum install -y findutils

COPY . .

RUN chmod +x gradlew
RUN ./gradlew bootJar

EXPOSE 8080
# 포트는 Render 기본값인 10000으로 잡힐 수 있으니 8080으로 강제 고정합니다.
ENTRYPOINT ["sh", "-c", "java -Xmx512m -Dserver.port=8080 -jar build/libs/*.jar"]