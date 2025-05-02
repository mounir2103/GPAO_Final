package com.solution.tp_gpao.boms;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/bom")
@RequiredArgsConstructor
@Tag(name = "Bom")
public class BomController {

    private final BomService service;

    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @PostMapping("/associate-article-to-component")
    public ResponseEntity<?> addBom(@RequestBody BomRequest request){
        service.addBom(request);
        return ResponseEntity.ok(HttpStatus.CREATED);
    }
}
