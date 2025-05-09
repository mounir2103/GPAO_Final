package com.solution.tp_gpao.productionPlanning;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MachineOrder {
    private Long id;
    private String name;
    private int index;
} 