
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { Counter, Category } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CounterFormProps {
  initialData?: Counter;
  categories: Category[];
  formAction: (formData: FormData) => Promise<{ success: boolean; message: string }>;
  children: React.ReactNode;
}

export function CounterForm({ 
  initialData, 
  categories,
  formAction, 
  children 
}: CounterFormProps) {
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
  const dialogTitle = isEditMode ? "Editar Balcão" : "Novo Balcão";
  const dialogDescription = isEditMode 
    ? "Atualize o nome e as categorias atendidas por este balcão."
    : "Crie um novo balcão de atendimento.";

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
              <Input id="name" name="name" defaultValue={initialData?.name} className="col-span-3" placeholder="Ex: Balcão 01" required/>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Categorias Atendidas</Label>
              <ScrollArea className="h-40 w-full col-span-3 rounded-md border p-4">
                <div className="space-y-2">
                    {categories.map((cat) => (
                        <div key={cat.id} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`cat-${cat.id}`} 
                                name="assignedCategories"
                                value={cat.id}
                                defaultChecked={initialData?.assignedCategories.includes(cat.id)}
                            />
                            <Label htmlFor={`cat-${cat.id}`} className="font-normal">{cat.name}</Label>
                        </div>
                    ))}
                </div>
              </ScrollArea>
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
