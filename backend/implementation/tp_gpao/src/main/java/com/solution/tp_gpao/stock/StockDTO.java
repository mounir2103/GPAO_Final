package com.solution.tp_gpao.stock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockDTO {
    private Long id;
    private Long articleId;
    private String articleName;
    private String articleCode;
    private Integer quantity;
    private Integer minQuantity;
    private Integer maxQuantity;
    private LocalDateTime lastUpdated;
    private String location;
} 