package com.solution.tp_gpao.productionPlanning;

import java.util.List;
import lombok.Data;

@Data
public class MatrixRequest {
    private int[][] matrix;
    private List<MachineEntity> machines;
} 