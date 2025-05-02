package com.solution.tp_gpao.stock;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@RestController
@RequestMapping("/stock")
@RequiredArgsConstructor
@Tag(name = "Stock")
public class StockController {
    private final StockService stockService;
    @Autowired
    private StockTransactionRepository stockTransactionRepository;

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping
    public ResponseEntity<List<StockDTO>> getAllStocks() {
        return ResponseEntity.ok(stockService.getAllStocks());
    }

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/{articleId}")
    public ResponseEntity<StockDTO> getStockByArticleId(@PathVariable Long articleId) {
        return ResponseEntity.ok(stockService.getStockByArticleId(articleId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @PutMapping("/{articleId}")
    public ResponseEntity<StockDTO> updateStock(
            @PathVariable Long articleId,
            @RequestBody StockDTO stockDTO) {
        return ResponseEntity.ok(stockService.updateStock(articleId, stockDTO));
    }

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @PostMapping("/{articleId}/adjust")
    public ResponseEntity<StockDTO> adjustStock(
            @PathVariable Long articleId,
            @RequestParam int adjustment) {
        return ResponseEntity.ok(stockService.adjustStock(articleId, adjustment));
    }

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/{articleId}/transactions")
    public ResponseEntity<List<StockTransaction>> getTransactions(@PathVariable Long articleId) {
        StockEntity stock = stockService.getStockEntityByArticleId(articleId);
        return ResponseEntity.ok(stockTransactionRepository.findByStock_Id(stock.getId()));
    }
} 