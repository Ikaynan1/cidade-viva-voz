import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Flag, ThumbsUp, MapPin, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

type SentimentType = "positivo" | "negativo" | "neutro";
interface PostCardProps {
  author: string; avatar?: string; verified: boolean; sentiment: SentimentType;
  category: string; neighborhood?: string; date: string; content: string;
  politician?: { id: string; name: string };
  onComment?: () => void; onReport?: () => void; onLike?: () => void; likes?: number; liked?: boolean;
}
const sentimentConfig = {
  positivo: { color: "bg-secondary text-secondary-foreground", label: "Positivo" },
  negativo: { color: "bg-destructive text-destructive-foreground", label: "Negativo" },
  neutro: { color: "bg-muted text-muted-foreground", label: "Neutro" },
};
export const PostCard = ({ author, avatar, verified, sentiment, category, neighborhood, date, content, politician, onComment, onReport, onLike, likes = 0, liked = false }: PostCardProps) => {
  const config = sentimentConfig[sentiment];
  return <Card className="overflow-hidden shadow-card transition-shadow hover:shadow-md"><div className="p-4">
    <div className="mb-3 flex items-start gap-3"><Avatar><AvatarImage src={avatar} alt={author} /><AvatarFallback>{author.charAt(0).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">{author}</span>{verified && <Badge variant="secondary" className="text-xs">Verificado</Badge>}</div><div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><span>{date}</span>{neighborhood && <><span>•</span><div className="flex items-center gap-1"><MapPin className="h-3 w-3" /><span>{neighborhood}</span></div></>}</div></div></div>
    <div className="mb-3 flex gap-2"><Badge className={cn("text-xs", config.color)}>{config.label}</Badge><Badge variant="outline" className="text-xs">{category}</Badge></div>
    {politician && <Link to={"/politicians/" + politician.id} className="mb-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/15"><UserRound className="h-3.5 w-3.5" />Sobre: {politician.name}</Link>}
    <p className="mb-3 whitespace-pre-wrap break-words text-sm leading-relaxed">{content}</p>
    <div className="flex items-center gap-2 border-t pt-3"><Button variant="ghost" size="sm" onClick={onLike} aria-label={liked ? "Descurtir publicação" : "Curtir publicação"} aria-pressed={liked} className="gap-2 text-muted-foreground hover:text-primary"><ThumbsUp className="h-4 w-4" /><span className="text-xs">{likes}</span></Button><Button variant="ghost" size="sm" onClick={onComment} className="gap-2 text-muted-foreground hover:text-primary"><MessageCircle className="h-4 w-4" /><span className="text-xs">Comentar</span></Button><Button variant="ghost" size="sm" onClick={onReport} className="ml-auto gap-2 text-muted-foreground hover:text-destructive"><Flag className="h-4 w-4" /><span className="text-xs">Denunciar</span></Button></div>
  </div></Card>;
};
