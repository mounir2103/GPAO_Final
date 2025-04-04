
import { Article, Stock, CBNCalculation, CBNPeriod, PlanningPeriod } from './types';

// Fonction pour calculer les besoins nets à partir des besoins bruts
export const calculateCBN = (
  article: Article,
  periods: PlanningPeriod[],
  initialStock: number,
  grossRequirements: Record<number, number>,
  scheduledReceipts: Record<number, number>,
  options?: {
    considerLeadTime?: boolean; // Prendre en compte le délai d'obtention
    roundToLotSize?: boolean; // Arrondir à la taille de lot
  }
): CBNCalculation => {
  const cbnPeriods: CBNPeriod[] = [];
  let projectedInventory = initialStock;
  
  const useLeadTime = options?.considerLeadTime !== false;
  const useRoundToLot = options?.roundToLotSize !== false;

  // Calculer un tableau de correspondance des ordres planifiés avec décalage
  const plannedOrderReleases: Record<number, number> = {};
  
  // Pour chaque période, calculer les besoins nets
  periods.forEach((period) => {
    const periodId = period.id;
    const grossRequirement = grossRequirements[periodId] || 0;
    const receipt = scheduledReceipts[periodId] || 0;
    
    // Ajouter les lancements d'ordres planifiés des périodes précédentes
    const plannedOrdersReceipt = plannedOrderReleases[periodId] || 0;

    // Calcul du stock prévisionnel
    projectedInventory = projectedInventory - grossRequirement + receipt + plannedOrdersReceipt;

    // Calcul des besoins nets
    const netRequirement = projectedInventory < article.stockSecurity 
      ? article.stockSecurity - projectedInventory 
      : 0;

    // Calcul des ordres planifiés (avec taille de lot si option activée)
    let plannedOrder = 0;
    if (netRequirement > 0) {
      if (useRoundToLot && article.lotSize > 1) {
        plannedOrder = Math.ceil(netRequirement / article.lotSize) * article.lotSize;
      } else {
        plannedOrder = netRequirement;
      }
    }

    // Mise à jour du stock prévisionnel avec les ordres planifiés
    projectedInventory += plannedOrder;

    // Si on prend en compte le délai d'obtention
    let releasePeriodId = periodId;
    if (useLeadTime && article.leadTime > 0) {
      // Calculer la période de lancement en fonction du délai
      // On doit lancer l'ordre X périodes avant (où X est le délai d'obtention)
      const leadTimeInPeriods = Math.ceil(article.leadTime / 7); // Approximation en supposant que les périodes sont des semaines
      releasePeriodId = Math.max(1, periodId - leadTimeInPeriods);
    }

    // Enregistrer le lancement d'ordre dans la période correspondante
    if (plannedOrder > 0) {
      if (!plannedOrderReleases[releasePeriodId]) {
        plannedOrderReleases[releasePeriodId] = 0;
      }
      plannedOrderReleases[releasePeriodId] += plannedOrder;
    }

    cbnPeriods.push({
      periodId,
      periodName: period.name,
      grossRequirements: grossRequirement,
      scheduledReceipts: receipt,
      projectedInventory,
      netRequirements: netRequirement,
      plannedOrders: plannedOrder,
      plannedOrderReleases: releasePeriodId === periodId ? plannedOrder : 0
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

// Fonction pour calculer les besoins en cascade (MRP)
export const calculateMRP = (
  article: Article,
  periods: PlanningPeriod[],
  initialStock: number,
  grossRequirements: Record<number, number>,
  scheduledReceipts: Record<number, number>,
  articles: Article[],
  stocks: Stock[]
): Record<string, CBNCalculation> => {
  // Résultats pour chaque article (y compris les composants)
  const results: Record<string, CBNCalculation> = {};
  
  // Calculer le CBN pour l'article principal
  const mainResult = calculateCBN(
    article, 
    periods, 
    initialStock, 
    grossRequirements, 
    scheduledReceipts
  );
  results[article.id] = mainResult;
  
  // Si l'article a des composants, calculer leurs besoins
  if (article.components && article.components.length > 0) {
    article.components.forEach(component => {
      // Trouver l'article composant correspondant
      const componentArticle = articles.find(a => a.id === component.articleId);
      if (componentArticle) {
        // Calculer les besoins bruts du composant basés sur les ordres planifiés de l'article parent
        const componentGrossRequirements: Record<number, number> = {};
        mainResult.periods.forEach(period => {
          if (period.plannedOrders > 0) {
            componentGrossRequirements[period.periodId] = period.plannedOrders * component.quantity;
          }
        });
        
        // Obtenir le stock initial du composant
        const componentInitialStock = getCurrentStock(componentArticle.id, stocks);
        
        // Calculer le CBN pour le composant
        const componentResult = calculateCBN(
          componentArticle,
          periods,
          componentInitialStock,
          componentGrossRequirements,
          {} // Pour simplifier, pas de réceptions programmées pour les composants
        );
        
        results[componentArticle.id] = componentResult;
        
        // Récursion pour les sous-composants
        if (componentArticle.components && componentArticle.components.length > 0) {
          const subComponents = calculateMRP(
            componentArticle,
            periods,
            componentInitialStock,
            componentGrossRequirements,
            {},
            articles,
            stocks
          );
          
          // Fusionner les résultats
          Object.entries(subComponents).forEach(([subComponentId, subResult]) => {
            if (subComponentId !== componentArticle.id) {
              results[subComponentId] = subResult;
            }
          });
        }
      }
    });
  }
  
  return results;
};

// Fonction pour prévoir les stocks sur une période donnée
export const forecastInventory = (
  article: Article,
  currentStock: number,
  periods: PlanningPeriod[],
  demand: Record<number, number>,
  plannedReceipts: Record<number, number>
): Record<number, number> => {
  const forecast: Record<number, number> = {};
  let stock = currentStock;

  periods.forEach((period) => {
    const periodDemand = demand[period.id] || 0;
    const periodReceipts = plannedReceipts[period.id] || 0;
    
    stock = stock - periodDemand + periodReceipts;
    forecast[period.id] = stock;
  });

  return forecast;
};

// Fonction pour convertir des données en format adapté pour les graphiques
export const formatDataForChart = (
  cbnResult: CBNCalculation,
  periods: PlanningPeriod[]
) => {
  return cbnResult.periods.map(period => {
    const periodData = periods.find(p => p.id === period.periodId);
    return {
      name: periodData?.name || `Période ${period.periodId}`,
      grossRequirements: period.grossRequirements,
      netRequirements: period.netRequirements,
      projectedInventory: period.projectedInventory,
      plannedOrders: period.plannedOrders,
      safetyStock: null // Pour tracer une ligne horizontale du stock de sécurité
    };
  });
};
