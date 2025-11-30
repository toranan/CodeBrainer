package com.codebrainer.orchestrator.controller;

import com.codebrainer.orchestrator.dto.AdminDashboardStats;
import com.codebrainer.orchestrator.dto.PageResponse;
import com.codebrainer.orchestrator.dto.UserListItem;
import com.codebrainer.orchestrator.service.AdminService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
 * 관리자 컨트롤러
 */
@RestController
@RequestMapping("/api/admin")
@Validated
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /**
     * 관리자 대시보드 통계 조회
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminDashboardStats> getDashboardStats() {
        AdminDashboardStats stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * 사용자 목록 조회
     */
    @GetMapping("/users")
    public ResponseEntity<PageResponse<UserListItem>> getUserList(
            @RequestParam(value = "page", required = false, defaultValue = "0") @Min(0) Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "20") @Min(1) @Max(100) Integer size,
            @RequestParam(value = "sort", required = false, defaultValue = "createdAt,desc") String sort
    ) {
        String[] sortParams = sort.split(",");
        String property = sortParams[0];
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, property));
        Page<UserListItem> result = adminService.getUserList(pageable);

        PageResponse<UserListItem> response = new PageResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );

        return ResponseEntity.ok(response);
    }
}

