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
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { mockServices } from "@/lib/mock-data";

export default function AdminServicesPage() {
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
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Serviço
        </Button>
      </div>
      <Card>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Serviço</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Prefixo da Senha</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        service.category === "priority"
                          ? "default"
                          : "secondary"
                      }
                      className={service.category === 'priority' ? 'bg-primary' : ''}
                    >
                      {service.category === "priority"
                        ? "Prioritário"
                        : "Geral"}
                    </Badge>
                  </TableCell>
                  <TableCell>{service.prefix}</TableCell>
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
