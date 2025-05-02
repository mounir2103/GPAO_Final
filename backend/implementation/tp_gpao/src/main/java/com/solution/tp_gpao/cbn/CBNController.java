package com.solution.tp_gpao.cbn;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cbn")
@RequiredArgsConstructor
@Tag(name = "CBN")
public class CBNController {
    private final CBNService cbnService;

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/{articleId}")
    public ResponseEntity<List<CBNEntity>> getCBN(@PathVariable Long articleId) {
        return ResponseEntity.ok(cbnService.getCBNForArticle(articleId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @PostMapping("/calculate/{articleId}")
    public ResponseEntity<List<CBNEntity>> calculateCBN(
            @PathVariable Long articleId,
            @RequestBody List<CBNPeriodRequest> periods) {
        return ResponseEntity.ok(cbnService.calculateCBN(articleId, periods));
    }
} 