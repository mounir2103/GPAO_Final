package com.solution.tp_gpao.boms;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @Builder
public class BomRequest {

    private Long parentArticleId;
    private Long componentArticleId;
    private int quantityRequired;
}
