
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Upload } from "lucide-react";

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
  const [preview, setPreview] = useState<string | null>(initialData.logo);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({...prev, [name]: value}));
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveLogo = () => {
    setPreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    // We need a way to signal removal to the server action
    setData(prev => ({ ...prev, logo: '' }));
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // If the logo was removed, we add a special field to the form data.
    if (preview === null && initialData.logo) {
      formData.append('removeLogo', 'true');
    }

    const result = await updateBrandingAction(formData);

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      });
      // The page will be reloaded by revalidatePath on the server
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Nome da Organização</Label>
                <Input
                id="name"
                name="name"
                value={data.name}
                onChange={handleNameChange}
                placeholder="Digite o nome da sua organização"
                />
            </div>
            
            <div className="space-y-2">
                <Label>Cores do Tema</Label>
                <div className="grid grid-cols-3 gap-4">
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
        </div>

        <div className="space-y-2">
            <Label htmlFor="logo">Logo da Organização</Label>
            <div className="relative w-full h-40 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50">
            {preview ? (
                <Image src={preview} alt="Pré-visualização da logo" layout="fill" objectFit="contain" className="p-2" />
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
                    onChange={handleLogoChange}
                    className="flex-1"
                    ref={fileInputRef}
                />
                {preview && (
                    <Button type="button" variant="ghost" onClick={handleRemoveLogo}>Remover</Button>
                )}
            </div>
             <p className="text-xs text-muted-foreground">
                Recomendado: .PNG com fundo transparente, max 200KB.
             </p>
        </div>
      </div>
     

      <Button type="submit">Salvar Alterações</Button>
    </form>
  );
}
