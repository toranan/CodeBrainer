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
    return response.json()

def generate_text():
    system_message = "한글로 대답해"
    user_message = ""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_message),
        ("user", "{user_input}")
    ])

    llm = ChatOpenAI(model_name="gpt-5-nano", openai_api_key=GPT_API_KEY)
    chain = LLMChain(llm=llm, prompt=prompt)

    # invoke에는 dict를 넣어야 합니다
    response = chain.invoke({"user_input": user_message})
    return response["text"]

def upload_generated(question_id, generated_text):
    data = {
        "question_id": question_id,
        "generated_text": generated_text
    }
    response = requests.post(POST_API_URL, json=data)
    response.raise_for_status()
    return response.json()

def run():
    generated = generate_text()
    print(generated)

if __name__ == "__main__":
    run()
