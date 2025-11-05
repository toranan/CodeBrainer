package com.codebrainer.orchestrator.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import lombok.*;
import java.util.List;
import java.util.ArrayList;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "hints")
public class Hint {

    @Id
    private Long problemId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "problem_id")
    private Problem problem;

    // @Column
    // private String source = "manual";

    @ElementCollection
    @CollectionTable(name = "hint_list", joinColumns = @JoinColumn(name = "problem_id"))
    @Column(name = "hint_text")
    @OrderColumn(name = "hint_order")
    private List<String> hints = new ArrayList<>();

    @Builder
    public Hint(Long id, Problem problem, List<String> hints) {
        this.id = id;
        this.problem = problem;
        int level = problem.getLevel();
        
        List<String> temp = (hints != null) ? new ArrayList<>(hints) : new ArrayList<>();
    
        // 개수 맞추기
        while (temp.size() < level) temp.add("");

        this.hints = temp;
    }
}

