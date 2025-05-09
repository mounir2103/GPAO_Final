import { Article, Stock, CBNCalculation, CBNPeriod, PlanningPeriod } from './types';

// Fonction pour calculer les besoins nets à partir des besoins bruts
export const calculateCBN = (
  article: Article,
  periods: PlanningPeriod[],
  initialStock: number,
  grossRequirements: Record<number, number>,
  scheduledReceipts: Record<number, number>,
  options?: {
    considerLeadTime?: boolean;
    roundToLotSize?: boolean;
  }
): CBNCalculation => {
  const cbnPeriods: CBNPeriod[] = [];
  let projectedInventories: number[] = [];
  projectedInventories[0] = initialStock;
  
  const useLeadTime = options?.considerLeadTime !== false;
  const useRoundToLot = options?.roundToLotSize !== false;

  // Calculer le délai d'approvisionnement en nombre de périodes
  const leadTimeInPeriods = useLeadTime ? Math.ceil(article.leadTime / 7) : 0; // Approximation en supposant que les périodes sont des semaines
  
  // Calculer un tableau de correspondance des ordres planifiés avec décalage
  const plannedOrderReleases: Record<number, number> = {};
  const plannedOrderReceipts: Record<number, number> = {};
  
  let stock = initialStock;
  for (let i = 0; i < periods.length; i++) {
    const periodId = periods[i].periodId;
    const grossRequirement = grossRequirements[periodId] || 0;
    const receipt = scheduledReceipts[periodId] || 0;
    const plannedReceipt = plannedOrderReceipts[periodId] || 0;
    // 1. Calcul du stock prévisionnel (avant besoin brut)
    stock = stock + receipt + plannedReceipt;
    // 2. Calcul du stock prévisionnel après besoin brut
    stock = stock - grossRequirement;
    let netRequirement = 0;
    let plannedOrder = 0;
    // 3. Si le stock prévisionnel est négatif, planifier un ordre
    if (stock < 0) {
      netRequirement = -stock;
      if (useRoundToLot && article.lotSize > 1) {
        netRequirement = Math.ceil(netRequirement / article.lotSize) * article.lotSize;
      }
      plannedOrder = netRequirement;
      // Lancer l'ordre à la période courante (OL)
      plannedOrderReleases[periodId] = plannedOrder;
      // Réception à la période courante + délai (OP)
      const receiptIndex = i + leadTimeInPeriods;
      if (receiptIndex < periods.length) {
        const receiptPeriodId = periods[receiptIndex].periodId;
        plannedOrderReceipts[receiptPeriodId] = (plannedOrderReceipts[receiptPeriodId] || 0) + plannedOrder;
      }
      // Mettre à jour le stock prévisionnel avec la réception future
      stock += plannedOrder;
    }
    cbnPeriods.push({
      periodId,
      periodName: periods[i].periodName,
      grossRequirements: grossRequirement,
      scheduledReceipts: receipt,
      projectedInventory: stock,
      netRequirements: netRequirement,
      plannedOrders: plannedOrder,
      plannedOrderReleases: plannedOrderReleases[periodId] || 0,
      plannedOrderReceipts: plannedOrderReceipts[periodId] || 0
    });
  }

  return {
    articleId: article.articleId,
    periods: cbnPeriods
  };
};

// Fonction pour mettre à jour les besoins bruts des composants à partir des ordres planifiés
export const updateComponentRequirements = (
  parentPlannedOrders: Record<number, number>,
  component: { articleId: number; quantity: number }
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
  articleId: number,
  stocks: Stock[]
): number => {
  const articleStock = stocks.find((s) => s.articleId === articleId);
  return articleStock ? articleStock.quantity : 0;
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
  results[article.articleId.toString()] = mainResult;
  
  // Si l'article a des composants, calculer leurs besoins
  if (article.bomEntries && article.bomEntries.length > 0) {
    article.bomEntries.forEach(component => {
      // Trouver l'article composant correspondant
      const componentArticle = articles.find(a => a.articleId === component.articleId);
      if (componentArticle) {
        // Calculer les besoins bruts du composant basés sur les ordres planifiés de l'article parent
        const componentGrossRequirements: Record<number, number> = {};
        mainResult.periods.forEach(period => {
          if (period.plannedOrders > 0) {
            componentGrossRequirements[period.periodId] = period.plannedOrders * component.quantity;
          }
        });
        
        // Obtenir le stock initial du composant
        const componentInitialStock = getCurrentStock(componentArticle.articleId, stocks);
        
        // Calculer le CBN pour le composant
        const componentResult = calculateCBN(
          componentArticle,
          periods,
          componentInitialStock,
          componentGrossRequirements,
          {} // Pour simplifier, pas de réceptions programmées pour les composants
        );
        
        results[componentArticle.articleId.toString()] = componentResult;
        
        // Récursion pour les sous-composants
        if (componentArticle.bomEntries && componentArticle.bomEntries.length > 0) {
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
            if (subComponentId !== componentArticle.articleId.toString()) {
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
    const periodDemand = demand[period.periodId] || 0;
    const periodReceipts = plannedReceipts[period.periodId] || 0;
    
    stock = stock - periodDemand + periodReceipts;
    forecast[period.periodId] = stock;
  });

  return forecast;
};

// Fonction pour convertir des données en format adapté pour les graphiques
export const formatDataForChart = (
  cbnResult: CBNCalculation,
  periods: PlanningPeriod[]
) => {
  return cbnResult.periods.map(period => {
    const periodData = periods.find(p => p.periodId === period.periodId);
    return {
      name: periodData?.periodName || `Période ${period.periodId}`,
      grossRequirements: period.grossRequirements,
      netRequirements: period.netRequirements,
      projectedInventory: period.projectedInventory,
      plannedOrders: period.plannedOrders,
      safetyStock: null // Pour tracer une ligne horizontale du stock de sécurité
    };
  });
};

// Ajout de la fonction kuziackMethod en TypeScript
export function kuziackMethod(
  matrix: number[][],
  products: Array<{ id: number; name: string }>,
  machines: Array<{ id: number; name: string }>,
  startIndex: number = 0
): Array<{ step: number; products: Array<{ id: number; name: string; index: number }>; machines: Array<{ id: number; name: string; index: number }>; submatrix: number[][] }> {
  const nProducts = matrix.length;
  const nMachines = matrix[0].length;
  const productNames = products.map(p => p.name);
  const machineNames = machines.map(m => m.name);

  if (startIndex < 0 || startIndex >= nProducts) startIndex = 0;

  const cells: Array<{ step: number; products: Array<{ id: number; name: string; index: number }>; machines: Array<{ id: number; name: string; index: number }>; submatrix: number[][] }> = [];
  let remainingProducts = Array.from({ length: nProducts }, (_, i) => i);
  let remainingMachines = Array.from({ length: nMachines }, (_, j) => j);
  let step = 1;

  while (remainingProducts.length > 0) {
    const currentIlotProducts = new Set<number>();
    const currentIlotMachines = new Set<number>();

    // Étape 2 : Sélectionner une ligne (la première restante ou startIndex)
    const p0 = remainingProducts.includes(startIndex) ? startIndex : remainingProducts[0];
    currentIlotProducts.add(p0);
    // Machines associées au produit initial
    for (let m = 0; m < nMachines; m++) {
      if (matrix[p0][m] === 1) {
        currentIlotMachines.add(m);
      }
    }

    let updated = true;
    while (updated) {
      updated = false;
      // Étape 3 : Ajouter produits dont ≥50% machines dans l'îlot
      for (const p of [...remainingProducts]) {
        if (currentIlotProducts.has(p)) continue;
        const machinesUsed = new Set<number>();
        for (let m = 0; m < nMachines; m++) {
          if (matrix[p][m] === 1) machinesUsed.add(m);
        }
        if (machinesUsed.size === 0) continue;
        const overlap = new Set([...machinesUsed].filter(m => currentIlotMachines.has(m)));
        if (overlap.size >= 0.5 * machinesUsed.size) {
          currentIlotProducts.add(p);
          updated = true;
        }
      }
      // Étape 4 : Ajouter machines dont ≥50% produits dans l'îlot
      for (const m of [...remainingMachines]) {
        if (currentIlotMachines.has(m)) continue;
        const productsUsing = new Set<number>();
        for (let p = 0; p < nProducts; p++) {
          if (matrix[p][m] === 1) productsUsing.add(p);
        }
        if (productsUsing.size === 0) continue;
        const overlap = new Set([...productsUsing].filter(p => currentIlotProducts.has(p)));
        if (overlap.size >= 0.5 * productsUsing.size) {
          currentIlotMachines.add(m);
          updated = true;
        }
      }
    }
    // Affichage de l'îlot trouvé (ici, on prépare la structure de retour)
    const selectedProducts = [...currentIlotProducts].sort((a, b) => a - b);
    const selectedMachines = [...currentIlotMachines].sort((a, b) => a - b);
    // Sous-matrice de l'îlot
    const submatrix = selectedProducts.map(p => selectedMachines.map(m => matrix[p][m]));
    // Préparer les infos produits/machines
    const cellProducts = selectedProducts.map(p => ({
      id: products[p].id,
      name: productNames[p],
      index: p
    }));
    const cellMachines = selectedMachines.map(m => ({
      id: machines[m].id,
      name: machineNames[m],
      index: m
    }));
    cells.push({
      step,
      products: cellProducts,
      machines: cellMachines,
      submatrix
    });
    // Étape 6 : Retirer l'îlot
    remainingProducts = remainingProducts.filter(p => !currentIlotProducts.has(p));
    remainingMachines = remainingMachines.filter(m => !currentIlotMachines.has(m));
    step++;
  }
  return cells;
}
