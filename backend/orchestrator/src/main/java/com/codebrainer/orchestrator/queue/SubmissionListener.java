package com.codebrainer.orchestrator.queue;

import com.codebrainer.orchestrator.service.JudgeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class SubmissionListener {

    private static final Logger log = LoggerFactory.getLogger(SubmissionListener.class);

    private final JudgeService judgeService;

    public SubmissionListener(JudgeService judgeService) {
        this.judgeService = judgeService;
    }

    @RabbitListener(queues = "${queue.submission.name}")
    public void handleSubmission(Long submissionId) {
        log.info("채점 요청 수신: submissionId={}", submissionId);
        
        try {
            judgeService.executeSubmission(submissionId);
            log.info("채점 완료: submissionId={}", submissionId);
        } catch (Exception e) {
            log.error("채점 실패: submissionId={}, error={}", submissionId, e.getMessage(), e);
            // TODO: 실패한 제출을 재시도 큐나 데드 레터 큐로 이동
            throw new RuntimeException("채점 처리 중 오류 발생", e);
        }
    }
}

