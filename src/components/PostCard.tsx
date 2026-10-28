import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Flag, ThumbsUp, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type SentimentType = "positivo" | "negativo" | "neutro";

interface PostCardProps {
  author: string;
  avatar?: string;
  verified: boolean;
  sentiment: SentimentType;
  category: string;
  neighborhood?: string;
  date: string;
  content: string;
  imageUrl?: string;
  onComment?: () => void;
  onReport?: () => void;
  onLike?: () => void;
  likes?: number;
  liked?: boolean;
}

const sentimentConfig = {
  positivo: {
    color: "bg-secondary text-secondary-foreground",
    label: "Positivo",
  },
  negativo: {
    color: "bg-destructive text-destructive-foreground",
    label: "Negativo",
  },
  neutro: {
    color: "bg-muted text-muted-foreground",
    label: "Neutro",
  },
};

export const PostCard = ({
  author,
  avatar,
  verified,
  sentiment,
  category,
  neighborhood,
  date,
  content,
  imageUrl,
  onComment,
  onReport,
  onLike,
  likes = 0,
  liked = false,
}: PostCardProps) => {
  const config = sentimentConfig[sentiment];

  return (
    <Card className="overflow-hidden shadow-card hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar>
            <AvatarImage src={avatar} alt={author} />
            <AvatarFallback>{author.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{author}</span>
              {verified && (
                <Badge variant="secondary" className="text-xs">
                  Verificado
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span>{date}</span>
              {neighborhood && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{neighborhood}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2 mb-3">
          <Badge className={cn("text-xs", config.color)}>{config.label}</Badge>
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        </div>

        {/* Content */}
        <p className="text-sm mb-3 leading-relaxed">{content}</p>

        {/* Image */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Post"
            className="w-full h-64 object-cover rounded-lg mb-3"
          />
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            aria-label={liked ? "Descurtir publicação" : "Curtir publicação"}
            aria-pressed={liked}
            className="gap-2 text-muted-foreground hover:text-primary"
          >
            <ThumbsUp className="h-4 w-4" />
            <span className="text-xs">{likes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onComment}
            className="gap-2 text-muted-foreground hover:text-primary"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">Comentar</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReport}
            className="gap-2 text-muted-foreground hover:text-destructive ml-auto"
          >
            <Flag className="h-4 w-4" />
            <span className="text-xs">Denunciar</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
