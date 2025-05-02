package com.solution.tp_gpao.articles;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArticleRequest {

    @NotNull @NotEmpty
    private String code_bare;
    @NotNull @NotEmpty
    private String articleName;
    private String articleDescription;
    private double TVA;
    private String Fournisseur;
    @NotNull @NotEmpty
    private double unitPrice;
    @NotNull @NotEmpty
    private Integer delaidoptention;
    @NotNull @NotEmpty
    private Integer safetyStock;
    private String status;
    private boolean isArticleFabrique;
    private boolean isArticleAchte;
    @NotNull
    private Integer lotSize;
    @NotNull
    private String type;
    @NotNull
    private String unit;
}
