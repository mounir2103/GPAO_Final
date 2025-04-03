
import { Article, Stock, CBNCalculation, CBNPeriod, PlanningPeriod } from './types';

// Fonction pour calculer les besoins nets à partir des besoins bruts
export const calculateCBN = (
  article: Article,
  periods: PlanningPeriod[],
  initialStock: number,
  grossRequirements: Record<number, number>,
  scheduledReceipts: Record<number, number>
): CBNCalculation => {
  const cbnPeriods: CBNPeriod[] = [];
  let projectedInventory = initialStock;

  // Pour chaque période, calculer les besoins nets
  periods.forEach((period) => {
    const periodId = period.id;
    const grossRequirement = grossRequirements[periodId] || 0;
    const receipt = scheduledReceipts[periodId] || 0;

    // Calcul du stock prévisionnel
    projectedInventory = projectedInventory - grossRequirement + receipt;

    // Calcul des besoins nets
    const netRequirement = projectedInventory < article.stockSecurity 
      ? article.stockSecurity - projectedInventory 
      : 0;

    // Calcul des ordres planifiés (avec taille de lot)
    const plannedOrder = netRequirement > 0 
      ? Math.ceil(netRequirement / article.lotSize) * article.lotSize 
      : 0;

    // Mise à jour du stock prévisionnel avec les ordres planifiés
    if (plannedOrder > 0) {
      projectedInventory += plannedOrder;
    }

    // Calcul des lancements d'ordres planifiés (décalés du délai d'obtention)
    const plannedOrderReleasePeriodId = Math.max(1, periodId - article.leadTime);

    cbnPeriods.push({
      periodId,
      periodName: period.name,
      grossRequirements: grossRequirement,
      scheduledReceipts: receipt,
      projectedInventory,
      netRequirements: netRequirement,
      plannedOrders: plannedOrder,
      plannedOrderReleases: plannedOrder > 0 ? plannedOrder : 0
    });
  });

  return {
    articleId: article.id,
    periods: cbnPeriods
  };
};

// Fonction pour mettre à jour les besoins bruts des composants à partir des ordres planifiés
export const updateComponentRequirements = (
  parentPlannedOrders: Record<number, number>,
  component: { articleId: string; quantity: number }
): Record<number, number> => {
  const componentRequirements: Record<number, number> = {};
  
  for (const [periodId, quantity] of Object.entries(parentPlannedOrders)) {
    componentRequirements[Number(periodId)] = quantity * component.quantity;
  }
  
  return componentRequirements;
};

// Fonction pour fusionner les besoins bruts venant de différentes sources
export const mergeRequirements = (
  requirements: Record<number, number>[]
): Record<number, number> => {
  const mergedRequirements: Record<number, number> = {};
  
  requirements.forEach((req) => {
    for (const [periodId, quantity] of Object.entries(req)) {
      const period = Number(periodId);
      if (!mergedRequirements[period]) {
        mergedRequirements[period] = 0;
      }
      mergedRequirements[period] += quantity;
    }
  });
  
  return mergedRequirements;
};

// Fonction pour obtenir la disponibilité de stock actuelle
export const getCurrentStock = (
  articleId: string,
  stocks: Stock[]
): number => {
  const articleStock = stocks.find((s) => s.articleId === articleId);
  return articleStock ? articleStock.available : 0;
};
