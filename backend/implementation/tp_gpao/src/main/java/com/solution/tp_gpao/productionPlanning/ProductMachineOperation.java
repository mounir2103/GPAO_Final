package com.solution.tp_gpao.productionPlanning;

import com.solution.tp_gpao.articles.ArticleEntity;
import jakarta.persistence.*;

@Entity
public class ProductMachineOperation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private ArticleEntity article;

    @ManyToOne
    private MachineEntity machine;

    private int operationNumber;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ArticleEntity getArticle() { return article; }
    public void setArticle(ArticleEntity article) { this.article = article; }
    public MachineEntity getMachine() { return machine; }
    public void setMachine(MachineEntity machine) { this.machine = machine; }
    public int getOperationNumber() { return operationNumber; }
    public void setOperationNumber(int operationNumber) { this.operationNumber = operationNumber; }
} 