package com.solution.tp_gpao.boms;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.solution.tp_gpao.articles.ArticleEntity;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "Nomenclature")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class BomEntity {

    @Id
    @GeneratedValue
    private Long bomId;

    @ManyToOne
    @JoinColumn(name = "parent_article_id")
    @JsonBackReference
    private ArticleEntity parentArticle;

    @ManyToOne
    @JoinColumn(name = "component_article_id")
    private ArticleEntity componentArticle;

    private int requiredQuantity;

}
