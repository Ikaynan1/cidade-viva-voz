import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Upload } from "lucide-react";
import { toast } from "sonner";

type SentimentType = "positivo" | "negativo" | "neutro";

const CreatePost = () => {
  const navigate = useNavigate();
  const [sentiment, setSentiment] = useState<SentimentType>("neutro");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");

  const categories = [
    "Economia",
    "Saúde",
    "Transporte",
    "Infraestrutura",
    "Educação",
    "Segurança",
    "Outro",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar envio real para backend
    toast.success("Post publicado com sucesso!");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Criar Publicação</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sentiment Selection */}
            <div className="space-y-2">
              <Label>Classificação *</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={sentiment === "positivo" ? "default" : "outline"}
                  className={sentiment === "positivo" ? "bg-secondary" : ""}
                  onClick={() => setSentiment("positivo")}
                >
                  Positivo
                </Button>
                <Button
                  type="button"
                  variant={sentiment === "negativo" ? "default" : "outline"}
                  className={sentiment === "negativo" ? "bg-destructive" : ""}
                  onClick={() => setSentiment("negativo")}
                >
                  Negativo
                </Button>
                <Button
                  type="button"
                  variant={sentiment === "neutro" ? "default" : "outline"}
                  onClick={() => setSentiment("neutro")}
                >
                  Neutro
                </Button>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Texto *</Label>
              <Textarea
                id="content"
                placeholder="Compartilhe sua experiência..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                maxLength={1200}
                required
              />
              <p className="text-xs text-muted-foreground text-right">
                {content.length}/1200 caracteres
              </p>
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label htmlFor="photo">Foto (opcional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Clique para adicionar fotos (máx. 4)
                </p>
              </div>
            </div>

            {/* Neighborhood */}
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                type="text"
                placeholder="Seu bairro (preenchido automaticamente)"
                defaultValue="Centro"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-primary"
              >
                Publicar
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default CreatePost;
