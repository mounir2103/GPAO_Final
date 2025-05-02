package com.solution.tp_gpao.stock;

import com.solution.tp_gpao.articles.ArticleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<StockEntity, Long> {
    Optional<StockEntity> findByArticle(ArticleEntity article);
    Optional<StockEntity> findByArticle_ArticleId(Long articleId);
} 