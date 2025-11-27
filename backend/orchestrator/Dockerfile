FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -f pom.xml dependency:go-offline
RUN mvn -f pom.xml package -DskipTests

FROM python:3.11-slim AS runtime

RUN apt-get update && apt-get install -y openjdk-21-jre && apt-get clean

WORKDIR /app

RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

RUN /app/venv/bin/pip install --upgrade pip
RUN /app/venv/bin/pip install --no-cache-dir \
    beautifulsoup4 \
    lxml \
    "langchain==0.1.20" \
    "langchain-openai==0.0.5" \
    tiktoken \
    python-dotenv \
    requests

COPY --from=build /app/target/orchestrator-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]