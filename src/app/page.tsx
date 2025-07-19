
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Logo } from "@/components/layout/logo";
import { Separator } from "@/components/ui/separator";
import { MonitorPlay, Ticket } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = useState("clerk");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== "1234") {
        toast({
            title: "Erro de autenticação",
            description: "Senha incorreta. A senha é '1234'.",
            variant: "destructive",
        });
        return;
    }

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
    });

    if (res.ok) {
        toast({
            title: "Login bem-sucedido!",
            description: `Redirecionando para o painel de ${role === 'admin' ? 'administrador' : 'atendente'}.`,
        });
        router.push(role === "admin" ? "/admin" : "/clerk");
        router.refresh(); // Important to re-evaluate middleware
    } else {
         toast({
            title: "Erro de login",
            description: "Ocorreu um erro ao tentar fazer login.",
            variant: "destructive",
        });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
               <Logo />
            </div>
            <CardTitle className="text-2xl">Acesso ao Sistema</CardTitle>
            <CardDescription>
              Login para atendentes e administradores.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Perfil</Label>
              <Select onValueChange={setRole} defaultValue={role}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clerk">Atendente</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Senha (use: 1234)" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </CardFooter>
        </form>
        <Separator className="my-4" />
        <CardContent>
          <div className="space-y-4 text-center">
             <p className="text-sm text-muted-foreground">Ou acesse diretamente:</p>
             <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button variant="outline" asChild>
                    <Link href="/get-ticket">
                        <Ticket />
                        <span>Retirar Senha</span>
                    </Link>
                </Button>
                 <Button variant="outline" asChild>
                    <Link href="/display">
                        <MonitorPlay />
                        <span>Tela de Chamada</span>
                    </Link>
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
