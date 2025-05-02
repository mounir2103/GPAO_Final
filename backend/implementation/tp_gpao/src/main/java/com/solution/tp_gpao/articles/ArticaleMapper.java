package com.solution.tp_gpao.articles;

import org.springframework.stereotype.Service;

@Service
public class ArticaleMapper {
    public ArticleResponse toArticleResponse(ArticleEntity articleEntity) {
        return ArticleResponse.builder()
                .articleId(articleEntity.getArticleId())
                .articleDescription(articleEntity.getArticleDescription())
                .name(articleEntity.getName())
                .isArticleAchte(articleEntity.isArticleAchte())
                .TVA(articleEntity.getTVA())
                .delaidoptention(articleEntity.getDelaidoptention())
                .Fournisseur(articleEntity.getFournisseur())
                .isArticleFabrique(articleEntity.isArticleFabrique())
                .safetyStock(articleEntity.getSafetyStock())
                .code_bare(articleEntity.getCode_bare())
                .status(articleEntity.getStatus())
                .unitPrice(articleEntity.getUnitPrice())
                .lotSize(articleEntity.getLotSize())
                .type(articleEntity.getType())
                .unit(articleEntity.getUnit())
                .build();
    }
}
