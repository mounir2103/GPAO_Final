package com.solution.tp_gpao.productionPlanning;

import java.util.Map;

public interface ProductionPlanningService {
    Map<String, Object> getMatrix();
    Map<String, Object> saveMatrix(Map<String, Object> matrixRequest);
    Map<String, Object> runKuziack(Map<String, Object> matrixRequest);
    KingResponse runKing(MatrixRequest request);
}
