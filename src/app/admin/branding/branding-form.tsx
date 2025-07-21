
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface BrandingData {
  name: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
            <Label htmlFor="primaryColor">Cor Primária (HSL)</Label>
            <Input
            id="primaryColor"
            name="primaryColor"
            value={data.primaryColor}
            onChange={handleChange}
            placeholder="Ex: 210 70% 50%"
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="accentColor">Cor de Destaque (HSL)</Label>
            <Input
            id="accentColor"
            name="accentColor"
            value={data.accentColor}
            onChange={handleChange}
            placeholder="Ex: 180 60% 40%"
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="backgroundColor">Cor de Fundo (HSL)</Label>
            <Input
            id="backgroundColor"
            name="backgroundColor"
            value={data.backgroundColor}
            onChange={handleChange}
            placeholder="Ex: 210 20% 95%"
            />
        </div>
      </div>
       <p className="text-sm text-muted-foreground">
        Insira os valores no formato HSL sem a função `hsl()`. Exemplo: `210 70% 50%`.
      </p>

      {/* Futuramente podemos adicionar o upload do logo aqui */}
      <Button type="submit">Salvar Alterações</Button>
    </form>
  );
}
