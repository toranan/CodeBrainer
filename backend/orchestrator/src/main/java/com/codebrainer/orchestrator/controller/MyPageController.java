package com.codebrainer.orchestrator.controller;

import com.codebrainer.orchestrator.dto.BulkReviewResponse;
import com.codebrainer.orchestrator.dto.ChartsResponse;
import com.codebrainer.orchestrator.dto.MySolvedItem;
import com.codebrainer.orchestrator.dto.PageResponse;
import com.codebrainer.orchestrator.dto.ReviewResponse;
import com.codebrainer.orchestrator.service.MyPageService;
import com.codebrainer.orchestrator.service.ReviewService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 마이페이지 컨트롤러
 */
@RestController
@RequestMapping("/api/me")
@Validated
public class MyPageController {

    private final MyPageService myPageService;
    private final ReviewService reviewService;

    public MyPageController(MyPageService myPageService, ReviewService reviewService) {
        this.myPageService = myPageService;
        this.reviewService = reviewService;
    }

    /**
     * 내가 푼 문제 목록 조회
     * 
     * @param userId 사용자 ID (필수)
     * @param status 제출 상태 (선택, 기본: AC만)
     * @param page 페이지 번호 (기본: 0)
     * @param size 페이지 크기 (기본: 20, 최대: 50)
     * @param sort 정렬 기준 (기본: created_at desc)
     */
    @GetMapping("/problems")
    public ResponseEntity<PageResponse<MySolvedItem>> getMyProblems(
            @RequestParam @NotNull Long userId,
            @RequestParam(required = false, defaultValue = "AC") String status,
            @RequestParam(required = false, defaultValue = "0") @Min(0) Integer page,
            @RequestParam(required = false, defaultValue = "20") @Min(1) @Max(50) Integer size,
            @RequestParam(required = false, defaultValue = "created_at,desc") String sort
    ) {
        String[] sortParams = sort.split(",");
        String property = sortParams[0];
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, property));
        Page<MySolvedItem> result = myPageService.getMySolvedProblems(userId, status, pageable);

        PageResponse<MySolvedItem> response = new PageResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * 복습 추천 조회 (단건)
     * 
     * @param userId 사용자 ID (필수)
     * @param baseProblemId 기준 문제 ID (필수)
     * @param limit 추천 개수 (기본: 3, 최대: 10)
     */
    @GetMapping("/review")
    public ResponseEntity<ReviewResponse> getReview(
            @RequestParam @NotNull Long userId,
            @RequestParam @NotNull Long baseProblemId,
            @RequestParam(required = false, defaultValue = "3") @Min(1) @Max(10) Integer limit
    ) {
        ReviewResponse response = reviewService.getReviewRecommendations(userId, baseProblemId, limit);
        return ResponseEntity.ok(response);
    }

    /**
     * 복습 추천 조회 (일괄)
     * 
     * @param userId 사용자 ID (필수)
     * @param recent 최근 제출 기준 AC 문제 수 (기본: 5)
     * @param perBaseLimit 문제당 추천 개수 (기본: 2, 최대: 5)
     */
    @GetMapping("/review/bulk")
    public ResponseEntity<BulkReviewResponse> getBulkReview(
            @RequestParam @NotNull Long userId,
            @RequestParam(required = false, defaultValue = "5") @Min(1) @Max(10) Integer recent,
            @RequestParam(required = false, defaultValue = "2") @Min(1) @Max(5) Integer perBaseLimit
    ) {
        BulkReviewResponse response = reviewService.getBulkReviewRecommendations(userId, recent, perBaseLimit);
        return ResponseEntity.ok(response);
    }

    /**
     * 차트 데이터 조회
     * 
     * @param userId 사용자 ID (필수)
     * @param days 최근 일수 (기본: 30)
     */
    @GetMapping("/charts")
    public ResponseEntity<ChartsResponse> getCharts(
            @RequestParam @NotNull Long userId,
            @RequestParam(required = false, defaultValue = "30") @Min(1) @Max(365) Integer days
    ) {
        ChartsResponse response = myPageService.getChartsData(userId, days);
        return ResponseEntity.ok(response);
    }
}

