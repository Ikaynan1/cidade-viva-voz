import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FilterType = "todos" | "positivo" | "negativo" | "neutro";

interface FeedFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const FeedFilters = ({
  activeFilter,
  onFilterChange,
}: FeedFiltersProps) => {
  const filters: { value: FilterType; label: string }[] = [
    { value: "todos", label: "Todos" },
    { value: "positivo", label: "Positivos" },
    { value: "negativo", label: "Negativos" },
    { value: "neutro", label: "Neutros" },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={activeFilter === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            "whitespace-nowrap transition-all",
            activeFilter === filter.value && "shadow-md"
          )}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};
