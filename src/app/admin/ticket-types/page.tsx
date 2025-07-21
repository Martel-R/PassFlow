
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
import { getTicketTypes, addTicketType, updateTicketType, deleteTicketType } from "@/lib/db";
import { TicketTypeForm } from "./ticket-type-form";
import { DeleteTicketTypeDialog } from "./delete-ticket-type-dialog";
import { revalidatePath } from "next/cache";
import type { TicketType } from "@/lib/types";

export default async function AdminTicketTypesPage() {
  const ticketTypes = await getTicketTypes();

  async function handleFormAction(data: Omit<TicketType, 'id'>, id?: string) {
    "use server";
    try {
      if (id) {
        await updateTicketType(id, data);
        revalidatePath("/admin/ticket-types");
        revalidatePath("/get-ticket");
        return { success: true, message: "Tipo de senha atualizado com sucesso!" };
      } else {
        await addTicketType(data);
        revalidatePath("/admin/ticket-types");
        revalidatePath("/get-ticket");
        return { success: true, message: "Tipo de senha adicionado com sucesso!" };
      }
    } catch (error) {
      const message = error instanceof Error && error.message.includes('UNIQUE constraint failed')
        ? "Já existe um tipo de senha com este nome ou prefixo."
        : `Erro ao salvar tipo de senha.`;
      return { success: false, message };
    }
  }
  
  async function handleDeleteAction(id: string) {
    "use server";
    try {
      await deleteTicketType(id);
      revalidatePath("/admin/ticket-types");
      revalidatePath("/get-ticket");
      return { success: true, message: "Tipo de senha excluído com sucesso!" };
    } catch (error) {
      return { success: false, message: "Erro ao excluir tipo de senha. Verifique se ele não está em uso." };
    }
  }


  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gerenciar Tipos de Senha
          </h2>
          <p className="text-muted-foreground">
            Defina os tipos de senha, prefixos e prioridades de atendimento.
          </p>
        </div>
        <TicketTypeForm formAction={handleFormAction}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Tipo
          </Button>
        </TicketTypeForm>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Tipos de Senha Cadastrados</CardTitle>
            <CardDescription>Maior peso significa maior prioridade na fila.</CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-[100px] text-center">Prefixo</TableHead>
                <TableHead className="w-[100px] text-center">Peso</TableHead>
                <TableHead className="w-[180px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ticketTypes.length > 0 ? ticketTypes.map((tt: TicketType) => (
                <TableRow key={tt.id}>
                  <TableCell className="font-medium">{tt.name}</TableCell>
                   <TableCell className="text-muted-foreground">{tt.description}</TableCell>
                   <TableCell className="text-center font-mono">{tt.prefix}</TableCell>
                   <TableCell className="text-center font-mono">{tt.priorityWeight}</TableCell>
                  <TableCell className="text-right">
                    <TicketTypeForm 
                       formAction={handleFormAction}
                       initialData={tt}
                    >
                        <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                        </Button>
                    </TicketTypeForm>
                    <DeleteTicketTypeDialog 
                      ticketType={tt}
                      deleteAction={handleDeleteAction}
                    />
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        Nenhum tipo de senha encontrado.
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
