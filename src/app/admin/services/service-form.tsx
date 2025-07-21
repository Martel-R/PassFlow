
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Service, Category } from "@/lib/types";

type FormData = Omit<Service, 'id'>;

interface ServiceFormProps {
  initialData?: Service;
  categories: Category[];
  formAction: (data: FormData, id?: string) => Promise<{ success: boolean; message: string }>;
  children: React.ReactNode;
}

export function ServiceForm({ 
  initialData, 
  categories,
  formAction, 
  children 
}: ServiceFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(
    initialData || {
      name: "",
      categoryId: categories[0]?.id || "",
      icon: "Box",
    }
  );
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData(initialData || { name: "", categoryId: categories[0]?.id || "", icon: "Box" });
    }
    setIsOpen(open);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, categoryId: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.categoryId) {
        toast({ title: "Erro", description: "Nome e Categoria são obrigatórios.", variant: "destructive" });
        return;
    }

    startTransition(async () => {
      const result = await formAction(formData, initialData?.id);
      if (result.success) {
        toast({ title: "Sucesso!", description: result.message });
        handleOpenChange(false);
      } else {
        toast({ title: "Erro", description: result.message, variant: "destructive" });
      }
    });
  };

  const isEditMode = !!initialData;
  const dialogTitle = isEditMode ? "Editar Serviço" : "Novo Serviço";
  const dialogDescription = isEditMode 
    ? "Atualize as informações deste serviço."
    : "Crie um novo serviço de atendimento.";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nome</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" placeholder="Ex: Abertura de Conta" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="icon" className="text-right">Ícone</Label>
            <Input id="icon" name="icon" value={formData.icon} onChange={handleChange} className="col-span-3" placeholder="Nome do ícone Lucide" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="categoryId" className="text-right">Categoria</Label>
            <Select name="categoryId" value={formData.categoryId} onValueChange={handleSelectChange}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
