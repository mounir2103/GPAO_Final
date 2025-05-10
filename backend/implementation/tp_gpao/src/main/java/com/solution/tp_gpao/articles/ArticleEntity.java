package com.solution.tp_gpao.articles;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.solution.tp_gpao.boms.BomEntity;
import com.solution.tp_gpao.stock.StockEntity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Article")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ArticleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long articleId;
    @Column(name = "code_bare", nullable = false, unique = true, updatable = false)
    private String codeBare;
    private String name;
    @Column(length = 500)
    private String articleDescription;
    private double unitPrice;
    @Column(name = "tva")
    private double tva;
    @Column(name = "fournisseur")
    private String fournisseur;
    @Column(name = "delaidoptention")
    private Integer delaiDoptention;
    @Enumerated(EnumType.STRING)
    private ArticleStatus status;
    @Column(name = "is_article_fabrique")
    private boolean isArticleFabrique;
    @Column(name = "is_article_achte")
    private boolean isArticleAchte;
    private Integer safetyStock;
    private Integer lotSize;
    private String type;
    private String unit;
    @OneToMany(mappedBy = "parentArticle", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    @JsonIgnore
    private List<BomEntity> bomEntries = new ArrayList<>();
    @OneToOne(mappedBy = "article")
    private StockEntity stock;
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdDate;

    public void setIsArticleAchte(boolean isArticleAchte) {
        this.isArticleAchte = isArticleAchte;
    }
    public void setIsArticleFabrique(boolean isArticleFabrique) {
        this.isArticleFabrique = isArticleFabrique;
    }
}
