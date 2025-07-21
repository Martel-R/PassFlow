
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
import { Upload, Trash2, Youtube } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DisplaySettingsData {
  advertisementBanner: string | null;
  advertisementVideoUrl: string | null;
}

interface DisplaySettingsFormProps {
  initialData: DisplaySettingsData;
  updateAction: (formData: FormData) => Promise<{ success: boolean; message: string }>;
}

type MediaType = "image" | "video";

function getYouTubeEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  let videoId: string | null = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === "youtu.be") {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes("youtube.com")) {
      videoId = urlObj.searchParams.get("v");
    }
  } catch (e) {
    return null; // Invalid URL
  }
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0`;
  }
  return null;
}

export function DisplaySettingsForm({ initialData, updateAction }: DisplaySettingsFormProps) {
  const [mediaType, setMediaType] = useState<MediaType>(initialData.advertisementVideoUrl ? "video" : "image");
  const [bannerPreview, setBannerPreview] = useState<string | null>(initialData.advertisementBanner);
  const [videoUrl, setVideoUrl] = useState<string>(initialData.advertisementVideoUrl || "");
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
    formData.append("mediaType", mediaType);

    if (mediaType === 'image' && bannerPreview === null && initialData.advertisementBanner) {
      formData.append('removeBanner', 'true');
    }
    if (mediaType === 'video' && !videoUrl && initialData.advertisementVideoUrl) {
      formData.append('removeVideo', 'true');
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

  const videoEmbedUrl = getYouTubeEmbedUrl(videoUrl);

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Publicidade na Tela de Chamada</CardTitle>
          <CardDescription>
            Escolha entre exibir um banner de imagem ou um vídeo do YouTube.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={mediaType} onValueChange={(value) => setMediaType(value as MediaType)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="image" id="r-image" />
              <Label htmlFor="r-image">Banner (Imagem)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="video" id="r-video" />
              <Label htmlFor="r-video">Vídeo do YouTube</Label>
            </div>
          </RadioGroup>

          {mediaType === 'image' && (
            <div className="space-y-2 animate-in fade-in">
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
          )}

          {mediaType === 'video' && (
            <div className="space-y-2 animate-in fade-in">
              <Label htmlFor="advertisementVideoUrl">URL do Vídeo do YouTube</Label>
               <Input
                  id="advertisementVideoUrl"
                  name="advertisementVideoUrl"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="max-w-2xl"
              />
              <div className="relative w-full max-w-2xl aspect-video border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 mt-4">
                 {videoEmbedUrl ? (
                    <iframe
                      src={videoEmbedUrl}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full rounded-md"
                    ></iframe>
                  ) : (
                    <div className="text-center text-muted-foreground">
                        <Youtube className="mx-auto h-12 w-12" />
                        <p>Pré-visualização do vídeo aparecerá aqui</p>
                    </div>
                 )}
              </div>
            </div>
          )}
          
          <Button type="submit">Salvar Alterações</Button>
        </CardContent>
      </Card>
    </form>
  );
}
