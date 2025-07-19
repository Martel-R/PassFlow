
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface BrandingFormProps {
  initialName: string;
  updateBrandingAction: (formData: FormData) => Promise<{ success: boolean; message: string }>;
}

export function BrandingForm({ initialName, updateBrandingAction }: BrandingFormProps) {
  const [name, setName] = useState(initialName);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await updateBrandingAction(formData);

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      });
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Organização</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite o nome da sua organização"
        />
      </div>
      {/* Futuramente podemos adicionar o upload do logo aqui */}
      <Button type="submit">Salvar Alterações</Button>
    </form>
  );
}
