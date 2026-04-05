import { createClient } from "@/utils/supabase/server";

export interface PelotaoRanking {
  id: string;
  nome: string;
  igreja: string;
  url_imagem_estandarte: string | null;
  pontos7Dias: number;
  pontos14Dias: number;
  pontosTotal: number; // <- Nova propriedade adicionada
}

export async function getRankingPelotoes(): Promise<PelotaoRanking[]> {
  const supabase = await createClient();

  // ==========================================
  // 1. CÁLCULO DE DATAS (Ajustado para Fuso Local e englobando HOJE)
  // ==========================================
  const agora = new Date();
  
  const offset = agora.getTimezoneOffset() * 60000;
  const dataLocal = new Date(agora.getTime() - offset);

  const endDate = dataLocal.toISOString().split('T')[0];

  const data7Dias = new Date(dataLocal);
  data7Dias.setDate(dataLocal.getDate() - 6);
  const startDate7 = data7Dias.toISOString().split('T')[0];

  const data14Dias = new Date(dataLocal);
  data14Dias.setDate(dataLocal.getDate() - 13);
  const startDate14 = data14Dias.toISOString().split('T')[0];

  // ==========================================
  // 2. BUSCA DE DADOS EM PARALELO
  // ==========================================
  const [
    { data: pelotoes },
    { data: duplas },
    { data: estudantes },
    { data: visitas },
    { data: estudos }
  ] = await Promise.all([
    supabase.from("pelotoes").select("id, nome, igreja, url_imagem_estandarte"),
    supabase.from("duplas").select("id, pelotao_id"),
    supabase.from("estudantes").select("id, dupla_id"),
    // Removemos o gte(startDate14) para puxar todo o histórico e calcular o Total
    supabase.from("visitas").select("dupla_id, data_visita").lte("data_visita", endDate),
    supabase.from("progresso_estudo").select("estudante_id, data_registro").lte("data_registro", endDate)
  ]);

  if (!pelotoes) return [];

  // ==========================================
  // 3. MAPEAMENTO DE RELACIONAMENTOS
  // ==========================================
  const duplaToPelotao = new Map<string, string>();
  duplas?.forEach(d => {
    if (d.pelotao_id) duplaToPelotao.set(d.id, d.pelotao_id);
  });

  const estudanteToPelotao = new Map<string, string>();
  estudantes?.forEach(e => {
    const pelotaoId = duplaToPelotao.get(e.dupla_id);
    if (pelotaoId) estudanteToPelotao.set(e.id, pelotaoId);
  });

  const rankingMap = new Map<string, PelotaoRanking>();
  pelotoes.forEach(p => {
    rankingMap.set(p.id, {
      ...p,
      pontos7Dias: 0,
      pontos14Dias: 0,
      pontosTotal: 0 // Inicializa o total zerado
    });
  });

  // ==========================================
  // 4. DISTRIBUIÇÃO DE PONTOS
  // ==========================================
  
  // VISITAS: 1 Ponto cada
  visitas?.forEach(v => {
    const pelotaoId = duplaToPelotao.get(v.dupla_id);
    if (!pelotaoId) return;
    
    const pInfo = rankingMap.get(pelotaoId);
    if (!pInfo) return;

    // Adiciona na pontuação TOTAL (Sempre)
    pInfo.pontosTotal += 1;

    // Se estiver nos últimos 14 dias
    if (v.data_visita >= startDate14) {
      pInfo.pontos14Dias += 1;
    }

    // Se estiver estritamente na semana atual (7 dias)
    if (v.data_visita >= startDate7) {
      pInfo.pontos7Dias += 1;
    }
  });

  // ESTUDOS BÍBLICOS: 2 Pontos cada
  estudos?.forEach(e => {
    const pelotaoId = estudanteToPelotao.get(e.estudante_id);
    if (!pelotaoId) return;

    const pInfo = rankingMap.get(pelotaoId);
    if (!pInfo) return;

    // Adiciona na pontuação TOTAL (Sempre)
    pInfo.pontosTotal += 2;

    // Se estiver nos últimos 14 dias
    if (e.data_registro >= startDate14) {
      pInfo.pontos14Dias += 2;
    }

    // Se estiver estritamente na semana atual (7 dias)
    if (e.data_registro >= startDate7) {
      pInfo.pontos7Dias += 2;
    }
  });

  // ==========================================
  // 5. ORDENAÇÃO DO RANKING
  // ==========================================
  const rankingArray = Array.from(rankingMap.values());

  rankingArray.sort((a, b) => {
    // Prioridade 1: Quem fez mais pontos nos últimos 7 dias
    if (b.pontos7Dias !== a.pontos7Dias) {
      return b.pontos7Dias - a.pontos7Dias;
    }
    
    // Prioridade 2: Desempate pelos últimos 14 dias
    if (b.pontos14Dias !== a.pontos14Dias) {
      return b.pontos14Dias - a.pontos14Dias;
    }

    // Prioridade 3: Desempate por ordem alfabética
    return a.nome.localeCompare(b.nome);
  });

  return rankingArray;
}