
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

interface ServiceFormProps {
  initialData?: Service;
  categories: Category[];
  formAction: (formData: FormData) => Promise<{ success: boolean; message: string }>;
  children: React.ReactNode;
}

export function ServiceForm({ 
  initialData, 
  categories,
  formAction, 
  children 
}: ServiceFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await formAction(formData);
      if (result.success) {
        toast({ title: "Sucesso!", description: result.message });
        setIsOpen(false);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form action={handleSubmit}>
          {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome</Label>
              <Input id="name" name="name" defaultValue={initialData?.name} className="col-span-3" placeholder="Ex: Abertura de Conta" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">Ícone</Label>
              <Input id="icon" name="icon" defaultValue={initialData?.icon} className="col-span-3" placeholder="Nome do ícone Lucide" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryId" className="text-right">Categoria</Label>
              <Select name="categoryId" defaultValue={initialData?.categoryId} required>
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
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
