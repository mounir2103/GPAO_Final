package com.solution.tp_gpao.productionPlanning;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/production-planning")
public class ProductionPlanningController {
    @Autowired
    private ProductionPlanningServiceImpl planningService;

    @GetMapping("/matrix")
    public Map<String, Object> getMatrix() {
        return planningService.getMatrix();
    }

    @PostMapping("/matrix")
    public Map<String, Object> saveMatrix(@RequestBody Map<String, Object> matrixRequest) {
        return planningService.saveMatrix(matrixRequest);
    }

    @PostMapping("/kuziack")
    public Map<String, Object> runKuziack(@RequestBody Map<String, Object> matrixRequest) {
        return planningService.runKuziack(matrixRequest);
    }

    @PostMapping("/king")
    public KingResponse runKing(@RequestBody MatrixRequest request) {
        return planningService.runKing(request);
    }

    @PostMapping("/rangs-moyens")
    public Map<String, Object> analyseRangsMoyens(@RequestBody Map<String, Map<String, Integer>> gammes) {
        return planningService.analyseRangsMoyens(gammes);
    }
} 