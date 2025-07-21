
"use client";

import { useState, useRef, useTransition } from "react";
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
import { Upload, Trash2, Youtube, Image as ImageIcon, PlusCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { AdvertisementMedia } from "@/lib/types";

interface DisplaySettingsClientProps {
  initialMedia: AdvertisementMedia[];
  updateAction: (mediaItems: AdvertisementMedia[]) => Promise<{ success: boolean; message: string }>;
  uploadAction: (formData: FormData) => Promise<{ success: boolean; message: string; dataUri?: string }>;
}


export function DisplaySettingsClient({ initialMedia, updateAction, uploadAction }: DisplaySettingsClientProps) {
  const [mediaItems, setMediaItems] = useState<AdvertisementMedia[]>(initialMedia);
  const [newMediaType, setNewMediaType] = useState<"image" | "video">("image");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newImageDuration, setNewImageDuration] = useState(10);
  const [isUploading, setIsUploading] = useState(false);
  
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleAddItem = async () => {
    let newItem: Omit<AdvertisementMedia, 'id'> | null = null;
    
    if (newMediaType === 'image') {
      if (!newImageFile) {
        toast({ title: "Erro", description: "Selecione um arquivo de imagem.", variant: "destructive" });
        return;
      }
      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", newImageFile);
      const uploadResult = await uploadAction(formData);
      setIsUploading(false);

      if (uploadResult.success && uploadResult.dataUri) {
         newItem = {
            type: 'image',
            src: uploadResult.dataUri,
            duration: newImageDuration
         };
         setNewImageFile(null);
         if (imageInputRef.current) imageInputRef.current.value = "";

      } else {
        toast({ title: "Erro no Upload", description: uploadResult.message, variant: "destructive" });
        return;
      }
    } else { // video
      if (!newVideoUrl.trim() || !isValidYoutubeUrl(newVideoUrl)) {
        toast({ title: "Erro", description: "Por favor, insira uma URL válida do YouTube.", variant: "destructive" });
        return;
      }
      newItem = {
        type: 'video',
        src: newVideoUrl
      };
      setNewVideoUrl("");
    }
    
    if (newItem) {
        const fullNewItem = { ...newItem, id: `media-${Date.now()}` } as AdvertisementMedia;
        setMediaItems(prev => [...prev, fullNewItem]);
    }
  };

  const handleRemoveItem = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };
  
  const isValidYoutubeUrl = (url: string) => {
      try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be");
      } catch (e) {
        return false;
      }
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateAction(mediaItems);
      if (result.success) {
        toast({ title: "Sucesso!", description: result.message });
      } else {
        toast({ title: "Erro", description: result.message, variant: "destructive" });
      }
    });
  }

  return (
    <div className="space-y-8">
        {/* FORM TO ADD NEW MEDIA */}
        <Card>
            <CardHeader>
                <CardTitle>Adicionar Nova Mídia</CardTitle>
                <CardDescription>Adicione uma imagem ou vídeo do YouTube ao carrossel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <RadioGroup value={newMediaType} onValueChange={(v) => setNewMediaType(v as any)} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="image" id="r-image" />
                        <Label htmlFor="r-image">Imagem</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="video" id="r-video" />
                        <Label htmlFor="r-video">Vídeo do YouTube</Label>
                    </div>
                </RadioGroup>

                {newMediaType === 'image' && (
                    <div className="grid md:grid-cols-2 gap-4 animate-in fade-in">
                        <div className="space-y-2">
                            <Label htmlFor="newImageFile">Arquivo de Imagem</Label>
                             <Input 
                                id="newImageFile" 
                                type="file" 
                                accept="image/png, image/jpeg" 
                                onChange={(e) => setNewImageFile(e.target.files?.[0] || null)}
                                ref={imageInputRef}
                             />
                             <p className="text-xs text-muted-foreground">Recomendado: 1200x800px, max 1MB.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newImageDuration">Tempo de Exibição (segundos)</Label>
                            <Input 
                                id="newImageDuration" 
                                type="number"
                                value={newImageDuration}
                                onChange={(e) => setNewImageDuration(Math.max(1, parseInt(e.target.value, 10)))}
                                min="1"
                             />
                        </div>
                    </div>
                )}
                 {newMediaType === 'video' && (
                     <div className="space-y-2 animate-in fade-in">
                        <Label htmlFor="newVideoUrl">URL do Vídeo do YouTube</Label>
                        <Input 
                            id="newVideoUrl"
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={newVideoUrl}
                            onChange={(e) => setNewVideoUrl(e.target.value)}
                        />
                     </div>
                 )}

                 <Button onClick={handleAddItem} disabled={isUploading}>
                    {isUploading ? "Enviando Imagem..." : (
                        <>
                            <PlusCircle className="mr-2" />
                            Adicionar à Lista
                        </>
                    )}
                 </Button>

            </CardContent>
        </Card>

        {/* LIST OF CURRENT MEDIA */}
        <Card>
            <CardHeader>
                <CardTitle>Mídias no Carrossel</CardTitle>
                <CardDescription>
                    {mediaItems.length > 0 ? "Gerencie as mídias que serão exibidas na tela de chamada." : "Nenhuma mídia adicionada ao carrossel ainda."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {mediaItems.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-4 p-2 border rounded-lg">
                           <div className="font-bold text-lg">{index + 1}</div>
                           
                           {item.type === 'image' ? (
                             <ImageIcon className="h-10 w-10 text-muted-foreground" />
                           ) : (
                             <Youtube className="h-10 w-10 text-muted-foreground" />
                           )}

                           <div className="flex-1 truncate">
                                <p className="font-medium">
                                    {item.type === 'image' ? 'Imagem' : 'Vídeo do YouTube'}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                    {item.src}
                                </p>
                           </div>

                           {item.type === 'image' && (
                               <div className="text-sm">
                                   <span className="font-medium">{item.duration}</span>s
                               </div>
                           )}

                           <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                               <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar Alterações do Carrossel"}
        </Button>
    </div>
  );
}

