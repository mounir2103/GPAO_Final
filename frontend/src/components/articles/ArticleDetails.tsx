import { Article } from "@/lib/types";

type ArticleStatus = "RAW_MATERIAL" | "FINISHED";

const statusLabels: Record<ArticleStatus, string> = {
  RAW_MATERIAL: "Matière première",
  FINISHED: "Produit fini",
};

const statusClasses: Record<ArticleStatus, string> = {
  RAW_MATERIAL: "bg-blue-100 text-blue-800",
  FINISHED: "bg-green-100 text-green-800",
};

interface ArticleDetailsProps {
  article: Article;
}

export function ArticleDetails({ article }: ArticleDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-500">Statut:</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[article.status as ArticleStatus]}`}>
          {statusLabels[article.status as ArticleStatus]}
        </span>
      </div>
      {/* ... existing code ... */}
    </div>
  );
} 