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
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { mockCategories } from "@/lib/mock-data";

export default function AdminCategoriesPage() {
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
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Categoria
        </Button>
      </div>
      <Card>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID da Categoria</TableHead>
                <TableHead>Nome da Categoria</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-mono">{category.id}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                       <span className="sr-only">Excluir</span>
                    </Button>
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
