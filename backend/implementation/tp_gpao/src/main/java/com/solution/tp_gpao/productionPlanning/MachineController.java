package com.solution.tp_gpao.productionPlanning;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/machines")
public class MachineController {
    @Autowired
    private MachineService machineService;

    @GetMapping
    public List<MachineEntity> getAllMachines() {
        return machineService.getAllMachines();
    }

    @PostMapping
    public MachineEntity createMachine(@RequestBody MachineEntity machine) {
        return machineService.createMachine(machine);
    }

    @PutMapping("/{id}")
    public MachineEntity updateMachine(@PathVariable Long id, @RequestBody MachineEntity machine) {
        return machineService.updateMachine(id, machine);
    }

    @DeleteMapping("/{id}")
    public void deleteMachine(@PathVariable Long id) {
        machineService.deleteMachine(id);
    }
} 