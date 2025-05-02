package com.solution.tp_gpao.boms;

import com.solution.tp_gpao.articles.ArticleEntity;
import com.solution.tp_gpao.articles.ArticleRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BomService {

    private final BomRepo bomRepo;
    private final ArticleRepo articleRepo;


    public void addBom(BomRequest request){
        ArticleEntity parent = articleRepo.findById(request.getParentArticleId())
                .orElseThrow(() -> new RuntimeException("Parent article not found."));
        ArticleEntity component = articleRepo.findById(request.getComponentArticleId())
                .orElseThrow(() -> new RuntimeException("Component article not found."));

        BomEntity bom = BomEntity.builder()
                .parentArticle(parent)
                .componentArticle(component)
                .requiredQuantity(request.getQuantityRequired())
                .build();

        parent.getBomEntries().add(bom);

        articleRepo.save(parent);
    }
}
