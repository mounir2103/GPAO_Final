
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Article, CBNCalculation, PlanningPeriod } from "@/lib/types";

interface CBNChartProps {
  data: CBNCalculation;
  periods: PlanningPeriod[];
  article: Article;
  showStockSecurity?: boolean;
  showTrend?: boolean;
}

export function CBNChart({
  data,
  periods,
  article,
  showStockSecurity = true,
  showTrend = true,
}: CBNChartProps) {
  // Préparation des données pour le graphique
  const chartData = data.periods.map((period) => {
    const periodData = periods.find((p) => p.id === period.periodId);
    return {
      name: periodData?.name || `Période ${period.periodId}`,
      "Besoins bruts": period.grossRequirements,
      "Besoins nets": period.netRequirements > 0 ? period.netRequirements : 0,
      "Stock prévisionnel": period.projectedInventory,
      "Ordres planifiés": period.plannedOrders > 0 ? period.plannedOrders : 0,
      "Stock sécurité": article.stockSecurity,
    };
  });

  // Calculer des statistiques pour le graphique de tendance
  const totalDemand = data.periods.reduce(
    (sum, period) => sum + period.grossRequirements,
    0
  );
  const totalPlannedOrders = data.periods.reduce(
    (sum, period) => sum + period.plannedOrders,
    0
  );
  const avgInventory =
    data.periods.reduce((sum, period) => sum + period.projectedInventory, 0) /
    data.periods.length;

  return (
    <div className="space-y-8">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Graphique CBN - {article.code} - {article.name}</CardTitle>
          <CardDescription>
            Visualisation graphique des besoins et du stock prévisionnel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                
                <Line
                  type="monotone"
                  dataKey="Besoins bruts"
                  stroke="#f97316"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Besoins nets"
                  stroke="#e11d48"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Stock prévisionnel"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Ordres planifiés"
                  stroke="#16a34a"
                  strokeWidth={2}
                />
                
                {showStockSecurity && (
                  <ReferenceLine
                    y={article.stockSecurity}
                    label="Stock sécu."
                    stroke="red"
                    strokeDasharray="3 3"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {showTrend && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Demande totale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDemand} {article.unit}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Ordres planifiés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPlannedOrders} {article.unit}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Stock moyen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgInventory.toFixed(1)} {article.unit}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
