package com.solution.tp_gpao.cbn;

import com.solution.tp_gpao.articles.ArticleEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "cbn_calculations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CBNEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "article_id")
    private ArticleEntity article;

    private Integer periodId;
    private String periodName;
    private Integer grossRequirements;
    private Integer scheduledReceipts;
    private Integer projectedInventory;
    private Integer netRequirements;
    private Integer plannedOrders;
    private Integer plannedOrderReleases;

    @Column(updatable = false)
    private LocalDateTime createdDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
    }
} 