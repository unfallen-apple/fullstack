FROM amazoncorretto:21-al2023-jdk

WORKDIR /app

RUN yum install -y findutils

COPY . .

RUN chmod +x gradlew
RUN ./gradlew bootJar

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -Xmx512m -jar build/libs/app.jar"]
