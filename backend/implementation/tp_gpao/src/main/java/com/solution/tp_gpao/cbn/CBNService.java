package com.solution.tp_gpao.cbn;

import com.solution.tp_gpao.articles.ArticleEntity;
import com.solution.tp_gpao.articles.ArticleRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CBNService {
    private final CBNRepository cbnRepository;
    private final ArticleRepo articleRepo;

    public List<CBNEntity> getCBNForArticle(Long articleId) {
        ArticleEntity article = articleRepo.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        return cbnRepository.findByArticleOrderByPeriodId(article);
    }

    @Transactional
    public List<CBNEntity> calculateCBN(Long articleId, List<CBNPeriodRequest> periods) {
        ArticleEntity article = articleRepo.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        // Delete existing CBN calculations for this article
        cbnRepository.deleteByArticle(article);

        // Create a mutable state object to track inventory
        class CBNState {
            int projectedInventory;
            int previousPeriodPlannedOrderReleases;

            CBNState(int initialInventory) {
                this.projectedInventory = initialInventory;
                this.previousPeriodPlannedOrderReleases = 0;
            }
        }

        // Initialize with safety stock as initial inventory
        CBNState state = new CBNState(article.getSafetyStock());

        // Create new CBN calculations for each period
        List<CBNEntity> cbnCalculations = periods.stream()
                .map(period -> {
                    // 1. Get gross requirements (besoins bruts) from the request
                    int grossRequirements = period.getGrossRequirements();
                    
                    // 2. Get scheduled receipts
                    int scheduledReceipts = period.getScheduledReceipts();
                    
                    // 3. Calculate projected inventory
                    // Projected Inventory = Previous Period Inventory + Scheduled Receipts + Previous Period Planned Order Releases - Gross Requirements
                    state.projectedInventory = state.projectedInventory + scheduledReceipts + state.previousPeriodPlannedOrderReleases - grossRequirements;
                    
                    // 4. Calculate net requirements (besoins nets)
                    // Net Requirements = Max(0, Gross Requirements - Projected Inventory - Scheduled Receipts)
                    // If projected inventory is negative, we need to account for that in net requirements
                    int netRequirements;
                    if (state.projectedInventory < 0) {
                        netRequirements = Math.abs(state.projectedInventory);
                        state.projectedInventory = 0; // Reset projected inventory to 0
                    } else {
                        netRequirements = 0;
                    }
                    
                    // 5. Calculate planned orders using lot size
                    // Round up to the nearest lot size
                    int plannedOrders = 0;
                    if (netRequirements > 0) {
                        int lotsNeeded = (int) Math.ceil((double) netRequirements / article.getLotSize());
                        plannedOrders = lotsNeeded * article.getLotSize();
                        
                        // Update projected inventory with the planned orders
                        state.projectedInventory += plannedOrders;
                    }
                    
                    // 6. Calculate planned order releases considering lead time
                    // For now, we'll use the same value as planned orders
                    // In a more complex system, this would be offset by the lead time
                    int plannedOrderReleases = plannedOrders;
                    state.previousPeriodPlannedOrderReleases = plannedOrderReleases;

                    return CBNEntity.builder()
                            .article(article)
                            .periodId(period.getPeriodId())
                            .periodName("Period " + period.getPeriodId())
                            .grossRequirements(grossRequirements)
                            .scheduledReceipts(scheduledReceipts)
                            .projectedInventory(state.projectedInventory)
                            .netRequirements(netRequirements)
                            .plannedOrders(plannedOrders)
                            .plannedOrderReleases(plannedOrderReleases)
                            .build();
                })
                .collect(Collectors.toList());

        return cbnRepository.saveAll(cbnCalculations);
    }
} 