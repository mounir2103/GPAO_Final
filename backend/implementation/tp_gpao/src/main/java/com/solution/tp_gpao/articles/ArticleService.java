package com.solution.tp_gpao.articles;

import com.solution.tp_gpao.commonEntity.PageResponse;
import com.solution.tp_gpao.stock.StockEntity;
import com.solution.tp_gpao.stock.StockRepository;
import com.solution.tp_gpao.users.User;
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

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepo articleRepo;
    private final ArticaleMapper articaleMapper;
    private final StockRepository stockRepository;

    @Transactional
    public void createNewArticle(ArticleRequest request) {
        try {
            var article = ArticleEntity.builder()
                    .code_bare(request.getCode_bare())
                    .name(request.getArticleName())
                    .Fournisseur(request.getFournisseur())
                    .isArticleAchte(request.isArticleAchte())
                    .isArticleFabrique(request.isArticleFabrique())
                    .articleDescription(request.getArticleDescription())
                    .TVA(request.getTVA())
                    .status(ArticleStatus.valueOf(request.getStatus().toUpperCase()))
                    .unitPrice(request.getUnitPrice())
                    .safetyStock(request.getSafetyStock())
                    .delaidoptention(request.getDelaidoptention().intValue())
                    .lotSize(request.getLotSize())
                    .type(request.getType())
                    .unit(request.getUnit())
                    .createdDate(LocalDateTime.now())
                    .build();
            
            // Save the article first
            article = articleRepo.save(article);

            // Initialize stock for the new article
            StockEntity initialStock = StockEntity.builder()
                    .article(article)
                    .quantity(0) // Initial quantity is 0
                    .minQuantity(article.getSafetyStock()) // Use safety stock as min quantity
                    .maxQuantity(article.getSafetyStock() * 3) // Example: max is 3 times safety stock
                    .location("Default") // Default location
                    .build();
            
            stockRepository.save(initialStock);

        } catch (DataIntegrityViolationException e) {
            if (e.getMessage().contains("uk6m4pgvbh18lkp9tkmjjj37hsg")) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Un article avec ce code-barres existe déjà");
            }
            throw e;
        }
    }

    public void deleteArticle(String articleName) {
        var article = articleRepo.findByName(articleName);
        articleRepo.deleteById(article.get().getArticleId());
    }

    public ArticleResponse getArticle(String articleName) {
        return articleRepo.findByName(articleName)
                .map(articaleMapper::toArticleResponse)
                .orElseThrow(()-> new EntityNotFoundException("Article with this name "+articleName+" not found"));

    }

    public PageResponse<ArticleResponse> findAllArticles(int page, int size, Authentication connectedUser) {
            User user = (User) connectedUser.getPrincipal();
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
            Page<ArticleEntity> articles = articleRepo.findAllArticle(pageable);
            List<ArticleResponse> articleResponses  = articles.stream()
                    .map(articaleMapper::toArticleResponse)
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
        List<ArticleResponse> articleResponses  = articles.stream()
                .map(articaleMapper::toArticleResponse)
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
        List<ArticleResponse> articleResponses  = articles.stream()
                .map(articaleMapper::toArticleResponse)
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
}
