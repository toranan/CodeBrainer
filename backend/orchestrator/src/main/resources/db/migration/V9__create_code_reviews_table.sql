-- AI 코드 리뷰 테이블 생성
-- 정답 처리된 제출 코드에 대한 AI 리뷰를 저장

CREATE TABLE IF NOT EXISTS code_reviews (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    review_content TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    suggestions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(submission_id)
);

-- 인덱스 생성
CREATE INDEX idx_code_reviews_submission ON code_reviews(submission_id);
CREATE INDEX idx_code_reviews_created_at ON code_reviews(created_at DESC);
