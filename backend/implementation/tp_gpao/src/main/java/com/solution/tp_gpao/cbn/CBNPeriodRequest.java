package com.solution.tp_gpao.cbn;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CBNPeriodRequest {
    private Integer periodId;
    private Integer grossRequirements;
    private Integer scheduledReceipts;
} 