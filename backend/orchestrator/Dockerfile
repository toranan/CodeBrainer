FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

# 디버그 출력
RUN echo "=== DEBUG: ProblemQueryService.java ===" && \
    sed -n '1,200p' src/main/java/com/codebrainer/orchestrator/service/ProblemQueryService.java

RUN mvn -f pom.xml dependency:go-offline
RUN mvn -f pom.xml package -DskipTests

FROM eclipse-temurin:21-jre

RUN apt update && \
    apt install -y python3 python3-pip && \
    apt clean

WORKDIR /app

COPY --from=build /app/target/orchestrator-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

