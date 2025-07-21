
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Upload, Trash2 } from "lucide-react";

interface DisplaySettingsData {
  advertisementBanner: string | null;
}

interface DisplaySettingsFormProps {
  initialData: DisplaySettingsData;
  updateAction: (formData: FormData) => Promise<{ success: boolean; message: string }>;
}

export function DisplaySettingsForm({ initialData, updateAction }: DisplaySettingsFormProps) {
  const [bannerPreview, setBannerPreview] = useState<string | null>(initialData.advertisementBanner);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    setBannerPreview(null);
    if(bannerFileInputRef.current) {
        bannerFileInputRef.current.value = "";
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (bannerPreview === null && initialData.advertisementBanner) {
      formData.append('removeBanner', 'true');
    }

    const result = await updateAction(formData);

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
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Banner de Publicidade</CardTitle>
          <CardDescription>
            Faça upload de uma imagem para ser exibida na tela de chamada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="advertisementBanner">Arquivo do Banner</Label>
            <div className="relative w-full max-w-2xl h-64 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50">
                {bannerPreview ? (
                    <Image src={bannerPreview} alt="Pré-visualização do banner" layout="fill" objectFit="contain" className="p-2" />
                ) : (
                    <div className="text-center text-muted-foreground">
                        <Upload className="mx-auto h-8 w-8" />
                        <p>Sem banner</p>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2 mt-2 max-w-2xl">
                <Input
                    id="advertisementBanner"
                    name="advertisementBanner"
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleImageChange}
                    className="flex-1"
                    ref={bannerFileInputRef}
                />
                {bannerPreview && (
                     <Button type="button" variant="ghost" size="icon" onClick={handleRemoveImage}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remover Banner</span>
                    </Button>
                )}
            </div>
             <p className="text-xs text-muted-foreground">
                Recomendado: 1200x800px, max 500KB.
             </p>
          </div>
          <Button type="submit">Salvar Alterações</Button>
        </CardContent>
      </Card>
    </form>
  );
}
