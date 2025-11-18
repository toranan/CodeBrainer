# 문제 크롤링 도구

⚠️ **주의: 교육 목적으로만 사용하세요!**

## 설치

```bash
cd crawler
pip install -r requirements.txt
```

## 사용법

### 1. 백준 문제 크롤링

```bash
python baekjoon_crawler.py
```

### 2. 크롤링 결과

`crawled_problems.json` 파일에 저장됩니다.

### 3. 크롤링할 문제 변경

`baekjoon_crawler.py` 파일의 `problem_ids` 리스트를 수정하세요:

```python
problem_ids = [
    1000,  # A+B
    1001,  # A-B
    # 원하는 문제 번호 추가...
]
```

## 주의사항

- 서버 부담을 줄이기 위해 요청 간 2초 대기
- 대량 크롤링 금지
- robots.txt 확인 필수
- 상업적 이용 금지
- 교육/연구 목적으로만 사용

## 법적 고지

이 도구는 교육 목적으로 제공됩니다. 크롤링한 데이터의 저작권은 원 저작자에게 있으며, 무단 배포 및 상업적 이용을 금지합니다.


