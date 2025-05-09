package com.solution.tp_gpao.productionPlanning;

import java.util.List;
import lombok.Data;

@Data
public class KingResponse {
    private List<MachineOrder> order;
    private int[][] finalMatrix;
    private List<String> productNames;
    private List<String> machineNames;
} 