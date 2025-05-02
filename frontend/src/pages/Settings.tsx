import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Types pour les paramètres
interface UnitOption {
  id: string;
  name: string;
  symbol: string;
  type: "weight" | "length" | "volume" | "unit";
}

interface PlanningHorizon {
  days: number;
  periodType: "day" | "week" | "month";
  periodCount: number;
}

interface CalculationSettings {
  considerStockSecurity: boolean;
  applyRoundingRules: boolean;
  checkComponentAvailability: boolean;
  automaticOrderProposal: boolean;
}

const SettingsPage = () => {
  // État pour les unités
  const [units, setUnits] = useState<UnitOption[]>([
    { id: "1", name: "Kilogramme", symbol: "kg", type: "weight" },
    { id: "2", name: "Gramme", symbol: "g", type: "weight" },
    { id: "3", name: "Mètre", symbol: "m", type: "length" },
    { id: "4", name: "Centimètre", symbol: "cm", type: "length" },
    { id: "5", name: "Litre", symbol: "L", type: "volume" },
    { id: "6", name: "Millilitre", symbol: "mL", type: "volume" },
    { id: "7", name: "Pièce", symbol: "pcs", type: "unit" },
    { id: "8", name: "Lot", symbol: "lot", type: "unit" },
    { id: "9", name: "Boîte", symbol: "bte", type: "unit" }
  ]);

  // État pour le nouvel ajout d'unité
  const [newUnit, setNewUnit] = useState<Partial<UnitOption>>({
    name: "",
    symbol: "",
    type: "unit"
  });

  // État pour l'horizon de planification
  const [planningHorizon, setPlanningHorizon] = useState<PlanningHorizon>({
    days: 60,
    periodType: "week",
    periodCount: 8
  });

  // État pour les paramètres de calcul
  const [calculationSettings, setCalculationSettings] = useState<CalculationSettings>({
    considerStockSecurity: true,
    applyRoundingRules: true,
    checkComponentAvailability: true,
    automaticOrderProposal: false
  });

  // Fonction pour ajouter une unité
  const handleAddUnit = () => {
    if (!newUnit.name || !newUnit.symbol || !newUnit.type) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const unitToAdd: UnitOption = {
      id: `${units.length + 1}`,
      name: newUnit.name,
      symbol: newUnit.symbol,
      type: newUnit.type as "weight" | "length" | "volume" | "unit"
    };

    setUnits([...units, unitToAdd]);
    setNewUnit({ name: "", symbol: "", type: "unit" });
    toast.success(`Unité ${unitToAdd.name} ajoutée`);
  };

  // Fonction pour supprimer une unité
  const handleDeleteUnit = (id: string) => {
    setUnits(units.filter(unit => unit.id !== id));
    toast.success("Unité supprimée");
  };

  // Fonction pour mettre à jour l'horizon de planification
  const handleUpdateHorizon = () => {
    toast.success("Horizon de planification mis à jour");
  };

  // Fonction pour mettre à jour les paramètres de calcul
  const handleUpdateCalculationSettings = () => {
    toast.success("Paramètres de calcul mis à jour");
  };

  // Fonction pour mettre à jour un paramètre de calcul
  const handleCalculationSettingChange = (setting: keyof CalculationSettings, value: boolean) => {
    setCalculationSettings({
      ...calculationSettings,
      [setting]: value
    });
  };

  return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">
            Configuration du système de gestion de production
          </p>
        </div>

        <Tabs defaultValue="units" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="units">Unités</TabsTrigger>
            <TabsTrigger value="planning">Planification</TabsTrigger>
            <TabsTrigger value="calculation">Calculs</TabsTrigger>
          </TabsList>

          {/* Onglet des unités */}
          <TabsContent value="units">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="shadow-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle>Unités de mesure</CardTitle>
                  <CardDescription>
                    Gérez les unités de mesure utilisées dans le système
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Symbole</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {units.map((unit) => (
                          <TableRow key={unit.id}>
                            <TableCell>{unit.name}</TableCell>
                            <TableCell>{unit.symbol}</TableCell>
                            <TableCell>
                              {unit.type === "weight" && "Poids"}
                              {unit.type === "length" && "Longueur"}
                              {unit.type === "volume" && "Volume"}
                              {unit.type === "unit" && "Unité"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteUnit(unit.id)}
                              >
                                Supprimer
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Ajouter une unité</CardTitle>
                  <CardDescription>
                    Créez une nouvelle unité de mesure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitName">Nom</Label>
                    <Input
                      id="unitName"
                      value={newUnit.name}
                      onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitSymbol">Symbole</Label>
                    <Input
                      id="unitSymbol"
                      value={newUnit.symbol}
                      onChange={(e) => setNewUnit({ ...newUnit, symbol: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitType">Type</Label>
                    <Select
                      value={newUnit.type}
                      onValueChange={(value) => setNewUnit({ ...newUnit, type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type d'unité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight">Poids</SelectItem>
                        <SelectItem value="length">Longueur</SelectItem>
                        <SelectItem value="volume">Volume</SelectItem>
                        <SelectItem value="unit">Unité</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full mt-2" onClick={handleAddUnit}>
                    Ajouter l'unité
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet de planification */}
          <TabsContent value="planning">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Horizon de planification</CardTitle>
                <CardDescription>
                  Configurez l'horizon de planification pour les calculs CBN
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="horizonDays">Nombre de jours</Label>
                    <Input
                      id="horizonDays"
                      type="number"
                      min="1"
                      value={planningHorizon.days}
                      onChange={(e) => setPlanningHorizon({ ...planningHorizon, days: Number(e.target.value) })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="periodType">Type de période</Label>
                    <Select
                      value={planningHorizon.periodType}
                      onValueChange={(value) => setPlanningHorizon({ ...planningHorizon, periodType: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type de période" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Jour</SelectItem>
                        <SelectItem value="week">Semaine</SelectItem>
                        <SelectItem value="month">Mois</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="periodCount">Nombre de périodes</Label>
                    <Input
                      id="periodCount"
                      type="number"
                      min="1"
                      value={planningHorizon.periodCount}
                      onChange={(e) => setPlanningHorizon({ ...planningHorizon, periodCount: Number(e.target.value) })}
                    />
                  </div>
                </div>
                
                <div className="bg-secondary p-4 rounded-md">
                  <h3 className="font-medium mb-2">Aperçu</h3>
                  <p>
                    L'horizon de planification sera de {planningHorizon.days} jours, découpé en {planningHorizon.periodCount}{' '}
                    {planningHorizon.periodType === "day" ? "jours" : 
                     planningHorizon.periodType === "week" ? "semaines" : "mois"}.
                  </p>
                </div>
                
                <Button onClick={handleUpdateHorizon}>
                  Mettre à jour
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet des paramètres de calcul */}
          <TabsContent value="calculation">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Paramètres de calcul</CardTitle>
                <CardDescription>
                  Configurez les règles utilisées pour le calcul des besoins nets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Prise en compte du stock de sécurité</h4>
                      <p className="text-muted-foreground text-sm">
                        Le calcul CBN considérera le stock de sécurité pour déterminer les besoins nets
                      </p>
                    </div>
                    <Switch
                      checked={calculationSettings.considerStockSecurity}
                      onCheckedChange={(value) => handleCalculationSettingChange("considerStockSecurity", value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Application des règles d'arrondi</h4>
                      <p className="text-muted-foreground text-sm">
                        Les quantités seront arrondies selon les règles de taille de lot
                      </p>
                    </div>
                    <Switch
                      checked={calculationSettings.applyRoundingRules}
                      onCheckedChange={(value) => handleCalculationSettingChange("applyRoundingRules", value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Vérification de disponibilité des composants</h4>
                      <p className="text-muted-foreground text-sm">
                        Vérifier la disponibilité des composants pour les produits finis
                      </p>
                    </div>
                    <Switch
                      checked={calculationSettings.checkComponentAvailability}
                      onCheckedChange={(value) => handleCalculationSettingChange("checkComponentAvailability", value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Proposition automatique d'ordres</h4>
                      <p className="text-muted-foreground text-sm">
                        Création automatique des propositions d'ordres d'approvisionnement
                      </p>
                    </div>
                    <Switch
                      checked={calculationSettings.automaticOrderProposal}
                      onCheckedChange={(value) => handleCalculationSettingChange("automaticOrderProposal", value)}
                    />
                  </div>
                </div>
                
                <Button onClick={handleUpdateCalculationSettings}>
                  Enregistrer les paramètres
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default SettingsPage;
