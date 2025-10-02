import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface PoliticianCardProps {
  name: string;
  role: string;
  party?: string;
  avatar?: string;
  rating: number;
  term?: string;
  onClick?: () => void;
}

export const PoliticianCard = ({
  name,
  role,
  party,
  avatar,
  rating,
  term,
  onClick,
}: PoliticianCardProps) => {
  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="text-lg">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate">{name}</h3>
          <p className="text-sm text-muted-foreground">{role}</p>
          {party && (
            <Badge variant="outline" className="mt-1 text-xs">
              {party}
            </Badge>
          )}
          {term && (
            <p className="text-xs text-muted-foreground mt-1">{term}</p>
          )}
        </div>
        <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-lg">
          <Star className="h-4 w-4 text-accent fill-accent" />
          <span className="font-semibold text-sm">{rating.toFixed(1)}</span>
        </div>
      </div>
    </Card>
  );
};
