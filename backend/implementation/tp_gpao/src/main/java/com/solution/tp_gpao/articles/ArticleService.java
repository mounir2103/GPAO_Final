package com.solution.tp_gpao.articles;

import com.solution.tp_gpao.commonEntity.PageResponse;
import com.solution.tp_gpao.stock.StockEntity;
import com.solution.tp_gpao.stock.StockRepository;
import com.solution.tp_gpao.users.User;
import com.solution.tp_gpao.cbn.CBNRepository;
import com.solution.tp_gpao.productionPlanning.ProductMachineOperation;
import com.solution.tp_gpao.productionPlanning.ProductMachineOperationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepo articleRepo;
    private final ArticleMapper articleMapper;
    private final StockRepository stockRepo;
    private final ProductMachineOperationRepository operationRepo;
    private final CBNRepository cbnRepo;

    @Transactional
    public void createNewArticle(ArticleRequest request) {
        try {
            // 1. Build and save the article (without stock)
            String statusValue = (request.getStatus() != null && !request.getStatus().isEmpty())
                    ? request.getStatus().toUpperCase()
                    : "RAW_MATERIAL";

            var article = ArticleEntity.builder()
                    .codeBare(request.getCodeBare())
                    .name(request.getArticleName())
                    .fournisseur(request.getFournisseur())
                    .isArticleAchte(Boolean.TRUE.equals(request.getIsArticleAchte()))
                    .isArticleFabrique(Boolean.TRUE.equals(request.getIsArticleFabrique()))
                    .articleDescription(request.getArticleDescription())
                    .tva(request.getTva() != null ? request.getTva() : 0.0)
                    .status(ArticleStatus.valueOf(statusValue))
                    .unitPrice(request.getUnitPrice() != null ? request.getUnitPrice() : 0.0)
                    .safetyStock(request.getSafetyStock() != null ? request.getSafetyStock() : 0)
                    .delaiDoptention(request.getDelaiDoptention() != null ? request.getDelaiDoptention() : 0)
                    .lotSize(request.getLotSize() != null ? request.getLotSize() : 0)
                    .type(request.getType())
                    .unit(request.getUnit())
                    .createdDate(LocalDateTime.now())
                    .build();

            articleRepo.save(article);

            // 2. Now create and save the stock, referencing the article
            StockEntity initialStock = StockEntity.builder()
                    .quantity(0)
                    .minQuantity(request.getSafetyStock() != null ? request.getSafetyStock() : 0)
                    .maxQuantity(request.getSafetyStock() != null ? request.getSafetyStock() * 3 : 0)
                    .location("Default")
                    .article(article) // Set the article reference here!
                    .build();

            stockRepo.save(initialStock);

            // 3. Update the article with the stock reference and save again
            article.setStock(initialStock);
            articleRepo.save(article);

        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public void deleteArticle(String articleName) {
        var articleOpt = articleRepo.findByName(articleName);
        if (articleOpt.isEmpty()) {
            throw new EntityNotFoundException("Article with name " + articleName + " not found");
        }
        
        var article = articleOpt.get();
        
        try {
            // 1. First, clear the stock reference from the article
            if (article.getStock() != null) {
                article.setStock(null);
                articleRepo.save(article);
            }
            
            // 2. Delete the stock and its transactions
            stockRepo.findByArticle(article).ifPresent(stock -> {
                stockRepo.delete(stock);
                stockRepo.flush();
            });
            
            // 3. Delete machine operations
            var operations = operationRepo.findByArticle(article);
            if (!operations.isEmpty()) {
                operationRepo.deleteAll(operations);
                operationRepo.flush();
            }
            
            // 4. Delete CBN entries
            cbnRepo.deleteByArticle(article);
            cbnRepo.flush();
            
            // 5. Clear BOM entries
            article.getBomEntries().clear();
            articleRepo.save(article);
            articleRepo.flush();
            
            // 6. Finally, delete the article
            articleRepo.delete(article);
            articleRepo.flush();
            
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Erreur lors de la suppression de l'article : " + e.getMessage()
            );
        }
    }

    public ArticleResponse getArticle(String articleName) {
        return articleRepo.findByName(articleName)
                .map(articleMapper::toArticleResponse)
                .orElseThrow(()-> new EntityNotFoundException("Article with this name "+articleName+" not found"));
    }

    public PageResponse<ArticleResponse> findAllArticles(int page, int size, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
        Page<ArticleEntity> articles = articleRepo.findAllArticle(pageable);
        List<ArticleResponse> articleResponses = articles.stream()
                .map(articleMapper::toArticleResponse)
                .toList();
        return new PageResponse<>(
                articleResponses,
                articles.getNumber(),
                articles.getSize(),
                articles.getTotalElements(),
                articles.getTotalPages(),
                articles.isFirst(),
                articles.isLast()
        );
    }

    public PageResponse<ArticleResponse> findAllComponent(int page, int size, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
        Page<ArticleEntity> articles = articleRepo.findAllComponent(pageable);
        List<ArticleResponse> articleResponses = articles.stream()
                .map(articleMapper::toArticleResponse)
                .toList();
        return new PageResponse<>(
                articleResponses,
                articles.getNumber(),
                articles.getSize(),
                articles.getTotalElements(),
                articles.getTotalPages(),
                articles.isFirst(),
                articles.isLast()
        );
    }

    public PageResponse<ArticleResponse> findAllFinishedArticles(int page, int size, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
        Page<ArticleEntity> articles = articleRepo.findAllFinishedArticle(pageable);
        List<ArticleResponse> articleResponses = articles.stream()
                .map(articleMapper::toArticleResponse)
                .toList();
        return new PageResponse<>(
                articleResponses,
                articles.getNumber(),
                articles.getSize(),
                articles.getTotalElements(),
                articles.getTotalPages(),
                articles.isFirst(),
                articles.isLast()
        );
    }

    public PageResponse<ArticleResponse> getAllArticles(Pageable pageable) {
        Page<ArticleEntity> articles = articleRepo.findAll(pageable);
        List<ArticleResponse> articleResponses = articles.getContent().stream()
                .map(article -> {
                    ArticleResponse response = articleMapper.toArticleResponse(article);
                    // Add stock information
                    stockRepo.findByArticle(article).ifPresent(stock -> {
                        response.setStockQuantity(stock.getQuantity());
                        response.setMinQuantity(stock.getMinQuantity());
                        response.setMaxQuantity(stock.getMaxQuantity());
                        response.setLocation(stock.getLocation());
                        response.setLastUpdated(stock.getLastUpdated());
                    });
                    return response;
                })
                .collect(Collectors.toList());

        return PageResponse.<ArticleResponse>builder()
                .list(articleResponses)
                .totalElements(articles.getTotalElements())
                .totalPages(articles.getTotalPages())
                .pageNumber(articles.getNumber())
                .pageSize(articles.getSize())
                .build();
    }

    public ArticleResponse getArticleById(Long id) {
        ArticleEntity article = articleRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Article not found"));
        
        ArticleResponse response = articleMapper.toArticleResponse(article);
        
        // Add stock information
        stockRepo.findByArticle(article).ifPresent(stock -> {
            response.setStockQuantity(stock.getQuantity());
            response.setMinQuantity(stock.getMinQuantity());
            response.setMaxQuantity(stock.getMaxQuantity());
            response.setLocation(stock.getLocation());
            response.setLastUpdated(stock.getLastUpdated());
        });
        
        return response;
    }

    @Transactional
    public ArticleResponse updateArticle(Long id, ArticleRequest request) {
        ArticleEntity article = articleRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Article not found"));

        // Update article fields
        article.setName(request.getArticleName());
        article.setArticleDescription(request.getArticleDescription());
        article.setFournisseur(request.getFournisseur());
        article.setIsArticleAchte(Boolean.TRUE.equals(request.getIsArticleAchte()));
        article.setIsArticleFabrique(Boolean.TRUE.equals(request.getIsArticleFabrique()));
        article.setTva(request.getTva() != null ? request.getTva() : article.getTva());
        article.setUnitPrice(request.getUnitPrice() != null ? request.getUnitPrice() : article.getUnitPrice());
        article.setSafetyStock(request.getSafetyStock() != null ? request.getSafetyStock() : article.getSafetyStock());
        article.setDelaiDoptention(request.getDelaiDoptention() != null ? request.getDelaiDoptention() : article.getDelaiDoptention());
        article.setLotSize(request.getLotSize() != null ? request.getLotSize() : article.getLotSize());
        article.setType(request.getType());
        article.setUnit(request.getUnit());

        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            article.setStatus(ArticleStatus.valueOf(request.getStatus().toUpperCase()));
        }

        // Save the updated article
        article = articleRepo.save(article);

        // Update stock if safety stock changed
        if (request.getSafetyStock() != null) {
            stockRepo.findByArticle(article).ifPresent(stock -> {
                stock.setMinQuantity(request.getSafetyStock());
                stock.setMaxQuantity(request.getSafetyStock() * 3);
                stockRepo.save(stock);
            });
        }

        return articleMapper.toArticleResponse(article);
    }
}
