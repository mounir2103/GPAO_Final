package com.solution.tp_gpao.productionPlanning;

import com.solution.tp_gpao.articles.ArticleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductMachineOperationRepository extends JpaRepository<ProductMachineOperation, Long> {
    List<ProductMachineOperation> findByArticle(ArticleEntity article);
    List<ProductMachineOperation> findByMachine(MachineEntity machine);
} 