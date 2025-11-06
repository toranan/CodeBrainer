package com.codebrainer.orchestrator.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import lombok.*;
import java.util.List;
import java.util.ArrayList;

import com.codebrainer.orchestrator.domain.Problem;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "hints")
public class Hint {

    @Id
    @Column(name = "problem_id")
    private Long problemId;

    @Id
    @Column(name = "hint_order")
    private Integer hintOrder;

    @Column(name = "hint1_path", columnDefinition = "TEXT")
    private String hint1Path;
    
    @Column(name = "hint2_path", columnDefinition = "TEXT")
    private String hint2Path;

    @Column(name = "hint3_path", columnDefinition = "TEXT")
    private String hint3Path;

    @Column(name = "hint4_path", columnDefinition = "TEXT")
    private String hint4Path;

    @Builder
    public Hint(Problem problem, Integer hintOrder, List<String> hints) {
        this.problemId = problem.getId();
        this.hintOrder = hintOrder;

        if (hintOrder > hints.size()) {
            setPathField(null);
            return;
        }

        String content = hints.get(hintOrder - 1);

        String path = "../storage/hints/" + problem.getId() + "/";
        String filename = "hint_" + hintOrder + ".txt";
        String fullPath = path + filename;

        new File(path).mkdirs();
        try (FileWriter writer = new FileWriter(fullPath)) {
            writer.write(content);
        } catch (IOException e) {
            throw new RuntimeException("힌트 파일 저장 실패", e);
        }
        switch (hintOrder) {
            case 1 -> this.hint1Path = path;
            case 2 -> this.hint2Path = path;
            case 3 -> this.hint3Path = path;
            case 4 -> this.hint4Path = path;
            default -> {}
        }
    }
}