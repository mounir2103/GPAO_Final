package com.solution.tp_gpao.cbn;

import com.solution.tp_gpao.articles.ArticleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CBNRepository extends JpaRepository<CBNEntity, Long> {
    List<CBNEntity> findByArticleOrderByPeriodId(ArticleEntity article);
    void deleteByArticle(ArticleEntity article);
} 