package com.solution.tp_gpao.stock;

import com.solution.tp_gpao.articles.ArticleEntity;
import com.solution.tp_gpao.articles.ArticleRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockService {
    private final StockRepository stockRepository;
    private final ArticleRepo articleRepository;

    public List<StockDTO> getAllStocks() {
        return stockRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public StockDTO getStockByArticleId(Long articleId) {
        return stockRepository.findByArticle_ArticleId(articleId)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Stock not found for article ID: " + articleId));
    }

    @Transactional
    public StockDTO updateStock(Long articleId, StockDTO stockDTO) {
        ArticleEntity article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        StockEntity stock = stockRepository.findByArticle(article)
                .orElse(StockEntity.builder().article(article).build());

        stock.setQuantity(stockDTO.getQuantity());
        stock.setMinQuantity(stockDTO.getMinQuantity());
        stock.setMaxQuantity(stockDTO.getMaxQuantity());
        stock.setLocation(stockDTO.getLocation());

        return convertToDTO(stockRepository.save(stock));
    }

    @Transactional
    public StockDTO adjustStock(Long articleId, int adjustment) {
        ArticleEntity article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        StockEntity stock = stockRepository.findByArticle(article)
                .orElse(StockEntity.builder()
                        .article(article)
                        .quantity(0)
                        .build());

        int newQuantity = stock.getQuantity() + adjustment;
        if (newQuantity < 0) {
            throw new RuntimeException("Insufficient stock");
        }

        stock.setQuantity(newQuantity);
        return convertToDTO(stockRepository.save(stock));
    }

    public StockEntity getStockEntityByArticleId(Long articleId) {
        ArticleEntity article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        return stockRepository.findByArticle(article)
                .orElseThrow(() -> new RuntimeException("Stock not found"));
    }

    private StockDTO convertToDTO(StockEntity stock) {
        return StockDTO.builder()
                .id(stock.getId())
                .articleId(stock.getArticle().getArticleId())
                .articleName(stock.getArticle().getName())
                .articleCode(stock.getArticle().getCode_bare())
                .quantity(stock.getQuantity())
                .minQuantity(stock.getMinQuantity())
                .maxQuantity(stock.getMaxQuantity())
                .lastUpdated(stock.getLastUpdated())
                .location(stock.getLocation())
                .build();
    }
} 