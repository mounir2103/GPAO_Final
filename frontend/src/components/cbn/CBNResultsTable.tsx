import React from "react";

// Définition des interfaces directement dans le composant
interface CBNPeriod {
  grossRequirements: number;
  plannedOrderReceipts: number;
  projectedInventory: number;
}

interface Article {
  leadTime: number;
}

interface CBNResultsTableProps {
  data: CBNPeriod[];
  article: Article;
}

export function CBNResultsTable({ data, article }: CBNResultsTableProps) {
  const BB = data.map((p) => p.grossRequirements);
  const OP = data.map((p) => p.plannedOrderReceipts);
  const SP = data.map((p) => p.projectedInventory);
  
  // Calcul des Lancements d'Ordres Planifiés (OL) avec décalage selon le délai d'obtention
  const leadTime = Math.max(1, Math.ceil(article.leadTime / 7));
  const OL = Array(data.length).fill("");
  
  // On place les lancements d'ordres planifiés au moment où ils doivent être lancés
  // c'est-à-dire "leadTime" périodes avant la réception prévue
  for (let i = leadTime; i < data.length; i++) {
    if (OP[i] > 0) {
      OL[i - leadTime] = OP[i];
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border border-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Article PF</th>
            {data.map((_, i) => (
              <th key={i} className="px-4 py-2 border">{i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-2 border font-medium">Besoin brut (BB)</td>
            {BB.map((v, i) => (
              <td key={i} className="px-4 py-2 border text-center">{v}</td>
            ))}
          </tr>
          <tr>
            <td className="px-4 py-2 border font-medium">Lancements d'Ordres Planifiés (OL)</td>
            {OL.map((v, i) => (
              <td key={i} className="px-4 py-2 border text-center">{v ? v : ""}</td>
            ))}
          </tr>
          <tr>
            <td className="px-4 py-2 border font-medium">Stock prévisionnel (SP)</td>
            {SP.map((v, i) => (
              <td key={i} className="px-4 py-2 border text-center">{v}</td>
            ))}
          </tr>
          <tr>
            <td className="px-4 py-2 border font-medium">Ordres proposés (OP)</td>
            {OP.map((v, i) => (
              <td key={i} className="px-4 py-2 border text-center">{v > 0 ? v : ""}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}