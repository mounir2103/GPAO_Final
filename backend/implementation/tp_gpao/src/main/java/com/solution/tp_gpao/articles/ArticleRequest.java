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
    private String codeBare;
    @NotNull @NotEmpty
    private String articleName;
    private String articleDescription;
    private Double tva;
    private String fournisseur;
    @NotNull
    private Double unitPrice;
    @NotNull
    private Integer delaiDoptention;
    @NotNull
    private Integer safetyStock;
    private String status;
    private Boolean isArticleFabrique;
    private Boolean isArticleAchte;
    @NotNull
    private Integer lotSize;
    @NotNull @NotEmpty
    private String type;
    @NotNull @NotEmpty
    private String unit;
}
