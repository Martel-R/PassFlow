
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
import { PlusCircle } from "lucide-react";
import { getCategories, addCategory, updateCategory, deleteCategory } from "@/lib/db";
import { CategoryForm } from "./category-form";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { revalidatePath } from "next/cache";
import { Category } from "@/lib/types";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  async function handleAddCategory(name: string) {
    "use server";
    try {
      await addCategory(name);
      revalidatePath("/admin/categories");
      return { success: true, message: "Categoria adicionada com sucesso!" };
    } catch (error) {
      return { success: false, message: "Erro ao adicionar categoria." };
    }
  }

  async function handleUpdateCategory(id: string, name: string) {
    "use server";
     try {
      await updateCategory(id, name);
      revalidatePath("/admin/categories");
       return { success: true, message: "Categoria atualizada com sucesso!" };
    } catch (error) {
      return { success: false, message: "Erro ao atualizar categoria." };
    }
  }
  
  async function handleDeleteCategory(id: string) {
    "use server";
    try {
      await deleteCategory(id);
      revalidatePath("/admin/categories");
      return { success: true, message: "Categoria excluída com sucesso!" };
    } catch (error) {
       // A constraint error might happen if the category is in use
      return { success: false, message: "Erro ao excluir categoria. Verifique se ela não está sendo usada por algum serviço." };
    }
  }


  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gerenciar Categorias de Serviço
          </h2>
          <p className="text-muted-foreground">
            Defina as categorias para organizar os tipos de atendimento.
          </p>
        </div>
        <CategoryForm 
          formAction={handleAddCategory}
          buttonTitle="Adicionar Categoria"
          dialogTitle="Nova Categoria"
          dialogDescription="Crie uma nova categoria para seus serviços."
        >
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Categoria
          </Button>
        </CategoryForm>
      </div>
      <Card>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Categoria</TableHead>
                <TableHead className="w-[180px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category: Category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">
                    <CategoryForm 
                       formAction={handleUpdateCategory}
                       buttonTitle="Editar"
                       dialogTitle="Editar Categoria"
                       dialogDescription="Atualize o nome desta categoria."
                       initialData={category}
                    />
                    <DeleteCategoryDialog 
                      category={category}
                      deleteAction={handleDeleteCategory}
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

