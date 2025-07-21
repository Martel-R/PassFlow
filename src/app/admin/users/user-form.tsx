
"use client";

import { useState, useTransition, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { User, Counter } from "@/lib/types";

interface UserFormProps {
  initialData?: User;
  counters: Counter[];
  formAction: (formData: FormData) => Promise<{ success: boolean; message: string }>;
  children: React.ReactNode;
}

export function UserForm({
  initialData,
  counters,
  formAction,
  children,
}: UserFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState(initialData?.role || 'clerk');

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

  useEffect(() => {
    if (initialData?.role) {
      setSelectedRole(initialData.role);
    }
  }, [initialData]);

  const isEditMode = !!initialData;
  const dialogTitle = isEditMode ? "Editar Usuário" : "Novo Usuário";
  const dialogDescription = isEditMode
    ? "Atualize as informações do usuário."
    : "Crie um novo usuário para o sistema.";

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
              <Input id="name" name="name" defaultValue={initialData?.name} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">Usuário</Label>
              <Input id="username" name="username" defaultValue={initialData?.username} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">Senha</Label>
              <Input id="password" name="password" type="password" className="col-span-3" placeholder={isEditMode ? "Deixe em branco para manter" : ""} required={!isEditMode} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Perfil</Label>
              <Select name="role" value={selectedRole} onValueChange={setSelectedRole} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clerk">Atendente</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedRole === 'clerk' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="counterId" className="text-right">Balcão</Label>
                <Select name="counterId" defaultValue={initialData?.counterId} required={selectedRole === 'clerk'}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione um balcão" />
                  </SelectTrigger>
                  <SelectContent>
                    {counters.map((counter) => (
                      <SelectItem key={counter.id} value={counter.id}>
                        {counter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
