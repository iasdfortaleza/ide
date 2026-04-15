"use client";

import React, { useState, useRef } from "react";
import { criarPelotao, excluirPelotao, editarPelotao } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Trash2, Image as ImageIcon, MapPin, Phone, ArrowLeft, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

// Definição das propriedades recebidas
interface PelotoesClientProps {
  possiveisCapitaes: any[];
  pelotoes: any[];
}

export default function PelotoesClient({ possiveisCapitaes, pelotoes }: PelotoesClientProps) {
  const { addToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  // Estado do Modal
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    isDestructive: false,
    onConfirm: () => {},
  });

  const fecharModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  // Função genérica para interceptar ações de formulário
  const executarAcaoForm = async (formData: FormData, actionFn: any, isCreate = false) => {
    const result = await actionFn(formData);
    if (result.success) {
      addToast(result.message, "success");
      if (isCreate) formRef.current?.reset();
    } else {
      addToast(result.message, "error");
    }
  };

  // Função genérica para interceptar exclusões
  const executarAcaoId = async (id: string, actionFn: any) => {
    const result = await actionFn(id);
    if (result.success) {
      addToast(result.message, "success");
    } else {
      addToast(result.message, "error");
    }
  };

  // Aciona o modal de confirmação
  const confirmarExclusao = (id: string, actionFn: any, itemDescricao: string) => {
    setModal({
      isOpen: true,
      title: "Confirmar Exclusão",
      message: `Tem certeza que deseja excluir ${itemDescricao}? Todas as duplas e componentes vinculados a este pelotão também serão excluídos. Esta ação não pode ser desfeita.`,
      isDestructive: true,
      onConfirm: async () => {
        fecharModal();
        await executarAcaoId(id, actionFn);
      }
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-background min-h-screen text-foreground">
      
      {/* Modal de Confirmação */}
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
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground drop-shadow-sm">Gestão de Pelotões</h1>
            <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground mt-1">Configure os grupos e defina os capitães</p>
          </div>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-2 border-border hover:bg-muted transition-colors bg-card">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: Formulário de Cadastro */}
        <div className="lg:col-span-1">
          <Card className="border-border bg-card/80 backdrop-blur-md sticky top-24 shadow-xl">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-xl font-bold">Novo Pelotão</CardTitle>
              <CardDescription className="text-muted-foreground">Cadastre um novo grupo missionário.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form ref={formRef} action={(fd) => executarAcaoForm(fd, criarPelotao, true)} className="space-y-4">
                
                <div className="space-y-1.5">
                  <Label htmlFor="nome" className="text-foreground/90 font-medium">Nome do Pelotão</Label>
                  <Input id="nome" name="nome" placeholder="Ex: Pelotão Ômega" required className="bg-input border-border text-foreground focus-visible:ring-primary" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="igreja" className="text-foreground/90 font-medium">Igreja (Local/Distrito)</Label>
                  <Input id="igreja" name="igreja" placeholder="Ex: IASD Central" required className="bg-input border-border text-foreground focus-visible:ring-primary" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="capitao_id" className="text-foreground/90 font-medium">Capitão (Perfil Admin)</Label>
                  <select 
                    id="capitao_id" 
                    name="capitao_id" 
                    required
                    defaultValue="" 
                    className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground ring-offset-background focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none"
                  >
                    <option value="" disabled className="bg-background text-muted-foreground">
                      Selecione um capitão...
                    </option>
                    {possiveisCapitaes?.map(capitao => (
                      <option key={capitao.id} value={capitao.id} className="bg-background text-foreground">
                        {capitao.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="whatsapp_capitao" className="text-foreground/90 font-medium">WhatsApp do Capitão</Label>
                  <Input id="whatsapp_capitao" name="whatsapp_capitao" placeholder="(00) 00000-0000" className="bg-input border-border text-foreground focus-visible:ring-primary" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="imagem" className="text-foreground/90 font-medium">Imagem do Estandarte (Opcional)</Label>
                  <Input 
                    id="imagem" 
                    name="imagem" 
                    type="file" 
                    accept="image/*" 
                    className="cursor-pointer border-border bg-input text-foreground file:bg-primary file:text-primary-foreground file:border-0 file:rounded-sm hover:file:bg-primary/90 pt-1.5"
                  />
                </div>

                <Button type="submit" className="w-full mt-4 font-bold text-primary-foreground shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all">
                  Salvar Pelotão
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA: Lista de Pelotões Cadastrados */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Pelotões Ativos <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">{pelotoes?.length || 0}</span>
          </h2>
          
          {pelotoes?.length === 0 ? (
            <div className="p-10 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-card/40">
              <Shield className="w-10 h-10 mb-2 opacity-20" />
              <p className="font-medium tracking-wide">Nenhum pelotão cadastrado ainda.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {pelotoes?.map((pelotao) => (
                <Card key={pelotao.id} className="overflow-hidden border-border bg-card hover:border-primary/50 transition-colors shadow-md flex flex-col hover:shadow-[0_10px_30px_rgba(var(--color-primary),0.1)] hover:-translate-y-1">
                  
                  {/* BANNER DO PELOTÃO */}
                  <div className="h-36 bg-secondary relative w-full flex items-center justify-center overflow-hidden border-b border-border/50 shrink-0">
                    {pelotao.url_imagem_estandarte ? (
                      <Image 
                        src={pelotao.url_imagem_estandarte} 
                        alt={`Estandarte ${pelotao.nome}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover opacity-90 hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-secondary-foreground/30" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-90" />
                    <h3 className="absolute bottom-3 left-4 right-3 text-xl font-black text-foreground drop-shadow-md">
                      {pelotao.nome}
                    </h3>
                  </div>
                  
                  {/* INFORMAÇÕES E AÇÕES */}
                  <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
                    
                    <div className="flex items-center text-sm font-medium text-muted-foreground gap-2">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate">{pelotao.igreja}</span>
                    </div>
                    
                    <div className="bg-input p-3.5 rounded-lg border border-border/50 shadow-inner">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1.5">Capitão</p>
                      <p className="text-sm font-bold text-foreground/90">{pelotao.capitao?.nome || "Sem capitão"}</p>
                      {pelotao.whatsapp_capitao && (
                        <p className="text-xs font-semibold text-primary flex items-center gap-1.5 mt-1.5">
                          <Phone className="w-3.5 h-3.5" /> {pelotao.whatsapp_capitao}
                        </p>
                      )}
                    </div>
                    
                    {/* BOTÕES DE EDIÇÃO E EXCLUSÃO */}
                    <div className="mt-auto space-y-2 pt-4 border-t border-border/50">
                      
                      {/* ACORDEÃO DE EDIÇÃO */}
                      <details className="group/edit [&_summary::-webkit-details-marker]:hidden">
                        <summary className="flex items-center justify-center gap-2 w-full p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-md cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-sm font-bold list-none">
                          <Pencil className="w-4 h-4" /> Editar Pelotão
                        </summary>
                        
                        <div className="pt-4 space-y-3 pb-2">
                          <form action={(fd) => executarAcaoForm(fd, editarPelotao)} className="space-y-3 bg-muted/5 p-4 rounded-lg border border-border/50 shadow-inner">
                            <input type="hidden" name="id" value={pelotao.id} />
                            <input type="hidden" name="imagem_atual" value={pelotao.url_imagem_estandarte || ""} />

                            <div className="space-y-1.5">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Nome</Label>
                              <Input name="nome" defaultValue={pelotao.nome} required className="h-9 text-xs bg-input border-border text-foreground" />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Igreja</Label>
                              <Input name="igreja" defaultValue={pelotao.igreja} required className="h-9 text-xs bg-input border-border text-foreground" />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Capitão</Label>
                              <select 
                                name="capitao_id" 
                                defaultValue={pelotao.capitao_id || ""} 
                                required 
                                className="flex h-9 w-full rounded-md border border-border bg-input px-2 text-xs text-foreground focus:ring-2 focus:ring-primary outline-none"
                              >
                                <option value="" disabled className="bg-background text-muted-foreground">
                                  Selecione um capitão...
                                </option>
                                {possiveisCapitaes?.map(capitao => (
                                  <option key={capitao.id} value={capitao.id} className="bg-background text-foreground">
                                    {capitao.nome}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">WhatsApp</Label>
                              <Input name="whatsapp_capitao" defaultValue={pelotao.whatsapp_capitao || ""} className="h-9 text-xs bg-input border-border text-foreground" />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Nova Imagem</Label>
                              <Input name="imagem" type="file" accept="image/*" className="h-9 text-xs bg-input border-border text-foreground file:bg-muted file:text-foreground file:border-0 file:rounded-sm pt-1.5 cursor-pointer" />
                            </div>

                            {/* CHECKBOX DE REMOVER IMAGEM */}
                            {pelotao.url_imagem_estandarte && (
                              <div className="flex items-center gap-2 mt-2 bg-destructive/10 border border-destructive/20 w-fit px-3 py-1.5 rounded-md">
                                <input type="checkbox" id={`remover_imagem_${pelotao.id}`} name="remover_imagem" value="true" className="w-3.5 h-3.5 accent-destructive cursor-pointer" />
                                <Label htmlFor={`remover_imagem_${pelotao.id}`} className="text-[10px] uppercase font-bold text-destructive cursor-pointer tracking-wider">
                                  Apagar imagem atual
                                </Label>
                              </div>
                            )}

                            <Button type="submit" size="sm" className="h-9 text-xs font-bold w-full mt-3 shadow-sm text-primary-foreground">Salvar Alterações</Button>
                          </form>
                        </div>
                      </details>

                      {/* BOTÃO DE EXCLUIR */}
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          confirmarExclusao(pelotao.id, excluirPelotao, `o pelotão ${pelotao.nome}`);
                        }}
                        className="flex items-center justify-center h-9 w-full gap-2 text-sm font-medium rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Excluir Pelotão
                      </button>
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