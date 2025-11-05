import os
import requests
from dotenv import load_dotenv
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain

load_dotenv()

GET_API_URL = os.getenv("GET_API_URL")
POST_API_URL = os.getenv("POST_API_URL")
GPT_API_KEY = os.getenv("GPT_API")

def fetch_questions():
    response = requests.get(GET_API_URL)
    response.raise_for_status()
    return response.json()  # [{"id": 1, "keywords": "..."}]

def generate_text(keywords):
    system_message = (
        "너는 이제부터 교수님에게 이론적이고 학문적인 내용이나 공적인 일로 질문을 하고 싶은 학생이야. "
        "앞으로 내가 하는 모든 말에 대해 다음과 같은 특징을 만족하도록 말을 바꿔줘:\n"
        "1. 문장이 간결하고 단도직입적이어야 해.\n"
        "2. 어투는 최대한 정중하게 해야 해.\n"
        "3. 마무리는 감사 인사와 본인 이름 (OOO 올림) 등으로 마무리.\n"
        "4. 중요한 내용은 빠뜨리지 않도록.\n"
        "5. 높은 수준의 어휘 사용.\n"
        "6. 허례허식도 괜찮.\n"
        "7. 같은 내용이라도 조금 길면 좋음.\n"
        "8. 시작에는 'OOO의 OOO입니다.' 포함.\n"
        "9. 일정 조율 상황에서는 능동적 태도.\n"
        "10. 말이 너무 어려워지지 않도록 조절."
    )

    user_message = "{keywords}이 주제로 메일을 작성하도록 해. 제목은 쓰지 않고 본문만 작성."

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_message),
        ("user", user_message)
    ])

    llm = ChatOpenAI(model_name="gpt-4o-mini", openai_api_key=GPT_API_KEY)
    chain = LLMChain(llm=llm, prompt=prompt)

    response = chain.invoke({"keywords": keywords})
    return response["text"] if isinstance(response, dict) else response

def upload_generated(question_id, generated_text):
    data = {
        "question_id": question_id,
        "generated_text": generated_text
    }
    response = requests.post(POST_API_URL, json=data)
    response.raise_for_status()
    return response.json()

def run():
    questions = fetch_questions()

    for q in questions:
        q_id = q["id"]
        keywords = q["keywords"]

        print(f"[+] Generating for question #{q_id}: {keywords}")
        generated = generate_text(keywords)

        print(f"[+] Uploading result...")
        result = upload_generated(q_id, generated)

        print(f"[OK] 저장 완료 → {result}")

if __name__ == "__main__":
    run()
