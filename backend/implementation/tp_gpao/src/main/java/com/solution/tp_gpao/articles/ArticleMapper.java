package com.solution.tp_gpao.articles;

import org.springframework.stereotype.Component;

@Component
public class ArticleMapper {
    
    public ArticleResponse toArticleResponse(ArticleEntity article) {
        return ArticleResponse.builder()
                .articleId(article.getArticleId())
                .name(article.getName())
                .codeBare(article.getCodeBare())
                .articleDescription(article.getArticleDescription())
                .unitPrice(article.getUnitPrice())
                .tva(article.getTva())
                .fournisseur(article.getFournisseur())
                .delaiDoptention(article.getDelaiDoptention())
                .status(article.getStatus())
                .isArticleFabrique(article.isArticleFabrique())
                .isArticleAchte(article.isArticleAchte())
                .safetyStock(article.getSafetyStock())
                .lotSize(article.getLotSize())
                .type(article.getType())
                .unit(article.getUnit())
                .createdDate(article.getCreatedDate())
                .build();
    }

    public ArticleEntity toEntity(ArticleRequest request) {
        return ArticleEntity.builder()
                .codeBare(request.getCodeBare())
                .name(request.getArticleName())
                .articleDescription(request.getArticleDescription())
                .unitPrice(request.getUnitPrice())
                .tva(request.getTva())
                .fournisseur(request.getFournisseur())
                .delaiDoptention(request.getDelaiDoptention())
                .status(request.getStatus() != null ? ArticleStatus.valueOf(request.getStatus().toUpperCase()) : null)
                .isArticleFabrique(Boolean.TRUE.equals(request.getIsArticleFabrique()))
                .isArticleAchte(Boolean.TRUE.equals(request.getIsArticleAchte()))
                .safetyStock(request.getSafetyStock())
                .lotSize(request.getLotSize())
                .type(request.getType())
                .unit(request.getUnit())
                .build();
    }
} 