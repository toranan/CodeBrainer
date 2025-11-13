import os
import requests
from dotenv import load_dotenv
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain

load_dotenv()

GET_API_URL = os.getenv("GET_API")
POST_API_URL = os.getenv("POST_API_URL")
GPT_API_KEY = os.getenv("GPT_API")

def fetch_problem():
    response = requests.get(GET_API_URL)
    response.raise_for_status()
    return response.json()

def generate_hint(problem_id, tier, time_ms, mem_mb):
    system_message = (
        "너는 문제를 보고 소스코드 작성에 대해 학생이 문제를 차근차근 풀 수 있도록 도와주는 선생님이야. "
        "힌트는 숫자로 주어지는 난이도와 동일한 개수로 1번부터 최대 4번까지 생성이 될 거야. 각 힌트의 내용은 이렇게 해줘:\n"
        "1번 힌트의 형식:\n"
        "2번 힌트의 형식:\n"
        "3번 힌트의 형식:\n"
        "4번 힌트의 형식:\n"
        "주어진 문제를 보고 다음과 같은 특징을 만족하도록 해줘:\n"
        "1. 문장이 간결해야 해.\n"
        "2. 존댓말 써.\n"
        "3. 말이 너무 어려워지지 않도록 조절."
        "4. 이모티콘은 최대한 쓰지 말고, 미사여구도 최대한 붙이지 마."
    )

    user_message = "{problem_id}, {tier}, {time_ms}, {mem_mb}" # api로 불러오기

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_message),
        ("user", user_message)
    ])

    llm = ChatOpenAI(model_name="gpt-4o-mini", openai_api_key=GPT_API_KEY, temperature=0.3)
    chain = LLMChain(llm=llm, prompt=prompt)

    response = chain.invoke({
        "problem_id": problem_id,
        "tier": tier,
        "time_ms": time_ms,
        "mem_mb": mem_mb
    })
    return response["text"]

def upload_hint(problem_id, hint_text):
    data = {
        "problem_id": problem_id,
        "hint": hint_text
    }
    response = requests.post(POST_API_URL, json=data)
    response.raise_for_status()
    return response.json()

def run():
    problem = fetch_problem()

    problem_id = problem["id"]
    tier = problem["tier"]
    time_ms = problem["time_ms"]
    mem_mb = problem["mem_mb"]

    print(f"[+] 문제 ID 받음: {problem_id}")

    hint = generate_hint(problem_id, tier, time_ms, mem_mb)
    print("[+] 힌트 생성 완료")

    result = upload_hint(problem_id, hint)
    print(f"[OK] 힌트 저장 완료 → {result}")


if __name__ == "__main__":
    run()