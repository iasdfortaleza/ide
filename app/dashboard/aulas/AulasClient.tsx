"use client";

import React, { useState, useRef } from "react";
import { adicionarAula, excluirAula } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Video, Trash2, Plus, ArrowLeft, MonitorPlay } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

// Definição das props recebidas da página principal
interface AulasClientProps {
  isMaster: boolean;
  aulas: any[];
}

export default function AulasClient({ isMaster, aulas }: AulasClientProps) {
  const { addToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null); // Referência para limpar o form após sucesso
  
  // Estado para controlar o Modal de Confirmação
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    isDestructive: false,
    onConfirm: () => {},
  });

  const fecharModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  // Função para executar action do formulário (Adicionar)
  const executarAcaoForm = async (formData: FormData, actionFn: any) => {
    const result = await actionFn(formData);
    if (result.success) {
      addToast(result.message, "success");
      formRef.current?.reset(); // Limpa os campos do formulário após sucesso
    } else {
      addToast(result.message, "error");
    }
  };

  // Função para executar action por ID (Excluir)
  const executarAcaoId = async (id: string, actionFn: any) => {
    const result = await actionFn(id);
    if (result.success) {
      addToast(result.message, "success");
    } else {
      addToast(result.message, "error");
    }
  };

  // Função para abrir o Modal antes de excluir algo
  const confirmarExclusao = (id: string, actionFn: any, itemDescricao: string) => {
    setModal({
      isOpen: true,
      title: "Confirmar Exclusão",
      message: `Tem certeza que deseja excluir ${itemDescricao}? Esta ação não pode ser desfeita.`,
      isDestructive: true,
      onConfirm: async () => {
        fecharModal();
        await executarAcaoId(id, actionFn);
      }
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-background min-h-screen text-foreground">
      
      {/* Modal invisível que só aparece quando acionado */}
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        isDestructive={modal.isDestructive}
        onConfirm={modal.onConfirm}
        onCancel={fecharModal}
      />

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MonitorPlay className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground drop-shadow-sm">Centro de Treinamento</h1>
            <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground mt-1">
              {isMaster ? "Gestão de Conteúdo (Master)" : "Capacitação Missionária"}
            </p>
          </div>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-2 border-border hover:bg-muted transition-colors bg-card">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* COLUNA DE CADASTRO (Apenas para Master) */}
        {isMaster && (
          <div className="lg:col-span-1">
            <Card className="border-border bg-card/80 backdrop-blur-md sticky top-24 shadow-xl">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" /> Nova Aula
                </CardTitle>
                <CardDescription className="text-muted-foreground">Adicione vídeos do YouTube para treinar sua equipe.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form ref={formRef} action={(fd) => executarAcaoForm(fd, adicionarAula)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="titulo" className="text-foreground/90 font-medium">Título da Aula</Label>
                    <Input id="titulo" name="titulo" placeholder="Ex: Como abordar uma família" required className="bg-input border-border focus-visible:ring-primary" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="url_youtube" className="text-foreground/90 font-medium">Link do Vídeo (YouTube)</Label>
                    <Input id="url_youtube" name="url_youtube" placeholder="https://www.youtube.com/watch?v=..." required className="bg-input border-border focus-visible:ring-primary" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="descricao" className="text-foreground/90 font-medium">Breve Descrição (Opcional)</Label>
                    <Textarea id="descricao" name="descricao" placeholder="Sobre o que trata este vídeo?" className="bg-input border-border focus-visible:ring-primary resize-none h-24" />
                  </div>

                  <Button type="submit" className="w-full mt-4 font-bold text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5">
                    Cadastrar Aula
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* LISTA DE AULAS */}
        <div className={`${isMaster ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Aulas Disponíveis <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">{aulas?.length || 0}</span>
          </h2>

          {!aulas || aulas.length === 0 ? (
            <div className="p-20 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-card/40">
              <Video className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium tracking-wide">Nenhuma aula cadastrada ainda.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {aulas.map((aula) => (
                <Card key={aula.id} className="group border-border bg-card/60 backdrop-blur-md overflow-hidden shadow-md hover:shadow-primary/10 transition-all border hover:border-primary/30">
                  {/* Miniatura do YouTube */}
                  <div className="relative aspect-video w-full bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${aula.youtube_id}`}
                      title={aula.titulo}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>

                  <CardContent className="p-5 space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-xl text-foreground leading-tight group-hover:text-primary transition-colors">{aula.titulo}</h3>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{aula.descricao || "Sem descrição disponível."}</p>
                      </div>
                      
                      {isMaster && (
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            confirmarExclusao(aula.id, excluirAula, "esta aula");
                          }}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded shrink-0 transition-colors"
                          title="Excluir Aula"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="pt-3 mt-2 border-t border-border/50">
                      <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest">
                        Postado em {new Date(aula.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}