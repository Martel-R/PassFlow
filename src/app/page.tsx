
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
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/layout/logo";
import { Separator } from "@/components/ui/separator";
import { MonitorPlay, Ticket as TicketIcon, UserCog } from "lucide-react";
import Link from "next/link";
import { usePassFlowActions } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setSession } = usePassFlowActions();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
        setSession(data.session);
        toast({
            title: "Login bem-sucedido!",
            description: `Redirecionando para o painel de ${data.role === 'admin' ? 'administrador' : 'atendente'}.`,
        });
        // router.push is sufficient, middleware will handle the rest
        router.push(data.role === "admin" ? "/admin" : "/clerk");
        router.refresh();
    } else {
         toast({
            title: "Erro de login",
            description: data.message || "Ocorreu um erro ao tentar fazer login.",
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
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                placeholder="Digite seu usuário"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
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
             <div className="flex flex-col gap-2">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button variant="outline" asChild>
                        <Link href="/get-ticket">
                            <TicketIcon />
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
