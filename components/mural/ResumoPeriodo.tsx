import { Activity, ChevronDown, AlertCircle, BookOpenCheck, CheckCircle2, Users } from "lucide-react";

interface ResumoPeriodoProps {
  estudantesAtivos: any[];
  estudosComLicoes: any[];
  progressoTotal: any[];
  visitasTotais: any[];
  startDate: string;
  endDate: string;
}

export function ResumoPeriodo({
  estudantesAtivos,
  estudosComLicoes,
  progressoTotal,
  visitasTotais,
  startDate,
  endDate
}: ResumoPeriodoProps) {
  
  // 1. LIMITES DE DATAS E CÁLCULO DO PERÍODO
  const anoAtual = new Date().getFullYear();
  const inicioAno = `${anoAtual}-01-01`;
  const fimAno = `${anoAtual}-12-31`;

  const hoje = new Date();
  const trintaDiasAtras = new Date(hoje);
  trintaDiasAtras.setDate(hoje.getDate() - 30);
  const data30Dias = trintaDiasAtras.toISOString().split('T')[0];

  // Calcular a diferença de dias do filtro
  const dtStart = new Date(startDate);
  const dtEnd = new Date(endDate);
  const diferencaTempo = Math.abs(dtEnd.getTime() - dtStart.getTime());
  // Adiciona 1 para incluir o dia final no intervalo (ex: dia 01 a dia 01 = 1 dia)
  const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24)) + 1; 

  // Formatação das datas para exibição completa (DD/MM/YYYY)
  const startFormatado = dtStart.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  const endFormatado = dtEnd.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  // 2. VARIÁVEIS DE CONTAGEM
  let parados30Dias = 0;
  let paradosFiltro = 0;
  let concluidosAno = 0;
  let concluidosFiltro = 0;

  // 3. LÓGICA DE ESTUDOS PARADOS E CONCLUÍDOS (Por Aluno)
  for (const aluno of estudantesAtivos) {
    // Filtra o histórico apenas deste aluno
    const progressoAluno = progressoTotal.filter(p => p.estudante_id === aluno.id);
    
    // Ordena do mais recente para o mais antigo
    progressoAluno.sort((a, b) => new Date(b.data_registro).getTime() - new Date(a.data_registro).getTime());

    // --- PARADOS ---
    const ultimoEstudo = progressoAluno[0];
    
    // Se não tem estudo ou o último foi há mais de 30 dias
    if (!ultimoEstudo || ultimoEstudo.data_registro < data30Dias) {
      parados30Dias++;
    }

    // Se NÃO teve nenhum estudo lançado dentro do período do calendário
    const teveEstudoNoFiltro = progressoAluno.some(p => p.data_registro >= startDate && p.data_registro <= endDate);
    if (!teveEstudoNoFiltro) {
      paradosFiltro++;
    }

    // --- CONCLUÍDOS ---
    const livro = estudosComLicoes.find(e => e.id === aluno.estudo_biblico_id);
    if (livro && livro.licoes && livro.licoes.length > 0) {
      const totalLicoes = livro.licoes.length;
      let maxLicao = 0;
      let dataConclusao = ""; 

      // Descobre qual foi a lição mais alta alcançada e quando
      for (const p of progressoAluno) {
        const licObj = Array.isArray(p.licao) ? p.licao[0] : p.licao;
        if (licObj && licObj.numero_licao >= maxLicao) {
          if (licObj.numero_licao > maxLicao) {
            maxLicao = licObj.numero_licao;
            dataConclusao = p.data_registro;
          } else if (licObj.numero_licao === maxLicao && dataConclusao !== "" && p.data_registro < dataConclusao) {
            // Pega a primeira (mais antiga) vez que bateu a meta máxima
            dataConclusao = p.data_registro; 
          }
        }
      }

      if (maxLicao >= totalLicoes && dataConclusao !== "") {
        if (dataConclusao >= inicioAno && dataConclusao <= fimAno) {
          concluidosAno++;
        }
        if (dataConclusao >= startDate && dataConclusao <= endDate) {
          concluidosFiltro++;
        }
      }
    }
  }

  // 4. LÓGICA DE ESTUDOS REALIZADOS (Total de Lançamentos)
  const realizadosAno = progressoTotal.filter(p => p.data_registro >= inicioAno && p.data_registro <= fimAno).length;
  const realizadosFiltro = progressoTotal.filter(p => p.data_registro >= startDate && p.data_registro <= endDate).length;

  // 5. LÓGICA DE VISITAS
  const visitasAno = visitasTotais.filter(v => v.data_visita >= inicioAno && v.data_visita <= fimAno).length;
  const visitasFiltro = visitasTotais.filter(v => v.data_visita >= startDate && v.data_visita <= endDate).length;

  return (
    <details className="group bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-lg [&_summary::-webkit-details-marker]:hidden">
      <summary className="bg-muted/30 border-b border-border/50 py-2 px-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <div className="flex flex-col">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-foreground drop-shadow-sm leading-none flex items-center gap-2">
              Painel de <span className="text-primary">Indicadores</span>
            </h2>
            <span className="text-[10px] text-muted-foreground font-semibold mt-0.5 sm:mt-1">
              Período selecionado: {startFormatado} a {endFormatado}
            </span>
          </div>
        </div>
        <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform duration-500" />
      </summary>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 md:p-6 bg-background/20">
        
        {/* 1. PARADOS (Vermelho) */}
        <div className="flex flex-col bg-card/80 border border-border/50 rounded-xl overflow-hidden shadow-sm hover:border-destructive/30 transition-colors">
          <div className="bg-destructive/10 border-b border-destructive/20 p-2.5 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-destructive">Estudos Parados</h3>
          </div>
          <div className="flex divide-x divide-border/50 flex-1 p-3">
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-destructive/70 tracking-wider text-center">&gt; 30 Dias</span>
              <span className="text-3xl font-black text-destructive/90">{parados30Dias}</span>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider text-center">
                {diferencaDias} {diferencaDias === 1 ? 'Dia' : 'Dias'}
              </span>
              <span className="text-3xl font-black text-foreground/80">{paradosFiltro}</span>
            </div>
          </div>
        </div>

        {/* 2. REALIZADOS (Azul) */}
        <div className="flex flex-col bg-card/80 border border-border/50 rounded-xl overflow-hidden shadow-sm hover:border-blue-500/30 transition-colors">
          <div className="bg-blue-500/10 border-b border-blue-500/20 p-2.5 flex items-center justify-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-blue-500">Realizados</h3>
          </div>
          <div className="flex divide-x divide-border/50 flex-1 p-3">
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider text-center">Acumulado</span>
              <span className="text-3xl font-black text-blue-500/90">{realizadosAno}</span>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider text-center">
                {diferencaDias} {diferencaDias === 1 ? 'Dia' : 'Dias'}
              </span>
              <span className="text-3xl font-black text-foreground/80">{realizadosFiltro}</span>
            </div>
          </div>
        </div>

        {/* 3. CONCLUÍDOS (Verde) */}
        <div className="flex flex-col bg-card/80 border border-border/50 rounded-xl overflow-hidden shadow-sm hover:border-green-500/30 transition-colors">
          <div className="bg-green-500/10 border-b border-green-500/20 p-2.5 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-green-500">Concluídos</h3>
          </div>
          <div className="flex divide-x divide-border/50 flex-1 p-3">
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider text-center">Acumulado</span>
              <span className="text-3xl font-black text-green-500/90">{concluidosAno}</span>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider text-center">
                {diferencaDias} {diferencaDias === 1 ? 'Dia' : 'Dias'}
              </span>
              <span className="text-3xl font-black text-foreground/80">{concluidosFiltro}</span>
            </div>
          </div>
        </div>

        {/* 4. VISITAS (Dourado/Primary) */}
        <div className="flex flex-col bg-card/80 border border-border/50 rounded-xl overflow-hidden shadow-sm hover:border-primary/30 transition-colors">
          <div className="bg-primary/10 border-b border-primary/20 p-2.5 flex items-center justify-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-primary">Visitas</h3>
          </div>
          <div className="flex divide-x divide-border/50 flex-1 p-3">
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider text-center">Acumulado</span>
              <span className="text-3xl font-black text-primary/90">{visitasAno}</span>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider text-center">
                {diferencaDias} {diferencaDias === 1 ? 'Dia' : 'Dias'}
              </span>
              <span className="text-3xl font-black text-foreground/80">{visitasFiltro}</span>
            </div>
          </div>
        </div>

      </div>
    </details>
  );
}