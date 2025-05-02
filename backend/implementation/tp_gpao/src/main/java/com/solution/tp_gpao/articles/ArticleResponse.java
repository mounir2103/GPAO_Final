package com.solution.tp_gpao.articles;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter @Getter @Builder
public class ArticleResponse {
    private long articleId;
    private String code_bare;
    private String name;
    private String articleDescription;
    private double unitPrice;
    private double TVA;
    private String Fournisseur;
    private double delaidoptention;
    private ArticleStatus status;
    private boolean isArticleFabrique;
    private boolean isArticleAchte;
    private int safetyStock;
    private Integer lotSize;
    private String type;
    private String unit;
}
