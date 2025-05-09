package com.solution.tp_gpao.stock;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "stock_id")
    private StockEntity stock;

    private int quantityChange;
    private String type; // "ENTRY" or "EXIT"
    private String username;
    private LocalDateTime timestamp;
    private String note;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
} 