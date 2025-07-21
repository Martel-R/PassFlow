
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
import { getUsers, getCounters, addUser, updateUser, deleteUser } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { User, Counter } from "@/lib/types";
import { UserForm } from "./user-form";
import { DeleteUserDialog } from "./delete-user-dialog";


export default async function AdminUsersPage() {
  const users = await getUsers();
  const counters = await getCounters();

  async function handleFormAction(formData: FormData) {
    "use server";
    const id = formData.get("id") as string | undefined;
    
    let counterIdValue = formData.get("counterId") as string | undefined;
    if (counterIdValue === 'none') {
        counterIdValue = undefined;
    }

    const data = {
        name: formData.get("name") as string,
        username: formData.get("username") as string,
        password: formData.get("password") as string,
        role: formData.get("role") as 'admin' | 'clerk',
        counterId: counterIdValue,
    }

    if (!data.name || !data.username || !data.role) {
      return { success: false, message: "Nome, Usuário e Perfil são obrigatórios." };
    }
     if (data.role === 'clerk' && !data.counterId) {
        return { success: false, message: "Um atendente deve estar associado a um balcão." };
    }
     if (id && !data.password) {
        // Don't update password if it's blank during an edit
        delete (data as Partial<typeof data>).password;
    } else if (!id && !data.password) {
        return { success: false, message: "A senha é obrigatória para novos usuários." };
    }

    try {
      if (id) {
        await updateUser(id, data);
        revalidatePath("/admin/users");
        return { success: true, message: "Usuário atualizado com sucesso!" };
      } else {
        await addUser(data as any); // Cast because password will be defined
        revalidatePath("/admin/users");
        return { success: true, message: "Usuário adicionado com sucesso!" };
      }
    } catch (error) {
       const message = error instanceof Error && error.message.includes('UNIQUE constraint failed')
        ? "Já existe um usuário com este nome de usuário."
        : `Erro ao salvar usuário.`;
      return { success: false, message };
    }
  }

  async function handleDeleteAction(id: string) {
    "use server";
    try {
      await deleteUser(id);
      revalidatePath("/admin/users");
      return { success: true, message: "Usuário excluído com sucesso!" };
    } catch (error) {
      return { success: false, message: "Erro ao excluir usuário." };
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gerenciar Usuários
          </h2>
          <p className="text-muted-foreground">
            Crie, edite e remova usuários do sistema.
          </p>
        </div>
        <UserForm formAction={handleFormAction} counters={counters}>
            <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Usuário
            </Button>
        </UserForm>
      </div>
      <Card>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Balcão Associado</TableHead>
                <TableHead className="w-[180px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                   <TableCell>
                     <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Administrador' : 'Atendente'}
                     </Badge>
                  </TableCell>
                  <TableCell>{user.counterName || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <UserForm
                      initialData={user}
                      counters={counters}
                      formAction={handleFormAction}
                    >
                        <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                        </Button>
                    </UserForm>
                    <DeleteUserDialog 
                      user={user}
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
