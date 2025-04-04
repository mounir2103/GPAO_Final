
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateCBN, formatDataForChart } from "@/lib/gpao-utils";
import { Article, CBNCalculation, CBNPeriod, PlanningPeriod } from "@/lib/types";
import { toast } from "sonner";
import { Calculator, Download, Save } from "lucide-react";
import { CBNResultsTable } from "@/components/cbn/CBNResultsTable";
import { CBNChart } from "@/components/cbn/CBNChart";

// Données fictives pour la démo
const mockArticles: Article[] = [
  {
    id: "1",
    code: "MP001",
    name: "Aluminium 6061",
    type: "raw",
    unit: "kg",
    stockSecurity: 100,
    leadTime: 7,
    lotSize: 250,
    price: 3.5,
    articleDescription: "Alliage d'aluminium de haute qualité pour l'industrie",
    TVA: 20,
    fournisseur: "MetalPro Industries",
    status: "active",
    isArticleAchete: true,
    isArticleFabrique: false
  },
  {
    id: "4",
    code: "PF001",
    name: "Capteur de pression",
    type: "finished",
    unit: "pcs",
    stockSecurity: 20,
    leadTime: 3,
    lotSize: 50,
    price: 78.5,
    articleDescription: "Capteur de pression haute précision",
    TVA: 20,
    fournisseur: null,
    status: "active",
    isArticleFabrique: true,
    isArticleAchete: false,
    components: [
      { articleId: "1", articleCode: "MP001", articleName: "Aluminium 6061", quantity: 0.5 },
      { articleId: "3", articleCode: "COMP001", articleName: "Carte électronique type A", quantity: 1 }
    ]
  },
  {
    id: "5",
    code: "PF002",
    name: "Module de contrôle",
    type: "finished",
    unit: "pcs",
    stockSecurity: 15,
    leadTime: 5,
    lotSize: 30,
    price: 125,
    articleDescription: "Module de contrôle pour systèmes industriels",
    TVA: 20,
    fournisseur: null,
    status: "active",
    isArticleFabrique: true,
    isArticleAchete: false,
    components: [
      { articleId: "2", articleCode: "MP002", articleName: "Acier S235", quantity: 1.2 },
      { articleId: "3", articleCode: "COMP001", articleName: "Carte électronique type A", quantity: 2 }
    ]
  }
];

const mockPeriods: PlanningPeriod[] = [
  { id: 1, name: "Semaine 1", startDate: new Date(2023, 0, 1), endDate: new Date(2023, 0, 7) },
  { id: 2, name: "Semaine 2", startDate: new Date(2023, 0, 8), endDate: new Date(2023, 0, 14) },
  { id: 3, name: "Semaine 3", startDate: new Date(2023, 0, 15), endDate: new Date(2023, 0, 21) },
  { id: 4, name: "Semaine 4", startDate: new Date(2023, 0, 22), endDate: new Date(2023, 0, 28) },
  { id: 5, name: "Semaine 5", startDate: new Date(2023, 0, 29), endDate: new Date(2023, 1, 4) },
  { id: 6, name: "Semaine 6", startDate: new Date(2023, 1, 5), endDate: new Date(2023, 1, 11) },
  { id: 7, name: "Semaine 7", startDate: new Date(2023, 1, 12), endDate: new Date(2023, 1, 18) },
  { id: 8, name: "Semaine 8", startDate: new Date(2023, 1, 19), endDate: new Date(2023, 1, 25) }
];

const CBNPage = () => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>("");
  const [initialStock, setInitialStock] = useState<number>(0);
  const [grossRequirements, setGrossRequirements] = useState<Record<number, number>>({});
  const [scheduledReceipts, setScheduledReceipts] = useState<Record<number, number>>({});
  const [cbnResult, setCbnResult] = useState<CBNCalculation | null>(null);
  const [considerLeadTime, setConsiderLeadTime] = useState<boolean>(true);
  const [roundToLotSize, setRoundToLotSize] = useState<boolean>(true);

  // Trouver l'article sélectionné
  const selectedArticle = mockArticles.find(article => article.id === selectedArticleId);

  // Pour générer des données tabulaires pour le CBN
  const tableData = React.useMemo(() => {
    if (!cbnResult || !selectedArticle) return [];
    
    return cbnResult.periods.map(period => {
      const periodData = mockPeriods.find(p => p.id === period.periodId);
      return {
        ...period,
        period: periodData?.name || `Période ${period.periodId}`,
      };
    });
  }, [cbnResult, selectedArticle]);

  // Fonction pour mettre à jour les besoins bruts
  const handleUpdateGrossRequirement = (periodId: number, value: number) => {
    const updatedRequirements = { ...grossRequirements, [periodId]: value };
    setGrossRequirements(updatedRequirements);
  };

  // Fonction pour mettre à jour les réceptions programmées
  const handleUpdateScheduledReceipt = (periodId: number, value: number) => {
    const updatedReceipts = { ...scheduledReceipts, [periodId]: value };
    setScheduledReceipts(updatedReceipts);
  };

  // Fonction pour pré-remplir les besoins avec des valeurs de test
  const handleFillTestData = () => {
    if (!selectedArticle) return;
    
    const testGrossRequirements: Record<number, number> = {
      1: 25,
      2: 40,
      3: 30,
      4: 50,
      5: 35,
      6: 45,
      7: 60,
      8: 20
    };
    
    const testScheduledReceipts: Record<number, number> = {
      1: 30,
      4: 40
    };
    
    setGrossRequirements(testGrossRequirements);
    setScheduledReceipts(testScheduledReceipts);
    toast.success("Données de test chargées");
  };

  // Fonction pour réinitialiser les données
  const handleResetData = () => {
    setGrossRequirements({});
    setScheduledReceipts({});
    setCbnResult(null);
    toast.info("Données réinitialisées");
  };

  // Fonction pour effectuer le calcul CBN
  const handleCalculateCBN = () => {
    if (!selectedArticle) {
      toast.error("Veuillez sélectionner un article");
      return;
    }

    const result = calculateCBN(
      selectedArticle,
      mockPeriods,
      initialStock,
      grossRequirements,
      scheduledReceipts,
      {
        considerLeadTime,
        roundToLotSize
      }
    );

    setCbnResult(result);
    toast.success("Calcul CBN effectué avec succès");
  };

  // Exporter les résultats au format CSV
  const handleExportCSV = () => {
    if (!cbnResult || !selectedArticle) {
      toast.error("Aucun résultat à exporter");
      return;
    }

    const headers = [
      "Période",
      "Besoins Bruts",
      "Réceptions Programmées",
      "Stock Prévisionnel",
      "Besoins Nets",
      "Ordres Planifiés",
      "Lancements"
    ];

    const rows = cbnResult.periods.map(period => {
      const periodData = mockPeriods.find(p => p.id === period.periodId);
      return [
        periodData?.name || `Période ${period.periodId}`,
        period.grossRequirements,
        period.scheduledReceipts,
        period.projectedInventory,
        period.netRequirements > 0 ? period.netRequirements : 0,
        period.plannedOrders > 0 ? period.plannedOrders : 0,
        period.plannedOrderReleases > 0 ? period.plannedOrderReleases : 0
      ];
    });

    const csvContent = [
      [`CBN pour ${selectedArticle.code} - ${selectedArticle.name}`],
      [`Date du calcul: ${new Date().toLocaleDateString()}`],
      [""],
      headers,
      ...rows
    ].map(row => row.join(";")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cbn_${selectedArticle.code}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Export CSV terminé");
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Calcul des Besoins Nets (CBN)</h1>
          <p className="text-muted-foreground">
            Planifiez votre production en calculant les besoins nets et les ordres de fabrication
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panneau de configuration */}
          <Card className="lg:col-span-1 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                <span>Paramètres de calcul</span>
              </CardTitle>
              <CardDescription>
                Sélectionnez un article et définissez les données d'entrée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="article">Article</Label>
                <Select value={selectedArticleId} onValueChange={setSelectedArticleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un article" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockArticles.map(article => (
                      <SelectItem key={article.id} value={article.id}>
                        {article.code} - {article.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedArticle && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="initialStock">Stock initial</Label>
                    <Input 
                      id="initialStock"
                      type="number"
                      value={initialStock}
                      onChange={(e) => setInitialStock(Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Stock de sécurité: {selectedArticle.stockSecurity} {selectedArticle.unit}</Label>
                    <Label>Délai d'obtention: {selectedArticle.leadTime} jours</Label>
                    <Label>Taille de lot: {selectedArticle.lotSize} {selectedArticle.unit}</Label>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t">
                    <Label>Options de calcul</Label>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="considerLeadTime" 
                        checked={considerLeadTime}
                        onCheckedChange={(checked) => setConsiderLeadTime(!!checked)} 
                      />
                      <Label htmlFor="considerLeadTime" className="font-normal cursor-pointer">
                        Considérer le délai d'obtention
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="roundToLotSize" 
                        checked={roundToLotSize}
                        onCheckedChange={(checked) => setRoundToLotSize(!!checked)} 
                      />
                      <Label htmlFor="roundToLotSize" className="font-normal cursor-pointer">
                        Arrondir à la taille de lot
                      </Label>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex flex-col w-full gap-2">
                <Button onClick={handleCalculateCBN} className="w-full">
                  Lancer le calcul CBN
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleFillTestData} className="flex-1">
                    Données test
                  </Button>
                  <Button variant="outline" onClick={handleResetData} className="flex-1">
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>

          {/* Tableau des périodes et données d'entrée */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>Données d'entrée par période</CardTitle>
              <CardDescription>
                Entrez les besoins bruts et réceptions programmées pour chaque période
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-2 text-left">Période</th>
                      <th className="p-2 text-left">Dates</th>
                      <th className="p-2 text-right">Besoins bruts</th>
                      <th className="p-2 text-right">Réceptions programmées</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mockPeriods.map((period) => (
                      <tr key={period.id} className="hover:bg-muted/20">
                        <td className="p-2 font-medium">{period.name}</td>
                        <td className="p-2">
                          {period.startDate.toLocaleDateString()} - {period.endDate.toLocaleDateString()}
                        </td>
                        <td className="p-2 text-right">
                          <Input
                            type="number"
                            min={0}
                            value={grossRequirements[period.id] || 0}
                            onChange={(e) => handleUpdateGrossRequirement(period.id, Number(e.target.value))}
                            className="w-24 ml-auto"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <Input
                            type="number"
                            min={0}
                            value={scheduledReceipts[period.id] || 0}
                            onChange={(e) => handleUpdateScheduledReceipt(period.id, Number(e.target.value))}
                            className="w-24 ml-auto"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Résultats du calcul CBN */}
        {cbnResult && selectedArticle && (
          <Tabs defaultValue="table" className="space-y-4">
            <TabsList>
              <TabsTrigger value="table">Tableau CBN</TabsTrigger>
              <TabsTrigger value="chart">Graphique</TabsTrigger>
              <TabsTrigger value="analysis">Analyse</TabsTrigger>
            </TabsList>

            <TabsContent value="table">
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>
                      Résultats du calcul CBN - {selectedArticle.code} - {selectedArticle.name}
                    </CardTitle>
                    <CardDescription>
                      Analyse des besoins nets et des ordres planifiés par période
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleExportCSV} className="gap-1">
                    <Download className="h-4 w-4" />
                    <span>Exporter</span>
                  </Button>
                </CardHeader>
                <CardContent>
                  <CBNResultsTable data={tableData} article={selectedArticle} />
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline">Imprimer</Button>
                  <Button>Créer les ordres</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="chart">
              <CBNChart 
                data={cbnResult} 
                periods={mockPeriods} 
                article={selectedArticle} 
              />
            </TabsContent>

            <TabsContent value="analysis">
              <Card>
                <CardHeader>
                  <CardTitle>Analyse détaillée</CardTitle>
                  <CardDescription>Analyse des résultats du calcul CBN</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-md p-4 space-y-2">
                      <h3 className="text-lg font-semibold">Demande totale</h3>
                      <p className="text-2xl font-bold">
                        {cbnResult.periods.reduce((sum, p) => sum + p.grossRequirements, 0)} {selectedArticle.unit}
                      </p>
                    </div>
                    
                    <div className="border rounded-md p-4 space-y-2">
                      <h3 className="text-lg font-semibold">Lancements</h3>
                      <p className="text-2xl font-bold">
                        {cbnResult.periods.reduce((sum, p) => sum + (p.plannedOrderReleases || 0), 0)} {selectedArticle.unit}
                      </p>
                    </div>
                    
                    <div className="border rounded-md p-4 space-y-2">
                      <h3 className="text-lg font-semibold">Stock final</h3>
                      <p className="text-2xl font-bold">
                        {cbnResult.periods[cbnResult.periods.length - 1]?.projectedInventory} {selectedArticle.unit}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 space-y-4">
                    <h3 className="text-lg font-semibold">Indicateurs clés</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium">Stock de sécurité</h4>
                        <p>{selectedArticle.stockSecurity} {selectedArticle.unit}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Stock moyen</h4>
                        <p>
                          {Math.round(cbnResult.periods.reduce((sum, p) => sum + p.projectedInventory, 0) / cbnResult.periods.length)} {selectedArticle.unit}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Périodes sous stock de sécurité</h4>
                        <p>
                          {cbnResult.periods.filter(p => p.projectedInventory < selectedArticle.stockSecurity).length} / {cbnResult.periods.length}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Périodes avec besoins nets</h4>
                        <p>
                          {cbnResult.periods.filter(p => p.netRequirements > 0).length} / {cbnResult.periods.length}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-semibold mb-4">Recommandations</h3>
                    
                    {cbnResult.periods.some(p => p.projectedInventory < 0) && (
                      <div className="bg-red-50 text-red-800 p-3 rounded-md mb-3">
                        ⚠️ Stock négatif détecté! Augmentez les réceptions programmées ou réduisez la demande.
                      </div>
                    )}
                    
                    {cbnResult.periods.every(p => p.projectedInventory > selectedArticle.stockSecurity * 2) && (
                      <div className="bg-amber-50 text-amber-800 p-3 rounded-md mb-3">
                        ℹ️ Stock prévisionnel constamment élevé. Vous pourriez réduire le stock de sécurité ou la taille des ordres.
                      </div>
                    )}
                    
                    {cbnResult.periods.filter(p => p.plannedOrders > 0).length > cbnResult.periods.length / 2 && (
                      <div className="bg-blue-50 text-blue-800 p-3 rounded-md">
                        ℹ️ Ordres fréquents détectés. Envisagez d'augmenter la taille de lot pour optimiser les coûts de lancement.
                      </div>
                    )}
                    
                    {cbnResult.periods.every(p => p.netRequirements === 0) && (
                      <div className="bg-green-50 text-green-800 p-3 rounded-md">
                        ✅ Aucun besoin net détecté. Les niveaux de stock sont satisfaisants pour toute la période.
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={handleExportCSV}>
                    <Download className="h-4 w-4 mr-2" /> 
                    Exporter l'analyse
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default CBNPage;
