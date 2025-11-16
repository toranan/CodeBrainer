"""
백준 문제 크롤링 스크립트
주의: 교육 목적으로만 사용하세요!
"""

import requests
from bs4 import BeautifulSoup
import json
import time

def crawl_baekjoon_problem(problem_id):
    """
    백준 문제 하나를 크롤링
    
    Args:
        problem_id (int): 백준 문제 번호
        
    Returns:
        dict: 문제 정보
    """
    url = f"https://www.acmicpc.net/problem/{problem_id}"
    
    # User-Agent 헤더 추가 (봇 차단 우회)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.acmicpc.net/'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 문제 제목
        title = soup.select_one('#problem_title')
        title_text = title.text.strip() if title else "제목 없음"
        
        # 문제 설명
        description = soup.select_one('#problem_description')
        description_text = description.get_text(strip=True) if description else ""
        
        # 입력 설명
        input_desc = soup.select_one('#problem_input')
        input_text = input_desc.get_text(strip=True) if input_desc else ""
        
        # 출력 설명
        output_desc = soup.select_one('#problem_output')
        output_text = output_desc.get_text(strip=True) if output_desc else ""
        
        # 시간 제한
        time_limit = soup.select_one('#problem-info tbody tr td:nth-child(1)')
        time_text = time_limit.text.strip() if time_limit else "1초"
        
        # 메모리 제한
        mem_limit = soup.select_one('#problem-info tbody tr td:nth-child(2)')
        mem_text = mem_limit.text.strip() if mem_limit else "128MB"
        
        # 예제 입력/출력
        samples = []
        sample_inputs = soup.select('.sampledata[id^="sample-input"]')
        sample_outputs = soup.select('.sampledata[id^="sample-output"]')
        
        for i, (inp, out) in enumerate(zip(sample_inputs, sample_outputs), 1):
            samples.append({
                'case_no': i,
                'input': inp.get_text(strip=True),
                'output': out.get_text(strip=True),
                'hidden': False
            })
        
        problem_data = {
            'id': problem_id,
            'title': title_text,
            'description': description_text,
            'input_format': input_text,
            'output_format': output_text,
            'time_limit': time_text,
            'memory_limit': mem_text,
            'samples': samples,
            'source_url': url
        }
        
        print(f"✅ 문제 {problem_id} 크롤링 완료: {title_text}")
        return problem_data
        
    except Exception as e:
        print(f"❌ 문제 {problem_id} 크롤링 실패: {e}")
        return None


def crawl_multiple_problems(problem_ids, delay=2):
    """
    여러 문제를 크롤링 (서버 부담 최소화)
    
    Args:
        problem_ids (list): 문제 번호 리스트
        delay (int): 요청 간 대기 시간 (초)
        
    Returns:
        list: 크롤링된 문제 리스트
    """
    results = []
    
    for problem_id in problem_ids:
        print(f"크롤링 중: {problem_id}...")
        problem = crawl_baekjoon_problem(problem_id)
        
        if problem:
            results.append(problem)
        
        # 서버 부담 줄이기 위해 대기
        if problem_id != problem_ids[-1]:  # 마지막이 아니면
            print(f"{delay}초 대기...")
            time.sleep(delay)
    
    return results


def save_to_json(problems, filename='problems.json'):
    """JSON 파일로 저장"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(problems, f, ensure_ascii=False, indent=2)
    print(f"✅ {filename}에 저장 완료!")


if __name__ == "__main__":
    # 크롤링할 문제 번호 리스트
    problem_ids1 = [
        15829, 3033, 1605, 15551, 13402, 15250, 5044, 30863
    ]
    problem_ids2 = [9012, 10773, 4949, 1406, 12605, 3954, 3025
    ]
    problem_ids3 = [1927, 11286, 1202, 15577, 30108 
    ]

    print("=" * 50)
    print("백준 문제 크롤링 시작")
    print("주의: 교육 목적으로만 사용하세요!")
    print("=" * 50)
    
    # 크롤링 실행 (서버 부담을 줄이기 위해 3초 대기)
    problems1 = crawl_multiple_problems(problem_ids1, delay=3)
    problems2 = crawl_multiple_problems(problem_ids2, delay=3)
    problems3 = crawl_multiple_problems(problem_ids3, delay=3)
    # JSON 저장
    save_to_json(problems1, 'crawled_problems_hashing.json')
    save_to_json(problems2, 'crawled_problems_stack.json') 
    save_to_json(problems3, 'crawled_problems_heap.json')
    
    print(f"\n총 {len(problems1)}개 Hashing 문제 크롤링 완료!")
    print(f"총 {len(problems2)}개 Stack 문제 크롤링 완료!")
    print(f"총 {len(problems3)}개 Heap 문제 크롤링 완료!")

