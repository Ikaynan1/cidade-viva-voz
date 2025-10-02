import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CreatePostButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/create-post")}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-primary hover:scale-110 transition-transform z-50"
      size="icon"
    >
      <PlusCircle className="h-6 w-6" />
    </Button>
  );
};
