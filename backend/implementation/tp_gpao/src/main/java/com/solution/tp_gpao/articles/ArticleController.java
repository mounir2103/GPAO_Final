package com.solution.tp_gpao.articles;

import com.solution.tp_gpao.commonEntity.PageResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/article")
@RequiredArgsConstructor
@Tag(name = "Article")
public class ArticleController {

    private final ArticleService service;

    @PreAuthorize("hasAnyRole('USER' , 'ADMIN')")
    @PostMapping("/create-article")
    public ResponseEntity<?> createNewArticle(@RequestBody ArticleRequest request) {
        try {
            service.createNewArticle(request);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Article créé avec succès"
            ));
        } catch (ResponseStatusException e) {
            return ResponseEntity
                .status(e.getStatusCode())
                .body(Map.of(
                    "success", false,
                    "message", e.getReason()
                ));
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "message", "Une erreur est survenue lors de la création de l'article"
                ));
        }
    }

    @PreAuthorize("hasAnyRole('USER' , 'ADMIN')")
    @DeleteMapping("/delete/{articleName}")
    public ResponseEntity<?> deleteArticle(@PathVariable String articleName){
        service.deleteArticle(articleName);
        return ResponseEntity.ok(HttpStatus.NO_CONTENT);
    }
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/get-article/{articleName}")
    public ResponseEntity<ArticleResponse> getArticle(@PathVariable String articleName){
        return ResponseEntity.ok(service.getArticle(articleName));
    }
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/all-articles")
    public ResponseEntity<PageResponse<ArticleResponse>>findAllArticles(
            @RequestParam(name = "page" ,defaultValue = "0", required = false)int page,
            @RequestParam(name = "size" ,defaultValue = "5", required = false)int size,
            Authentication connectedUser
    ){
        return ResponseEntity.ok(service.findAllArticles(page,size,connectedUser));
    }
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/all-raw-material-articles")
    public ResponseEntity<PageResponse<ArticleResponse>>findAllComponent(
            @RequestParam(name = "page" ,defaultValue = "0", required = false)int page,
            @RequestParam(name = "size" ,defaultValue = "5", required = false)int size,
            Authentication connectedUser
    ){
        return ResponseEntity.ok(service.findAllComponent(page,size,connectedUser));
    }
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/all-finished-articles")
    public ResponseEntity<PageResponse<ArticleResponse>>findAllFinishedArticles(
            @RequestParam(name = "page" ,defaultValue = "0", required = false)int page,
            @RequestParam(name = "size" ,defaultValue = "5", required = false)int size,
            Authentication connectedUser
    ){
        return ResponseEntity.ok(service.findAllFinishedArticles(page,size,connectedUser));
    }

}
