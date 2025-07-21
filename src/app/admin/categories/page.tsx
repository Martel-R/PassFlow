
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { PlusCircle, Edit } from "lucide-react";
import { getCategories, addCategory, updateCategory, deleteCategory } from "@/lib/db";
import { CategoryForm } from "./category-form";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { revalidatePath } from "next/cache";
import type { Category } from "@/lib/types";
import { DynamicIcon } from "@/components/passflow/dynamic-icon";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  async function handleFormAction(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const icon = formData.get("icon") as string;
    const id = formData.get("id") as string | undefined;

    try {
      if (id) {
        await updateCategory(id, name, icon);
        revalidatePath("/admin/categories");
        revalidatePath("/get-ticket");
        return { success: true, message: "Categoria atualizada com sucesso!" };
      } else {
        await addCategory(name, icon);
        revalidatePath("/admin/categories");
        revalidatePath("/get-ticket");
        return { success: true, message: "Categoria adicionada com sucesso!" };
      }
    } catch (error) {
      const message = error instanceof Error && error.message.includes('UNIQUE constraint failed')
        ? "Já existe uma categoria com este nome."
        : "Erro ao salvar categoria.";
      return { success: false, message };
    }
  }
  
  async function handleDeleteCategory(id: string) {
    "use server";
    try {
      await deleteCategory(id);
      revalidatePath("/admin/categories");
      revalidatePath("/get-ticket");
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
        <CategoryForm formAction={handleFormAction}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Categoria
          </Button>
        </CategoryForm>
      </div>
      <Card>
         <CardHeader>
            <CardTitle>Categorias Cadastradas</CardTitle>
            <CardDescription>
                Configure as categorias para agrupar os serviços de atendimento.
                Use nomes de ícones da biblioteca <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Lucide</a>.
            </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Ícone</TableHead>
                <TableHead>Nome da Categoria</TableHead>
                <TableHead className="w-[180px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length > 0 ? categories.map((category: Category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <DynamicIcon name={category.icon} className="h-6 w-6" />
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">
                    <CategoryForm 
                       formAction={handleFormAction}
                       initialData={category}
                    >
                       <Button variant="ghost" size="icon">
                         <Edit className="h-4 w-4" />
                         <span className="sr-only">Editar</span>
                       </Button>
                    </CategoryForm>
                    <DeleteCategoryDialog 
                      category={category}
                      deleteAction={handleDeleteCategory}
                    />
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        Nenhuma categoria encontrada.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
