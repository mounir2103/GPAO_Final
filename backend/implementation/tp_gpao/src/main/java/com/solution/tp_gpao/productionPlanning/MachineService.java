package com.solution.tp_gpao.productionPlanning;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MachineService {
    @Autowired
    private MachineRepository machineRepository;

    public List<MachineEntity> getAllMachines() {
        return machineRepository.findAll();
    }

    public MachineEntity createMachine(MachineEntity machine) {
        return machineRepository.save(machine);
    }

    public MachineEntity updateMachine(Long id, MachineEntity machine) {
        machine.setId(id);
        return machineRepository.save(machine);
    }

    public void deleteMachine(Long id) {
        machineRepository.deleteById(id);
    }
} 