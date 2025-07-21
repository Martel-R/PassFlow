
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Upload, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BrandingData {
  name: string;
  primaryColor: string; // HEX
  accentColor: string; // HEX
  backgroundColor: string; // HEX
  logo: string | null; // Data URI
}

interface BrandingFormProps {
  initialData: BrandingData;
  updateBrandingAction: (formData: FormData) => Promise<{ success: boolean; message: string }>;
}

export function BrandingForm({ initialData, updateBrandingAction }: BrandingFormProps) {
  const [data, setData] = useState(initialData);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logo);
  
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({...prev, [name]: value}));
  }

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = (
    setter: React.Dispatch<React.SetStateAction<string | null>>,
    ref: React.RefObject<HTMLInputElement>,
    field: 'logo'
  ) => {
    setter(null);
    if(ref.current) {
        ref.current.value = "";
    }
    setData(prev => ({ ...prev, [field]: '' }));
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (logoPreview === null && initialData.logo) {
      formData.append('removeLogo', 'true');
    }
   
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Organização</Label>
        <Input
        id="name"
        name="name"
        value={data.name}
        onChange={handleNameChange}
        placeholder="Digite o nome da sua organização"
        className="max-w-md"
        />
      </div>

       <div className="space-y-2">
            <Label>Cores do Tema</Label>
            <div className="flex gap-8">
                <div className="flex flex-col items-center gap-2">
                    <Label htmlFor="primaryColor" className="text-sm">Primária</Label>
                    <Input
                    id="primaryColor"
                    name="primaryColor"
                    type="color"
                    value={data.primaryColor}
                    onChange={handleColorChange}
                    className="h-16 w-16 p-1"
                    />
                    <span className="text-sm text-muted-foreground">{data.primaryColor}</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Label htmlFor="accentColor" className="text-sm">Destaque</Label>
                    <Input
                    id="accentColor"
                    name="accentColor"
                    type="color"
                    value={data.accentColor}
                    onChange={handleColorChange}
                    className="h-16 w-16 p-1"
                    />
                    <span className="text-sm text-muted-foreground">{data.accentColor}</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Label htmlFor="backgroundColor" className="text-sm">Fundo</Label>
                    <Input
                    id="backgroundColor"
                    name="backgroundColor"
                    type="color"
                    value={data.backgroundColor}
                    onChange={handleColorChange}
                    className="h-16 w-16 p-1"
                    />
                    <span className="text-sm text-muted-foreground">{data.backgroundColor}</span>
                </div>
            </div>
        </div>
      
      <div className="space-y-2 max-w-md">
          <Label htmlFor="logo">Logo da Organização</Label>
          <div className="relative w-full h-40 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50">
          {logoPreview ? (
              <Image src={logoPreview} alt="Pré-visualização da logo" layout="fill" objectFit="contain" className="p-2" />
          ) : (
              <div className="text-center text-muted-foreground">
                  <Upload className="mx-auto h-8 w-8" />
                  <p>Sem logo</p>
              </div>
          )}
          </div>
          <div className="flex items-center gap-2 mt-2">
              <Input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={(e) => handleImageChange(e, setLogoPreview)}
                  className="flex-1"
                  ref={logoFileInputRef}
              />
              {logoPreview && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveImage(setLogoPreview, logoFileInputRef, 'logo')}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remover Logo</span>
                  </Button>
              )}
          </div>
            <p className="text-xs text-muted-foreground">
              Recomendado: .PNG com fundo transparente, max 200KB.
            </p>
      </div>

      <Button type="submit">Salvar Alterações</Button>
    </form>
  );
}
