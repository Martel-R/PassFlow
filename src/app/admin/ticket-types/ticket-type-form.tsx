
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { TicketType } from "@/lib/types";
import { Edit } from "lucide-react";

type FormData = Omit<TicketType, 'id'>;

interface TicketTypeFormProps {
  initialData?: TicketType;
  formAction: (data: FormData, id?: string) => Promise<{ success: boolean; message: string }>;
  children: React.ReactNode;
}

export function TicketTypeForm({ 
  initialData, 
  formAction, 
  children 
}: TicketTypeFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(
    initialData || {
      name: "",
      description: "",
      prefix: "",
      priorityWeight: 1,
    }
  );
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when dialog closes
      setFormData(initialData || { name: "", description: "", prefix: "", priorityWeight: 1 });
    }
    setIsOpen(open);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || 0 : value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.prefix.trim()) {
        toast({ title: "Erro", description: "Nome e Prefixo são obrigatórios.", variant: "destructive" });
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
  const dialogTitle = isEditMode ? "Editar Tipo de Senha" : "Novo Tipo de Senha";
  const dialogDescription = isEditMode 
    ? "Atualize as informações deste tipo de senha."
    : "Crie um novo tipo de senha para o sistema.";

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
            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" placeholder="Ex: Atendimento Prioritário" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">Descrição</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} className="col-span-3" placeholder="Ex: Para idosos, gestantes, etc." />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prefix" className="text-right">Prefixo</Label>
            <Input id="prefix" name="prefix" value={formData.prefix} onChange={handleChange} className="col-span-3" placeholder="Ex: P (só uma letra)" maxLength={1} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priorityWeight" className="text-right">Peso da Prioridade</Label>
            <Input id="priorityWeight" name="priorityWeight" type="number" value={formData.priorityWeight} onChange={handleChange} className="col-span-3" placeholder="Ex: 10 (maior = mais prioritário)" />
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
