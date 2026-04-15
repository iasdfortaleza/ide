"use client";

import React, { useState } from "react";
import { 
  criarDupla, excluirDupla, editarDupla,
  adicionarMembro, excluirMembro, editarMembro,
  adicionarEstudante, excluirEstudante, editarEstudante
} from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Trash2, Plus, Image as ImageIcon, Shield, UserPlus, BookOpen, Pencil, ArrowLeft, ChevronDown, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

// Definição das props recebidas da página principal
interface DuplasClientProps {
  isMaster: boolean;
  selectedPelotaoId?: string;
  pelotoes: any[];
  pelotoesIds: string[];
  estudos: any[];
  duplas: any[];
}

export default function DuplasClient({
  isMaster,
  selectedPelotaoId,
  pelotoes,
  pelotoesIds,
  estudos,
  duplas
}: DuplasClientProps) {
  const { addToast } = useToast();
  
  // Estado para controlar o Modal de Confirmação
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    isDestructive: false,
    onConfirm: () => {},
  });

  const fecharModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  // Função genérica para executar actions com formulário (criar/editar)
  const executarAcaoForm = async (formData: FormData, actionFn: (fd: FormData) => Promise<{ success: boolean, message: string }>) => {
    const result = await actionFn(formData);
    if (result.success) {
      addToast(result.message, "success");
    } else {
      addToast(result.message, "error");
    }
  };

  // Função genérica para executar actions por ID (excluir)
  const executarAcaoId = async (id: string, actionFn: (id: string) => Promise<{ success: boolean, message: string }>) => {
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
      {/* O Modal invisível que só aparece quando acionado */}
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        isDestructive={modal.isDestructive}
        onConfirm={modal.onConfirm}
        onCancel={fecharModal}
      />

      {/* Cabeçalho com Botão de Voltar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground drop-shadow-sm">Duplas Missionárias</h1>
            <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground mt-1">
              {isMaster ? "Visão Global (Master)" : "Visão do Capitão (Admin)"}
            </p>
          </div>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-2 border-border hover:bg-muted transition-colors bg-card">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
          </Button>
        </Link>
      </div>

      {/* Filtro (Visível Apenas para Master) */}
      {isMaster && (
        <Card className="bg-card/80 border-border backdrop-blur-md shadow-sm">
          <CardContent className="p-4">
            <form method="GET" className="flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1 w-full space-y-1.5">
                <Label htmlFor="pelotao" className="text-muted-foreground font-bold tracking-widest uppercase text-[10px] flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Filtrar por Pelotão
                </Label>
                <select 
                  name="pelotao" 
                  id="pelotao"
                  defaultValue={selectedPelotaoId || ""}
                  className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none transition-colors"
                >
                  <option value="" className="bg-background text-muted-foreground">
                    Visão Global (Todos os Pelotões)
                  </option>
                  {pelotoes?.map(p => (
                    <option key={p.id} value={p.id} className="bg-background text-foreground">
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" variant="default" className="w-full sm:w-auto font-bold shadow-md hover:shadow-primary/25 hover:-translate-y-0.5 transition-all">
                Aplicar Filtro
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: Formulário para Criar Dupla */}
        <div className="lg:col-span-1">
          <Card className="border-border bg-card/80 backdrop-blur-md sticky top-24 shadow-xl">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-xl font-bold">Nova Dupla</CardTitle>
              <CardDescription className="text-muted-foreground">Crie a base da dupla para depois adicionar os membros.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {pelotoesIds.length === 0 ? (
                <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 font-medium">
                  Você precisa de um Pelotão para cadastrar duplas. Se você é Admin, peça ao Master para te vincular a um Pelotão.
                </div>
              ) : (
                <form action={(fd) => executarAcaoForm(fd, criarDupla)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nome_dupla" className="text-foreground/90 font-medium">Nome da Dupla</Label>
                    <Input id="nome_dupla" name="nome_dupla" placeholder="Ex: Dupla Fé e Ação" required className="bg-input border-border focus-visible:ring-primary text-foreground" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pelotao_id" className="text-foreground/90 font-medium">Vincular ao Pelotão</Label>
                    <select 
                      id="pelotao_id" name="pelotao_id" required defaultValue="" 
                      className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground ring-offset-background focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="" disabled className="bg-background text-muted-foreground">Selecione...</option>
                      {pelotoes?.map(p => (
                        <option key={p.id} value={p.id} className="bg-background text-foreground">{p.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="foto" className="text-foreground/90 font-medium">Foto da Dupla (Opcional)</Label>
                    <Input id="foto" name="foto" type="file" accept="image/*" className="cursor-pointer border-border bg-input file:text-primary-foreground file:bg-primary file:border-0 file:rounded hover:file:bg-primary/90 text-foreground" />
                  </div>

                  <Button type="submit" className="w-full mt-4 font-bold text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5">
                    Criar Dupla
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA: Lista de Duplas e Gestão de Membros/Estudantes */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Duplas Ativas <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">{duplas.length}</span>
          </h2>
          
          {duplas.length === 0 ? (
            <div className="p-10 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-card/40">
              <Users className="w-10 h-10 mb-2 opacity-20" />
              <p className="font-medium tracking-wide">Nenhuma dupla encontrada no seu pelotão.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {duplas.map((dupla) => {
                
                const pelotaoObj = Array.isArray(dupla.pelotao) ? dupla.pelotao[0] : dupla.pelotao;
                const nomeDoPelotao = pelotaoObj?.nome || "Sem pelotão";

                return (
                  <details key={dupla.id} className="group border border-border bg-card/80 backdrop-blur-md rounded-xl overflow-hidden shadow-lg [&_summary::-webkit-details-marker]:hidden">
                    
                    {/* CABEÇALHO DO ACORDEÃO (Resumo da Dupla) */}
                    <summary className="bg-muted/10 p-4 border-b border-border flex justify-between items-center cursor-pointer list-none hover:bg-muted/30 transition-colors">
                      
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-secondary relative flex items-center justify-center overflow-hidden border-2 border-primary/40 shrink-0 shadow-sm">
                          {dupla.url_foto_dupla ? (
                            <Image 
                              src={dupla.url_foto_dupla} 
                              alt={dupla.nome_dupla} 
                              fill 
                              sizes="56px"
                              className="object-cover" 
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-secondary-foreground/30" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            {dupla.nome_dupla} 
                          </h3>
                          <p className="text-xs text-primary font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                            <Shield className="w-3.5 h-3.5" /> {nomeDoPelotao}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Botão de excluir a Dupla inteira alterado para type="button" com interceptação */}
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            confirmarExclusao(dupla.id, excluirDupla, "a dupla inteira");
                          }}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded shrink-0 transition-colors" 
                          title="Excluir Dupla Inteira"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <ChevronDown className="w-6 h-6 text-primary group-open:rotate-180 transition-transform duration-500" />
                      </div>
                    </summary>
                    
                    {/* CONTEÚDO QUE SÓ APARECE QUANDO ABERTO */}
                    <div className="flex flex-col">
                      
                      {/* FORMULÁRIO DE EDIÇÃO DA DUPLA */}
                      <div className="p-4 border-b border-border bg-card shadow-inner">
                        <form action={(fd) => executarAcaoForm(fd, editarDupla)} className="flex flex-col gap-3">
                          <input type="hidden" name="id" value={dupla.id} />
                          <input type="hidden" name="foto_atual" value={dupla.url_foto_dupla || ""} />
                          
                          <div className="flex flex-col sm:flex-row gap-3 items-end">
                            <div className="space-y-1 flex-1 w-full">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Nome da Dupla</Label>
                              <Input name="nome_dupla" defaultValue={dupla.nome_dupla} required className="h-9 text-xs bg-input border-border text-foreground focus-visible:ring-primary" />
                            </div>
                            <div className="space-y-1 flex-1 w-full">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pelotão</Label>
                              <select name="pelotao_id" defaultValue={dupla.pelotao_id} required className="flex h-9 w-full rounded-md border border-border bg-input px-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none">
                                {pelotoes?.map(p => <option key={p.id} value={p.id} className="bg-background text-foreground">{p.nome}</option>)}
                              </select>
                            </div>
                            <div className="space-y-1 flex-1 w-full">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Nova Foto</Label>
                              <Input name="foto" type="file" accept="image/*" className="h-9 text-xs bg-input border-border text-foreground file:bg-muted file:text-foreground file:border-0" />
                            </div>
                            <Button type="submit" size="sm" className="h-9 text-xs font-bold w-full sm:w-auto shadow-sm">Salvar Dupla</Button>
                          </div>
                          
                          {/* CHECKBOX DE REMOVER FOTO */}
                          {dupla.url_foto_dupla && (
                            <div className="flex items-center gap-2 mt-2 bg-destructive/10 border border-destructive/20 w-fit px-3 py-1.5 rounded-md">
                              <input type="checkbox" id={`remover_foto_${dupla.id}`} name="remover_foto" value="true" className="w-3.5 h-3.5 accent-destructive cursor-pointer" />
                              <Label htmlFor={`remover_foto_${dupla.id}`} className="text-[10px] uppercase font-bold text-destructive cursor-pointer tracking-wider">
                                Apagar foto atual (Deixar sem foto)
                              </Label>
                            </div>
                          )}
                        </form>
                      </div>

                      {/* CORPO: MEMBROS E ESTUDANTES */}
                      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                        
                        {/* LADO A: MEMBROS DA DUPLA */}
                        <div className="p-4 flex flex-col bg-card/50">
                          <h4 className="text-sm font-black uppercase text-foreground tracking-widest mb-4 flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-primary" /> Componentes ({dupla.membros?.length})
                          </h4>
                          
                          <ul className="space-y-3 mb-4 flex-1">
                            {dupla.membros?.map((membro: any, mIndex: number) => {
                              const bgMembro = mIndex % 2 === 0 ? "bg-background/20" : "bg-muted/10";

                              return (
                                <li key={membro.id} className={`${bgMembro} rounded-lg border border-border/50 flex flex-col group/item relative overflow-hidden shadow-sm`}>
                                  <details className="[&_summary::-webkit-details-marker]:hidden">
                                    <summary className="p-3 flex justify-between items-start cursor-pointer list-none hover:bg-muted/30 transition-colors">
                                      <div className="flex-1 pr-2">
                                        <p className="font-bold text-sm text-foreground/90">{membro.nome}</p>
                                        <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5 font-medium">
                                          <p>Whats: {membro.whatsapp || "N/A"} • Nasc: {membro.data_nascimento ? new Date(membro.data_nascimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : "N/A"}</p>
                                          {membro.endereco && <p className="truncate" title={membro.endereco}>End: {membro.endereco}</p>}
                                        </div>
                                      </div>
                                      <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity items-center">
                                        <Pencil className="w-4 h-4 text-primary" />
                                        {/* Botão de excluir Membro alterado para type="button" com interceptação */}
                                        <button 
                                          type="button" 
                                          onClick={(e) => {
                                            e.preventDefault();
                                            confirmarExclusao(membro.id, excluirMembro, "o membro da dupla");
                                          }}
                                          className="text-destructive hover:scale-110 transition-transform"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </summary>
                                    
                                    <div className="p-3 border-t border-border/50 bg-card cursor-default">
                                      <form action={(fd) => executarAcaoForm(fd, editarMembro)} className="space-y-2.5">
                                        <input type="hidden" name="id" value={membro.id} />
                                        <Input name="nome" defaultValue={membro.nome} required className="h-8 text-xs bg-input border-border text-foreground" placeholder="Nome completo" />
                                        <div className="grid grid-cols-2 gap-2">
                                          <Input name="whatsapp" defaultValue={membro.whatsapp} className="h-8 text-xs bg-input border-border text-foreground" placeholder="WhatsApp" />
                                          <Input name="data_nascimento" type="date" defaultValue={membro.data_nascimento} className="h-8 text-xs bg-input border-border text-foreground" />
                                        </div>
                                        <Input name="endereco" defaultValue={membro.endereco} className="h-8 text-xs bg-input border-border text-foreground" placeholder="Endereço" />
                                        <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs w-full font-bold border border-border">Salvar Alterações</Button>
                                      </form>
                                    </div>
                                  </details>
                                </li>
                              );
                            })}
                          </ul>

                          {/* FORMULÁRIO PARA ADICIONAR MEMBRO */}
                          <form action={(fd) => executarAcaoForm(fd, adicionarMembro)} className="space-y-2.5 mt-auto p-4 bg-muted/5 rounded-lg border border-dashed border-border shadow-inner">
                            <input type="hidden" name="dupla_id" value={dupla.id} />
                            <div className="text-[11px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1 mb-2">
                              <Plus className="w-3.5 h-3.5"/> Novo Componente
                            </div>
                            
                            <Input name="nome" placeholder="Nome completo" required className="h-9 text-xs bg-input border-border text-foreground" />
                            <div className="grid grid-cols-2 gap-2">
                              <Input name="whatsapp" placeholder="WhatsApp" className="h-9 text-xs bg-input border-border text-foreground" />
                              <Input name="data_nascimento" type="date" className="h-9 text-xs bg-input border-border text-foreground" title="Data de Nascimento" />
                            </div>
                            <Input name="endereco" placeholder="Endereço" className="h-9 text-xs bg-input border-border text-foreground" />
                            <Button type="submit" size="sm" className="h-9 px-3 w-full font-bold shadow-sm hover:shadow-primary/25">Adicionar à Dupla</Button>
                          </form>
                        </div>

                        {/* LADO B: ESTUDANTES */}
                        <div className="p-4 flex flex-col bg-primary/5">
                          <h4 className="text-sm font-black uppercase text-primary tracking-widest mb-4 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" /> Estudantes ({dupla.estudantes?.length})
                          </h4>
                          
                          <ul className="space-y-3 mb-4 flex-1">
                            {dupla.estudantes?.map((estudante: any, eIndex: number) => {
                              const bgEstudante = eIndex % 2 === 0 ? "bg-background/30" : "bg-card/40";

                              return (
                                <li key={estudante.id} className={`${bgEstudante} rounded-lg border border-primary/20 flex flex-col group/est relative overflow-hidden shadow-sm`}>
                                  <details className="[&_summary::-webkit-details-marker]:hidden">
                                    <summary className="p-3 flex justify-between items-start cursor-pointer list-none hover:bg-primary/10 transition-colors">
                                      <div className="flex-1 pr-2">
                                        <p className="font-bold text-sm text-foreground/90">{estudante.nome_pessoa}</p>
                                        <p className="text-[10px] text-primary uppercase tracking-widest font-black mt-1">
                                          Livro: {estudante.estudo?.nome_estudo || "Sem material"}
                                        </p>
                                        <div className="text-[10px] text-muted-foreground space-y-0.5 mt-1 font-medium">
                                          <p>Tel: {estudante.telefone || "N/A"} • Nasc: {estudante.data_nascimento ? new Date(estudante.data_nascimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : "N/A"}</p>
                                          {estudante.endereco && <p className="truncate" title={estudante.endereco}>End: {estudante.endereco}</p>}
                                        </div>
                                      </div>
                                      <div className="flex gap-2 opacity-0 group-hover/est:opacity-100 transition-opacity items-center">
                                        <Pencil className="w-4 h-4 text-primary" />
                                        {/* Botão de excluir Estudante alterado para type="button" com interceptação */}
                                        <button 
                                          type="button" 
                                          onClick={(e) => {
                                            e.preventDefault();
                                            confirmarExclusao(estudante.id, excluirEstudante, "o estudante");
                                          }}
                                          className="text-destructive hover:scale-110 transition-transform"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </summary>
                                    
                                    <div className="p-3 border-t border-primary/20 bg-card cursor-default">
                                      <form action={(fd) => executarAcaoForm(fd, editarEstudante)} className="space-y-2.5">
                                        <input type="hidden" name="id" value={estudante.id} />
                                        <Input name="nome_pessoa" defaultValue={estudante.nome_pessoa} required className="h-8 text-xs bg-input border-border text-foreground" placeholder="Nome da Família/Pessoa" />
                                        <select name="estudo_biblico_id" defaultValue={estudante.estudo_biblico_id || ""} className="flex h-8 w-full rounded-md border border-border bg-input px-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none">
                                          <option value="" disabled className="bg-background text-muted-foreground">Escolha o Livro...</option>
                                          {estudos?.map(estudo => <option key={estudo.id} value={estudo.id} className="bg-background text-foreground">{estudo.nome_estudo}</option>)}
                                        </select>
                                        <div className="grid grid-cols-2 gap-2">
                                          <Input name="telefone" defaultValue={estudante.telefone} className="h-8 text-xs bg-input border-border text-foreground" placeholder="Telefone" />
                                          <Input name="data_nascimento" type="date" defaultValue={estudante.data_nascimento} className="h-8 text-xs bg-input border-border text-foreground" />
                                        </div>
                                        <Input name="endereco" defaultValue={estudante.endereco} className="h-8 text-xs bg-input border-border text-foreground" placeholder="Endereço" />
                                        <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs w-full font-bold border border-border text-primary">Salvar Alterações</Button>
                                      </form>
                                    </div>
                                  </details>
                                </li>
                              );
                            })}
                          </ul>

                          {/* FORMULÁRIO PARA ADICIONAR ESTUDANTE */}
                          <form action={(fd) => executarAcaoForm(fd, adicionarEstudante)} className="space-y-2.5 mt-auto p-4 bg-primary/10 rounded-lg border border-dashed border-primary/30 shadow-inner">
                            <input type="hidden" name="dupla_id" value={dupla.id} />
                            <div className="text-[11px] uppercase font-black tracking-widest text-primary flex items-center gap-1 mb-2">
                              <Plus className="w-3.5 h-3.5"/> Novo Estudante/Família
                            </div>

                            <Input name="nome_pessoa" placeholder="Nome do estudante/família" required className="h-9 text-xs bg-input border-primary/20 focus-visible:ring-primary text-foreground" />
                            <select name="estudo_biblico_id" required defaultValue="" className="flex h-9 w-full rounded-md border border-primary/20 bg-input px-2 text-xs focus:ring-2 focus:ring-primary text-foreground focus:outline-none">
                              <option value="" disabled className="bg-background text-muted-foreground">Selecione o Livro base...</option>
                              {estudos?.map(estudo => <option key={estudo.id} value={estudo.id} className="bg-background text-foreground">{estudo.nome_estudo}</option>)}
                            </select>
                            <div className="grid grid-cols-2 gap-2">
                              <Input name="telefone" placeholder="Telefone" className="h-9 text-xs bg-input border-primary/20 text-foreground" />
                              <Input name="data_nascimento" type="date" className="h-9 text-xs bg-input border-primary/20 text-foreground" title="Data de Nascimento" />
                            </div>
                            <Input name="endereco" placeholder="Endereço Completo" className="h-9 text-xs bg-input border-primary/20 text-foreground" />
                            
                            <Button type="submit" size="sm" className="h-9 px-3 w-full font-bold shadow-md hover:shadow-primary/30">Vincular Estudante</Button>
                          </form>
                        </div>

                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}