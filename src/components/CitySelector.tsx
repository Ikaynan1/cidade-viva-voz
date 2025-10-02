import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";

interface CitySelectorProps {
  currentCity: string;
  onCityChange: (city: string) => void;
}

const cities = [
  "Parnamirim",
  "Natal",
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Brasília",
  "Salvador",
  "Fortaleza",
  "Recife",
];

export const CitySelector = ({
  currentCity,
  onCityChange,
}: CitySelectorProps) => {
  return (
    <div className="flex items-center gap-2 bg-gradient-primary p-4 rounded-lg shadow-card">
      <MapPin className="h-5 w-5 text-primary-foreground" />
      <Select value={currentCity} onValueChange={onCityChange}>
        <SelectTrigger className="w-full md:w-[240px] bg-white/20 border-white/30 text-primary-foreground font-semibold">
          <SelectValue placeholder="Selecione a cidade" />
        </SelectTrigger>
        <SelectContent>
          {cities.map((city) => (
            <SelectItem key={city} value={city}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
