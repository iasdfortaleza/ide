"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { login } from "../auth/actions"; // Importando a ação real do servidor

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <Card className="z-10 w-full max-w-sm border-primary/20 bg-card/90 backdrop-blur-md shadow-2xl shadow-primary/5">
        <CardHeader className="flex flex-col items-center space-y-2 pb-6">
          <div className="mb-2 flex items-center justify-center">
            <Image 
              src="/logo/logo-iasd.svg" 
              alt="Logo Igreja Adventista do Sétimo Dia" 
              width={80} 
              height={80} 
              className="w-20 h-20 object-contain drop-shadow-md"
              priority
            />
          </div>
          <div className="flex flex-col items-center text-center space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Mural Missionário
            </CardTitle>
          </div>
          <CardDescription className="text-center text-muted-foreground mt-2">
            Acesse o painel para gerenciar as duplas.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* O form agora usa a action 'login' direto do servidor */}
          <form action={login} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/90">E-mail</Label>
              <Input 
                id="email" 
                name="email" // IMPORTANTE: Adicionado name="email"
                type="email" 
                placeholder="capitao@igreja.com" 
                required 
                className="border-border focus-visible:ring-primary/50 bg-background/50 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/90">Senha</Label>
              <Input 
                id="password"
                name="password" // IMPORTANTE: Adicionado name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required 
                className="border-border focus-visible:ring-primary/50 bg-background/50 transition-colors"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <Checkbox 
                id="showPassword" 
                checked={showPassword}
                onCheckedChange={(checked) => setShowPassword(!!checked)}
                className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <label
                htmlFor="showPassword"
                className="text-sm text-muted-foreground font-normal cursor-pointer select-none"
              >
                Mostrar senha
              </label>
            </div>

            <Button type="submit" className="w-full font-semibold text-primary-foreground shadow-md hover:shadow-primary/25 hover:opacity-90 transition-all">
              Entrar no Sistema
            </Button>

            <div className="pt-4 text-center">
              <Link href="/cadastro" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Não tem uma conta? <span className="font-medium underline underline-offset-4">Cadastre-se</span>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="z-10 mt-10 text-center space-y-3">
        <p className="text-sm font-bold uppercase tracking-widest text-primary drop-shadow-sm">
          Igreja Adventista do Sétimo Dia
        </p>
        <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary/70" />
            <span>Acesso restrito e monitorado. Ambiente seguro.</span>
          </div>
          <p className="text-[10px] opacity-60 mt-1">
            © {new Date().getFullYear()} - Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}