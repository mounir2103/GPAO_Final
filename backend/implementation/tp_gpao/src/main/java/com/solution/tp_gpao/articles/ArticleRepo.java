package com.solution.tp_gpao.articles;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ArticleRepo extends JpaRepository<ArticleEntity,Long> {

    @Query("""
        SELECT article
        FROM ArticleEntity article
    """)
    Page<ArticleEntity> findAllArticle(Pageable pageable);

    Optional<ArticleEntity> findByName(String name);

    @Query("""
    SELECT article
    FROM ArticleEntity article
    WHERE article.status = 'RAW_MATERIAL'
    """)
    Page<ArticleEntity> findAllComponent(Pageable pageable);

    @Query("""
    SELECT article
    FROM ArticleEntity article
    WHERE article.status = 'FINISHED'
    """)
    Page<ArticleEntity> findAllFinishedArticle(Pageable pageable);
}
