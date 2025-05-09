package com.solution.tp_gpao.articles;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleResponse {
    private Long articleId;
    private String codeBare;
    private String name;
    private String articleDescription;
    private double unitPrice;
    private double tva;
    private String fournisseur;
    private Integer delaiDoptention;
    private ArticleStatus status;
    private boolean isArticleFabrique;
    private boolean isArticleAchte;
    private Integer safetyStock;
    private Integer lotSize;
    private String type;
    private String unit;
    private LocalDateTime createdDate;
    
    // Stock information
    private Integer stockQuantity;
    private Integer minQuantity;
    private Integer maxQuantity;
    private String location;
    private LocalDateTime lastUpdated;
}
