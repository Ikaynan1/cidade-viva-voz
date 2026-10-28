import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { usePoliticians } from "@/hooks/useSocial";
import { Input } from "@/components/ui/input";

export function PoliticianSearch() {
  const { data: politicians } = usePoliticians();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const matches = useMemo(() => {
    const query = term.trim().toLocaleLowerCase("pt-BR");
    if (!query) return [];
    return (politicians ?? [])
      .filter((person) => ((person.ballot_name ?? "") + " " + person.civil_name).toLocaleLowerCase("pt-BR").includes(query))
      .slice(0, 7);
  }, [politicians, term]);

  return <div className="relative w-full max-w-md" role="combobox" aria-expanded={open && term.trim().length > 0} aria-haspopup="listbox">
    <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
    <Input
      className="h-10 rounded-full bg-muted/60 pl-9"
      value={term}
      onChange={(event) => { setTerm(event.target.value); setOpen(true); }}
      onFocus={() => setOpen(true)}
      onBlur={() => window.setTimeout(() => setOpen(false), 150)}
      placeholder="Buscar um político pelo nome"
      aria-label="Buscar político"
      autoComplete="off"
    />
    {open && term.trim() && <div className="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border bg-popover p-1 shadow-lg" role="listbox">
      {matches.map((person) => <Link
        key={person.id}
        to={"/politicians/" + person.id}
        role="option"
        aria-selected="false"
        className="block rounded-lg px-3 py-2 hover:bg-muted focus:bg-muted"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => { setTerm(""); setOpen(false); }}
      >
        <span className="block font-medium">{person.ballot_name ?? person.civil_name}</span>
        {person.ballot_name && <span className="block text-xs text-muted-foreground">{person.civil_name}</span>}
      </Link>)}
      {matches.length === 0 && <p className="px-3 py-3 text-sm text-muted-foreground">Nenhum político encontrado.</p>}
    </div>}
  </div>;
}
