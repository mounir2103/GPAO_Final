package com.solution.tp_gpao.commonEntity;

import lombok.*;

import java.util.List;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class PageResponse <T>{

    private List<T> list;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean firstPage;
    private boolean lastPage;
}
