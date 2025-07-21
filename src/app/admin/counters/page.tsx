
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit } from "lucide-react";
import { getCounters, getCategories, addCounter, updateCounter, deleteCounter } from "@/lib/db";
import { CounterForm } from "./counter-form";
import { DeleteCounterDialog } from "./delete-counter-dialog";
import { revalidatePath } from "next/cache";
import type { Counter } from "@/lib/types";


export default async function AdminCountersPage() {
  const counters = await getCounters();
  const categories = await getCategories();
  
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));

  const getCategoryName = (categoryId: string) => {
    return categoryMap.get(categoryId) || categoryId;
  };

  async function handleFormAction(formData: FormData) {
    "use server";

    const id = formData.get("id") as string | undefined;
    const name = formData.get("name") as string;
    const assignedCategories = formData.getAll("assignedCategories") as string[];

    if (!name) {
      return { success: false, message: "O nome do balcão é obrigatório." };
    }
    
    try {
      if (id) {
        await updateCounter(id, name, assignedCategories);
        revalidatePath("/admin/counters");
        return { success: true, message: "Balcão atualizado com sucesso!" };
      } else {
        await addCounter(name, assignedCategories);
        revalidatePath("/admin/counters");
        return { success: true, message: "Balcão adicionado com sucesso!" };
      }
    } catch(error) {
       const message = error instanceof Error && error.message.includes('UNIQUE constraint failed')
        ? "Já existe um balcão com este nome."
        : `Erro ao salvar balcão.`;
      return { success: false, message };
    }
  }

  async function handleDeleteAction(id: string) {
    "use server";
    try {
      await deleteCounter(id);
      revalidatePath("/admin/counters");
      return { success: true, message: "Balcão excluído com sucesso!" };
    } catch(error) {
      return { success: false, message: "Erro ao excluir balcão. Verifique se ele não está associado a algum usuário." };
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gerenciar Balcões
          </h2>
          <p className="text-muted-foreground">
            Configure os balcões de atendimento e as categorias que eles atendem.
          </p>
        </div>
        <CounterForm 
          formAction={handleFormAction} 
          categories={categories}
        >
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Balcão
          </Button>
        </CounterForm>
      </div>
      <Card>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Balcão</TableHead>
                <TableHead>Categorias Atendidas</TableHead>
                <TableHead className="w-[180px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {counters.map((counter) => (
                <TableRow key={counter.id}>
                  <TableCell className="font-medium">{counter.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {counter.assignedCategories.map(catId => (
                        <Badge key={catId} variant="secondary">
                          {getCategoryName(catId)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <CounterForm 
                        formAction={handleFormAction} 
                        categories={categories}
                        initialData={counter}
                    >
                        <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                        </Button>
                    </CounterForm>
                    <DeleteCounterDialog 
                        counter={counter}
                        deleteAction={handleDeleteAction}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
