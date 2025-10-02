import { useState } from "react";
import { CitySelector } from "@/components/CitySelector";
import { FeedFilters } from "@/components/FeedFilters";
import { PostCard } from "@/components/PostCard";
import { PoliticianCard } from "@/components/PoliticianCard";
import { CreatePostButton } from "@/components/CreatePostButton";
import { UserMenu } from "@/components/UserMenu";

type FilterType = "todos" | "positivo" | "negativo" | "neutro";

const Index = () => {
  const [currentCity, setCurrentCity] = useState("Parnamirim");
  const [activeFilter, setActiveFilter] = useState<FilterType>("todos");
  const [isLoggedIn] = useState(true); // TODO: Replace with real auth state

  // Mock data - será substituído por dados reais do backend
  const mockPosts = [
    {
      id: 1,
      author: "Maria Silva",
      verified: true,
      sentiment: "positivo" as const,
      category: "Infraestrutura",
      neighborhood: "Centro",
      date: "Há 2 horas",
      content:
        "A nova ciclovia inaugurada na Av. Principal está incrível! Finalmente podemos pedalar com segurança. Parabéns à gestão!",
      likes: 24,
    },
    {
      id: 2,
      author: "João Santos",
      verified: true,
      sentiment: "negativo" as const,
      category: "Saúde",
      neighborhood: "Parque das Nações",
      date: "Há 5 horas",
      content:
        "Posto de saúde do bairro está sem médicos há 3 dias. População desassistida e sem perspectiva de solução.",
      likes: 45,
    },
    {
      id: 3,
      author: "Ana Costa",
      verified: false,
      sentiment: "neutro" as const,
      category: "Transporte",
      neighborhood: "Santos Reis",
      date: "Há 1 dia",
      content:
        "Novos horários de ônibus foram implementados. Ainda precisamos avaliar se atendem melhor a demanda.",
      likes: 12,
    },
  ];

  const mockPoliticians = [
    {
      id: 1,
      name: "Carlos Eduardo Alves",
      role: "Prefeito",
      party: "PSDB",
      rating: 7.2,
      term: "2021-2024",
    },
    {
      id: 2,
      name: "Fátima Bezerra",
      role: "Governadora",
      party: "PT",
      rating: 6.8,
      term: "2019-2026",
    },
  ];

  const filteredPosts =
    activeFilter === "todos"
      ? mockPosts
      : mockPosts.filter((post) => post.sentiment === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            VozCivica
          </h1>
          <UserMenu 
            isLoggedIn={isLoggedIn}
            userName="Maria Silva"
            userAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Maria"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* City Selector */}
        <div className="mb-6">
          <CitySelector
            currentCity={currentCity}
            onCityChange={setCurrentCity}
          />
        </div>

        {/* Politicians Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Gestores Públicos</h2>
          <div className="grid gap-3">
            {mockPoliticians.map((politician) => (
              <PoliticianCard
                key={politician.id}
                {...politician}
                onClick={() => console.log("Navigate to politician", politician.id)}
              />
            ))}
          </div>
        </section>

        {/* Feed Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Feed da Cidade</h2>
          
          {/* Filters */}
          <div className="mb-4">
            <FeedFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                {...post}
                onComment={() => console.log("Comment", post.id)}
                onReport={() => console.log("Report", post.id)}
                onLike={() => console.log("Like", post.id)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Floating Create Button */}
      <CreatePostButton />
    </div>
  );
};

export default Index;
