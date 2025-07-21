
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
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit } from "lucide-react";
import { getServices, getCategories, addService, updateService, deleteService } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { Service, Category } from "@/lib/types";
import { ServiceForm } from "./service-form";
import { DeleteServiceDialog } from "./delete-service-dialog";
import { DynamicIcon } from "@/components/passflow/dynamic-icon";

export default async function AdminServicesPage() {
  const services = await getServices();
  const categories = await getCategories();
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));

  async function handleFormAction(data: Omit<Service, 'id'>, id?: string) {
    "use server";
    try {
      if (id) {
        await updateService(id, data);
        revalidatePath("/admin/services");
        revalidatePath("/get-ticket");
        return { success: true, message: "Serviço atualizado com sucesso!" };
      } else {
        await addService(data);
        revalidatePath("/admin/services");
        revalidatePath("/get-ticket");
        return { success: true, message: "Serviço adicionado com sucesso!" };
      }
    } catch (error) {
      const message = `Erro ao salvar serviço.`;
      return { success: false, message };
    }
  }

  async function handleDeleteAction(id: string) {
    "use server";
    try {
      await deleteService(id);
      revalidatePath("/admin/services");
      revalidatePath("/get-ticket");
      return { success: true, message: "Serviço excluído com sucesso!" };
    } catch (error) {
      return { success: false, message: "Erro ao excluir serviço. Verifique se ele não está em uso." };
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gerenciar Serviços
          </h2>
          <p className="text-muted-foreground">
            Crie, edite e remova os tipos de serviço disponíveis para os
            usuários.
          </p>
        </div>
        <ServiceForm formAction={handleFormAction} categories={categories}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Serviço
          </Button>
        </ServiceForm>
      </div>
      <Card>
         <CardHeader>
            <CardTitle>Serviços Cadastrados</CardTitle>
            <CardDescription>
                Configure os serviços oferecidos. Use nomes de ícones da biblioteca <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Lucide</a>.
            </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Ícone</TableHead>
                <TableHead>Nome do Serviço</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="w-[180px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length > 0 ? services.map((service) => (
                <TableRow key={service.id}>
                   <TableCell>
                    <DynamicIcon name={service.icon} className="h-6 w-6" />
                  </TableCell>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {categoryMap.get(service.categoryId) || service.categoryId}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ServiceForm 
                      formAction={handleFormAction}
                      categories={categories}
                      initialData={service}
                    >
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                    </ServiceForm>
                    <DeleteServiceDialog 
                      service={service}
                      deleteAction={handleDeleteAction}
                    />
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        Nenhum serviço encontrado.
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
