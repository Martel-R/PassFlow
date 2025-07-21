
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface BrandingData {
  name: string;
  primaryColor: string; // HEX
  accentColor: string; // HEX
  backgroundColor: string; // HEX
}

interface BrandingFormProps {
  initialData: BrandingData;
  updateBrandingAction: (formData: FormData) => Promise<{ success: boolean; message: string }>;
}

export function BrandingForm({ initialData, updateBrandingAction }: BrandingFormProps) {
  const [data, setData] = useState(initialData);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await updateBrandingAction(formData);

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      });
      // A página será recarregada pelo revalidatePath no servidor
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Organização</Label>
        <Input
          id="name"
          name="name"
          value={data.name}
          onChange={handleChange}
          placeholder="Digite o nome da sua organização"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center gap-2">
            <Label htmlFor="primaryColor">Cor Primária</Label>
            <Input
              id="primaryColor"
              name="primaryColor"
              type="color"
              value={data.primaryColor}
              onChange={handleChange}
              className="h-16 w-16 p-1"
            />
             <span className="text-sm text-muted-foreground">{data.primaryColor}</span>
        </div>
        <div className="flex flex-col items-center gap-2">
            <Label htmlFor="accentColor">Cor de Destaque</Label>
            <Input
              id="accentColor"
              name="accentColor"
              type="color"
              value={data.accentColor}
              onChange={handleChange}
              className="h-16 w-16 p-1"
            />
            <span className="text-sm text-muted-foreground">{data.accentColor}</span>
        </div>
        <div className="flex flex-col items-center gap-2">
            <Label htmlFor="backgroundColor">Cor de Fundo</Label>
            <Input
              id="backgroundColor"
              name="backgroundColor"
              type="color"
              value={data.backgroundColor}
              onChange={handleChange}
              className="h-16 w-16 p-1"
            />
            <span className="text-sm text-muted-foreground">{data.backgroundColor}</span>
        </div>
      </div>
       <p className="text-sm text-muted-foreground">
        Clique nos quadrados para abrir o seletor de cores.
      </p>

      <Button type="submit">Salvar Alterações</Button>
    </form>
  );
}
