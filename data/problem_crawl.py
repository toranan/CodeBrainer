import requests
import os
import json
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import time
import random

load_dotenv()
API_HOST = os.getenv("API_HOST")

STATEMENT_DIR = os.getenv("STATEMENT_PATH", "./statements")
os.makedirs(STATEMENT_DIR, exist_ok=True)

BASE_BOJ = "https://www.acmicpc.net/problem"
BASE_SOLVED = "https://solved.ac/problems/level/{level}?sort=solved&direction=desc&page=1"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}



def save_statement(problem_id, text):
    path = f"{STATEMENT_DIR}/{problem_id}.json"
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"statement": text}, f, ensure_ascii=False)
    except Exception as e:
        print(f"[파일 저장 오류] {problem_id}: {e}")
    return path


def convert_level_to_tier(level_num: int) -> str:
    if 1 <= level_num <= 3:
        return "BRONZE"
    elif 4 <= level_num <= 8:
        return "SILVER"
    elif 9 <= level_num <= 13:
        return "GOLD"
    else:
        return "PLATINUM"


def parse_boj_problem(problem_id, tier):
    url = f"{BASE_BOJ}/{problem_id}"

    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
    except Exception as e:
        print(f"[BOJ 연결 오류] id={problem_id}, {e}")
        return None

    if res.status_code != 200:
        print(f"[BOJ 요청 실패] id={problem_id}, status={res.status_code}")
        return None

    html = res.content.decode("utf-8", errors="ignore")
    soup = BeautifulSoup(html, "html.parser")
    print(html)

    try:
        title = soup.select_one("#problem_title").get_text(strip=True)
    except:
        print(f"[파싱 오류] 제목 없음 id={problem_id}")
        return None

    time_ms = None
    try:
        time = soup.select_one("#problem-info > tbody > tr > td:nth-child(1)").get_text(strip=True)
        if "초" in time:
            time_ms = int(float(time.replace("초", "").strip()) * 1000)
        elif "ms" in time:
            time_ms = int(float(time.replace("ms", "").strip()))
    except:
        time_ms = None

    mem_mb = None
    try:
        mem = soup.select_one("#problem-info > tbody > tr > td:nth-child(2)").get_text(strip=True)
        if "MB" in mem:
            mem_mb = int(mem.replace("MB", "").strip())
        elif "KB" in mem:
            kb = int(mem.replace("KB", "").strip())
            mem_mb = max(1, kb // 1024)
    except:
        mem_mb = None

    description = ""
    try:
        description += soup.select_one(".problem_description").get_text("\n", strip=True)
    except:
        description = ""

    description += "\n\n입력:\n"
    try:
        description += soup.select_one(".input").get_text("\n", strip=True)
    except:
        description += ""

    description += "\n\n출력:\n"
    try:
        description += soup.select_one(".output").get_text("\n", strip=True)
    except:
        description += ""

    try:
        input_format = soup.select_one("#sample-input-1").get_text("\n", strip=True)
    except:
        input_format = ""

    try:
        output_format = soup.select_one("#sample-output-1").get_text("\n", strip=True)
    except:
        output_format = ""

    categories = []
    try:
        tags_raw = soup.select_one("#problem_tags > ul")
        if tags_raw:
            categories = [t.strip() for t in tags_raw.get_text().split("\n") if t.strip()]
    except:
        categories = []

    return {
        "id": int(problem_id),
        "title": title,
        "tier": tier,
        "timeMs": time_ms,
        "memMb": mem_mb,
        "categories": categories,
        "inputFormat": input_format,
        "outputFormat": output_format,
        "statement": description
    }


def main():
    all_problems = []

    for level in range(1, 20):
        tier = convert_level_to_tier(level)
        print(f"\n=== 레벨 {level} ({tier}) 문제 수집 중 ===")

        url = BASE_SOLVED.format(level=level)
        try:
            res = requests.get(url, headers=HEADERS, timeout=10)
        except Exception as e:
            print(f"[solved.ac 연결 오류] level={level}, {e}")
            continue

        if res.status_code != 200:
            print(f"[solved.ac 요청 실패] level={level}, status={res.status_code}")
            continue

        soup = BeautifulSoup(res.text, "html.parser")

        problem_ids = []
        for a in soup.find_all("a"):
            href = a.get("href", "")
            if "acmicpc.net/problem/" in href:
                pid = href.split("/")[-1]
                if pid.isdigit():
                    problem_ids.append(pid)
                    if len(problem_ids) >= 20:
                        break

        print(f"문제 {len(problem_ids)}개 수집:", problem_ids)
        problem_ids = list(dict.fromkeys(problem_ids))

        for pid in problem_ids:
            print(f"파싱 중… {pid}")
            data = parse_boj_problem(pid, tier)
            time.sleep(random.uniform(0.3, 1.0))

            if data:
                all_problems.append(data)
                print(f"  → 완료")
            else:
                print(f"  → 실패")

    if all_problems:
        for data in all_problems:
            try:
                response = requests.post(f"{API_HOST}/internal/problems", json=data, timeout=10)

                if response.status_code in (200, 201):
                    print(f"[DB 저장 완료] id={data['id']}")
                else:
                    print(f"[API 오류] id={data['id']} status={response.status_code}, body={response.text}")

            except requests.exceptions.ConnectionError:
                print(f"[연결 실패] Spring 서버 확인 필요: {API_HOST}")
                return
            except requests.exceptions.Timeout:
                print(f"[타임아웃] id={data['id']}")
            except Exception as e:
                print(f"[예상 밖 오류] id={data['id']}: {e}")
    else:
        print("저장할 문제 없음")


if __name__ == "__main__":
    main()
