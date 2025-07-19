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
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { mockCounters, mockCategories } from "@/lib/mock-data";

export default function AdminCountersPage() {
  const getCategoryName = (categoryId: string) => {
    return mockCategories.find(c => c.id === categoryId)?.name || categoryId;
  };

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
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Balcão
        </Button>
      </div>
      <Card>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Balcão</TableHead>
                <TableHead>Categorias Atendidas</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCounters.map((counter) => (
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
