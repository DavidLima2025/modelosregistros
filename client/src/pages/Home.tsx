import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Copy,
  Download,
  Edit2,
  FileText,
  MessageCircle,
  Moon,
  Printer,
  RotateCcw,
  Save,
  Shield,
  Sun,
  Trash2,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Sidebar } from "@/components/Sidebar";
import { FloatingToolbar } from "@/components/FloatingToolbar";

/**
 * Filosofia visual: ferramenta operacional em preto e caqui, inspirada em prancheta policial,
 * priorizando leitura rápida, contraste, navegação lateralizada por modelos e campos condicionais.
 * Cada bloco deve reforçar eficiência, segurança jurídica e sensação institucional sem exageros visuais.
 */
type Genero = "masculino" | "feminino";
type ModoPreenchimento = "rapido" | "completo";

type HistoricoItem = {
  id: string;
  tipo: string;
  nome: string;
  data: string;
  texto: string;
};

type BancoFrequente = {
  pessoas: string[];
  veiculos: string[];
  guarnicoes: string[];
};

type VeiculoComDanos = {
  id: string;
  descricao: string;
  danos: string[];
};

type SinalEmbriaguez = {
  nome: string;
  selecionado: boolean;
};

type RevisaoItem = {
  label: string;
  ok: boolean;
};

type FraseTecnica = {
  titulo: string;
  texto: string;
};

const historicoStorageKey = "bsc-rio-branco-historico-v1";
const bancoStorageKey = "bsc-rio-branco-banco-frequente-v1";
const bibliotecaStorageKey = "bsc-rio-branco-biblioteca-v1";

const provasPadrao = [
  "prints de conversas",
  "comprovante Pix/transferência",
  "fotos dos danos",
  "imagens de câmera",
  "dados de IMEI/aparelho",
  "dados bancários/chave Pix",
  "dados de testemunha",
  "documentos apresentados",
];

const documentosExtravio = [
  "RG (Carteira de Identidade)",
  "CPF",
  "CNH (Carteira de Motorista)",
  "Título de Eleitor",
  "CTPS (Carteira de Trabalho)",
  "Certificado de Reservista",
  "Certidão de Nascimento",
  "Cartão Bancário",
  "Cartão de Saúde/SUS",
  "Cartão de Ônibus",
  "Documento de Veículo (CRLV)",
];

const frasesTecnicasPadrao: FraseTecnica[] = [
  {
    titulo: "Resguardo de direitos",
    texto: "O PRESENTE REGISTRO É REALIZADO PARA FINS DE RESGUARDO DE DIREITOS, DOCUMENTAÇÃO FORMAL DOS FATOS NARRADOS E ADOÇÃO DAS PROVIDÊNCIAS LEGAIS CABÍVEIS.",
  },
  {
    titulo: "Preservação de provas",
    texto: "FOI ORIENTADA A PRESERVAÇÃO DE EVENTUAIS PROVAS, INCLUINDO PRINTS, COMPROVANTES, IMAGENS, VÍDEOS, DADOS DE CONTATO E DEMAIS ELEMENTOS QUE POSSAM AUXILIAR NA APURAÇÃO.",
  },
  {
    titulo: "Sem indícios imediatos",
    texto: "ATÉ O MOMENTO DO ATENDIMENTO, NÃO FORAM APRESENTADOS OUTROS ELEMENTOS QUE PERMITISSEM A IDENTIFICAÇÃO IMEDIATA DE AUTORIA, MATERIALIDADE COMPLEMENTAR OU LOCALIZAÇÃO DO ENVOLVIDO.",
  },
  {
    titulo: "Direitos constitucionais",
    texto: "FORAM RESGUARDADOS OS DIREITOS CONSTITUCIONAIS DO ENVOLVIDO, COM CIÊNCIA QUANTO AO MOTIVO DA INTERVENÇÃO POLICIAL E ENCAMINHAMENTO À AUTORIDADE COMPETENTE.",
  },
  {
    titulo: "Orientação às partes",
    texto: "AS PARTES FORAM ORIENTADAS QUANTO ÀS MEDIDAS LEGAIS CABÍVEIS, BEM COMO SOBRE A POSSIBILIDADE DE COMPLEMENTAÇÃO DAS INFORMAÇÕES PERANTE A AUTORIDADE COMPETENTE.",
  },
  {
    titulo: "Uso proporcional da força",
    texto: "A ATUAÇÃO POLICIAL OBSERVOU OS PRINCÍPIOS DA LEGALIDADE, NECESSIDADE, PROPORCIONALIDADE E MODERAÇÃO, LIMITANDO-SE ÀS MEDIDAS NECESSÁRIAS PARA O CONTROLE DA SITUAÇÃO.",
  },
];

const modelosDiversos = [
  "VIOLÊNCIA DOMÉSTICA",
  "AMEAÇA",
  "DANO",
  "LESÃO CORPORAL",
  "VIAS DE FATO",
  "DESACATO/DESOBEDIÊNCIA",
  "PESSOA DESAPARECIDA",
  "LOCALIZAÇÃO DE PESSOA",
  "OPERAÇÃO BSC",
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("extravio");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [resultado, setResultado] = useState("");
  const [resultadoTipo, setResultadoTipo] = useState("");
  const [resultadoNome, setResultadoNome] = useState("");
  const [modo, setModo] = useState<ModoPreenchimento>("rapido");
  const [temaDark, setTemaDark] = useState(true);
  const [erros, setErros] = useState<string[]>([]);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [plantao, setPlantao] = useState(false);
  const [provasSelecionadas, setProvasSelecionadas] = useState<string[]>([]);
  const [provaOutro, setProvaOutro] = useState("");
  const [temTestemunha, setTemTestemunha] = useState("nao");
  const [testemunhas, setTestemunhas] = useState("");
  const [bancoFreq, setBancoFreq] = useState<BancoFrequente>({ pessoas: [], veiculos: [], guarnicoes: [] });
  const [freqTexto, setFreqTexto] = useState("");
  const [freqTipo, setFreqTipo] = useState<keyof BancoFrequente>("pessoas");
  const [frasesTecnicas, setFrasesTecnicas] = useState<FraseTecnica[]>(frasesTecnicasPadrao);
  const [editandoFrase, setEditandoFrase] = useState<FraseTecnica | null>(null);
  const [apagarFrase, setApagarFrase] = useState<FraseTecnica | null>(null);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novoTexto, setNovoTexto] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [criandoNovoModelo, setCriandoNovoModelo] = useState(false);

  const [localRegistro, setLocalRegistro] = useState("CARTÓRIO DE REGISTRO DE OCORRÊNCIAS POLICIAIS – CROP");
  // RAT - Relatório de Atividades Táticas
  const [ratTipo, setRatTipo] = useState("batida");
  const [ratAbordados, setRatAbordados] = useState("");
  const [ratVeiculosFiscalizados, setRatVeiculosFiscalizados] = useState("");
  const [ratLocalPontoBase, setRatLocalPontoBase] = useState("");
  const [ratReds, setRatReds] = useState("");

  const [comumNome, setComumNome] = useState("");
  const [comumGenero, setComumGenero] = useState<Genero>("masculino");
  const [comumLocal, setComumLocal] = useState("BASE DE SEGURANÇA COMUNITÁRIA RIO BRANCO");
  const [comumDataHora, setComumDataHora] = useState("");

  const [extNome, setExtNome] = useState("");
  const [extGenero, setExtGenero] = useState<Genero>("masculino");
  const [extTipo, setExtTipo] = useState<"documentos" | "objetos">("documentos");
  const [extDocs, setExtDocs] = useState<string[]>([]);
  const [extOutros, setExtOutros] = useState("");
  const [extSabeLocal, setExtSabeLocal] = useState("nao");
  const [extLocal, setExtLocal] = useState("");
  const [extData, setExtData] = useState("");

  const [furNome, setFurNome] = useState("");
  const [furGenero, setFurGenero] = useState<Genero>("masculino");
  const [furTipo, setFurTipo] = useState("FURTO");
  const [furBem, setFurBem] = useState("CELULAR");
  const [furBemOutro, setFurBemOutro] = useState("");
  const [furTemImei, setFurTemImei] = useState("nao");
  const [furModelo, setFurModelo] = useState("");
  const [furImei, setFurImei] = useState("");
  const [furValor, setFurValor] = useState("");
  const [furAutor, setFurAutor] = useState("");
  const [furAutorPreso, setFurAutorPreso] = useState("nao");
  const [furNomeVitima, setFurNomeVitima] = useState("");

  const [furData, setFurData] = useState("");
  const [furHora, setFurHora] = useState("");
  const [furLocalFato, setFurLocalFato] = useState("");
  const [furFormaSubtracao, setFurFormaSubtracao] = useState("");
  const [furPercebeuFato, setFurPercebeuFato] = useState("sim");
  const [furDinamicaFato, setFurDinamicaFato] = useState("");
  const [furCelular, setFurCelular] = useState(false);
  const [furCelularMarca, setFurCelularMarca] = useState("");
  const [furCelularRastreamento, setFurCelularRastreamento] = useState("nao");
  const [furCorrente, setFurCorrente] = useState(false);
  const [furCorrenteMaterial, setFurCorrenteMaterial] = useState("");
  const [furCarteira, setFurCarteira] = useState(false);
  const [furCarteiraConteudo, setFurCarteiraConteudo] = useState("");
  const [furOutrosItens, setFurOutrosItens] = useState("");

  const [esNome, setEsNome] = useState("");
  const [esGenero, setEsGenero] = useState<Genero>("masculino");
  const [esData, setEsData] = useState("");
  const [esMeio, setEsMeio] = useState("TELEFONE");
  const [esAutorId, setEsAutorId] = useState("");
  const [esPretexto, setEsPretexto] = useState("");
  const [esPagou, setEsPagou] = useState("nao");
  const [esTipoPag, setEsTipoPag] = useState("PIX");
  const [esValor, setEsValor] = useState("");
  const [esDestinatario, setEsDestinatario] = useState("");

  const [trLocalRegistro, setTrLocalRegistro] = useState("BASE DE SEGURANÇA COMUNITÁRIA RIO BRANCO");
  const [trSolicitante, setTrSolicitante] = useState("");
  const [trGenero, setTrGenero] = useState<Genero>("masculino");
  const [trData, setTrData] = useState("");
  const [trHora, setTrHora] = useState("");
  const [trVeiculo1, setTrVeiculo1] = useState("");
  const [trVia, setTrVia] = useState("");
  const [trBairro, setTrBairro] = useState("");
  const [trLocalExato, setTrLocalExato] = useState("");
  const [trVeiculo2, setTrVeiculo2] = useState("");
  const [trCondutor2, setTrCondutor2] = useState("");
  const [trVitima, setTrVitima] = useState("nao");
  const [trNomeVitima, setTrNomeVitima] = useState("");
  const [trGeneroVitima, setTrGeneroVitima] = useState<Genero>("masculino");
  const [trLesoes, setTrLesoes] = useState("");
  const [trSocorro, setTrSocorro] = useState("");
  const [trUnidadeSaude, setTrUnidadeSaude] = useState("");
  const [trVitimaDito, setTrVitimaDito] = useState("");
  const [trTemVersaoCondutor2, setTrTemVersaoCondutor2] = useState("nao");
  const [trVeiculos, setTrVeiculos] = useState<VeiculoComDanos[]>([]);
  const [trNovoVeiculo, setTrNovoVeiculo] = useState("");
  const [trNovoDano, setTrNovoDano] = useState("");
  const [trVeiculoSelecionado, setTrVeiculoSelecionado] = useState<string | null>(null);
  const [trTipoSinistro, setTrTipoSinistro] = useState("colisao");
  const [trDinamicaVeiculo1, setTrDinamicaVeiculo1] = useState("trafega-crescente");
  const [trDinamicaVeiculo2, setTrDinamicaVeiculo2] = useState("trafega-decrescente");
  const [trVeiculoEvadiu, setTrVeiculoEvadiu] = useState("nao");
  const [trQualEvadiu, setTrQualEvadiu] = useState("");
  const [trCrimeTransito, setTrCrimeTransito] = useState("nao");
  const [trSinaisEmbriaguez, setTrSinaisEmbriaguez] = useState<SinalEmbriaguez[]>([
    { nome: "Fala arrastada ou enrolada", selecionado: false },
    { nome: "Instabilidade na marcha", selecionado: false },
    { nome: "Incoordenacao motora", selecionado: false },
    { nome: "Alteracoes visuais", selecionado: false },
    { nome: "Sinais faciais (olhos vermelhos, halito com alcool)", selecionado: false },
  ]);
  const [trUsouEtilometro, setTrUsouEtilometro] = useState("nao");
  const [trResultadoEtilometro, setTrResultadoEtilometro] = useState("");
  const [trCondutorQuis, setTrCondutorQuis] = useState("sim");
  const [trVersaoCondutor2, setTrVersaoCondutor2] = useState("");
  const [trPericia, setTrPericia] = useState("nao");
  const [trDanosVeiculos, setTrDanosVeiculos] = useState("");
  const [trPartesLocal, setTrPartesLocal] = useState("sim");

  const [prGuarnicao, setPrGuarnicao] = useState("");
  const [prComposicao, setPrComposicao] = useState("");
  const [prNumeroProcesso, setPrNumeroProcesso] = useState("");
  const [prDadosProcesso, setPrDadosProcesso] = useState("");
  const [prTemCameras, setPrTemCameras] = useState("sim");
  const [prNumeroCamera, setPrNumeroCamera] = useState("");

  const [prRuaRastreamento, setPrRuaRastreamento] = useState("");
  const [prNomeSuspeito, setPrNomeSuspeito] = useState("");
  const [prGeneroSuspeito, setPrGeneroSuspeito] = useState<Genero>("masculino");
  const [prResistencia, setPrResistencia] = useState("nao");
  const [prResDesc, setPrResDesc] = useState("");
  const [prUsouIMPO, setPrUsouIMPO] = useState("nao");
  const [prTipoIMPO, setPrTipoIMPO] = useState("espargidor de agente químico OC");
  const [prMilitarIMPO, setPrMilitarIMPO] = useState("");
  const [prRegiaoAtingida, setPrRegiaoAtingida] = useState("");
  const [prTemLesao, setPrTemLesao] = useState("nao");
  const [prDescLesao, setPrDescLesao] = useState("");
  const [prUnidadeSaudePrisao, setPrUnidadeSaudePrisao] = useState("");
  const [prNumeroFicha, setPrNumeroFicha] = useState("");

  const [prEncaminhamento, setPrEncaminhamento] = useState("DEPLAN 2");

  const [divTipo, setDivTipo] = useState("VIOLÊNCIA DOMÉSTICA");
  const [divNome, setDivNome] = useState("");
  const [divGenero, setDivGenero] = useState<Genero>("feminino");
  const [divAutorNome, setDivAutorNome] = useState("");
  const [divAutorGenero, setDivAutorGenero] = useState<Genero>("masculino");
  const [divLocal, setDivLocal] = useState("");
  const [divDataHora, setDivDataHora] = useState("");
  const [divRelato, setDivRelato] = useState("");
  const [divTemAutorPreso, setDivTemAutorPreso] = useState("nao");
  const [divProvidencias, setDivProvidencias] = useState("");

  // Furto/Roubo Imediato
  const [friPrefixo, setFriPrefixo] = useState("");
  const [friMilitares, setFriMilitares] = useState("");
  const [friBloco, setFriBloco] = useState("");
  const [friFormaConhecimento, setFriFormaConhecimento] = useState("RECEBEU INFORMACOES DE TRANSEUNTES");
  const [friDetalhesConhecimento, setFriDetalhesConhecimento] = useState("");
  const [friNomeVitima, setFriNomeVitima] = useState("");
  const [friGeneroVitima, setFriGeneroVitima] = useState<Genero>("masculino");
  const [friHistoricoVitima, setFriHistoricoVitima] = useState("");
  const [friTipoBem, setFriTipoBem] = useState("CELULAR");
  const [friRastreamentoCelular, setFriRastreamentoCelular] = useState("nao");
  const [friDadosAparelho, setFriDadosAparelho] = useState("nao");
  const [friImei, setFriImei] = useState("");
  const [friMarcaModelo, setFriMarcaModelo] = useState("");
  const [friLocalDestino, setFriLocalDestino] = useState("CROP 6 BASE POSTO DE ATENDIMENTO");
  const [friTemAutor, setFriTemAutor] = useState("nao");
  const [friNomeAutor, setFriNomeAutor] = useState("");
  const [friGeneroAutor, setFriGeneroAutor] = useState<Genero>("masculino");
  const [friDeclaracaoAutor, setFriDeclaracaoAutor] = useState("");
  const [friAbordagemPolicial, setFriAbordagemPolicial] = useState("");
  const [friDelegacia, setFriDelegacia] = useState("DEPLAN 2");

  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(historicoStorageKey);
      if (salvo) setHistorico(JSON.parse(salvo) as HistoricoItem[]);
    } catch {
      setHistorico([]);
    }

    try {
      const bancoSalvo = window.localStorage.getItem(bancoStorageKey);
      if (bancoSalvo) setBancoFreq(JSON.parse(bancoSalvo) as BancoFrequente);
    } catch {
      setBancoFreq({ pessoas: [], veiculos: [], guarnicoes: [] });
    }

    try {
      const bibliotecaSalva = window.localStorage.getItem(bibliotecaStorageKey);
      if (bibliotecaSalva) setFrasesTecnicas(JSON.parse(bibliotecaSalva) as FraseTecnica[]);
    } catch {
      setFrasesTecnicas(frasesTecnicasPadrao);
    }
  }, []);

  useEffect(() => {
    setResultado("");
    setResultadoTipo("");
    setResultadoNome("");
  }, [activeTab]);

  const artigo = (genero: Genero) => (genero === "feminino" ? "A" : "O");
  const senhor = (genero: Genero) => (genero === "feminino" ? "SENHORA" : "SENHOR");
  const orientado = (genero: Genero) => (genero === "feminino" ? "ORIENTADA" : "ORIENTADO");
  const conduzido = (genero: Genero) => (genero === "feminino" ? "CONDUZIDA" : "CONDUZIDO");
  const preso = (genero: Genero) => (genero === "feminino" ? "PRESA" : "PRESO");
  const vitimaTermo = (genero: Genero) => `${artigo(genero)} ${senhor(genero)}`;
  const upper = (valor: string, fallback = "NÃO INFORMADO") => (valor.trim() ? valor.trim().toUpperCase() : fallback);
  const plural = (quantidade: number, singular: string, pluralTexto: string) => (quantidade === 1 ? singular : pluralTexto);

  const salvarBiblioteca = (novasBiblioteca: FraseTecnica[]) => {
    setFrasesTecnicas(novasBiblioteca);
    window.localStorage.setItem(bibliotecaStorageKey, JSON.stringify(novasBiblioteca));
  };

  const editarFrase = (frase: FraseTecnica) => {
    setEditandoFrase(frase);
    setNovoTitulo(frase.titulo);
    setNovoTexto(frase.texto);
    setDialogAberto(true);
  };

  const salvarEdicao = () => {
    if (!editandoFrase || !novoTitulo.trim() || !novoTexto.trim()) return;
    const atualizado = frasesTecnicas.map((f) =>
      f.titulo === editandoFrase.titulo ? { titulo: novoTitulo, texto: novoTexto } : f
    );
    salvarBiblioteca(atualizado);
    setEditandoFrase(null);
    setNovoTitulo("");
    setNovoTexto("");
    setDialogAberto(false);
  };

  const confirmarDelecao = () => {
    if (!apagarFrase) return;
    try {
      const atualizado = frasesTecnicas.filter((f) => f.titulo !== apagarFrase.titulo);
      salvarBiblioteca(atualizado);
      setApagarFrase(null);
      toast.success("✓ Modelo deletado com sucesso!");
    } catch (error) {
      toast.error("✗ Erro ao deletar modelo. Tente novamente.");
    }
  };

  const iniciarCriacaoModelo = () => {
    setCriandoNovoModelo(true);
    setEditandoFrase(null);
    setNovoTitulo("");
    setNovoTexto("");
    setDialogAberto(true);
  };

  const salvarNovoModelo = () => {
    if (!novoTitulo.trim() || !novoTexto.trim()) return;
    const novoModelo: FraseTecnica = { titulo: novoTitulo, texto: novoTexto };
    const atualizado = [...frasesTecnicas, novoModelo];
    salvarBiblioteca(atualizado);
    setCriandoNovoModelo(false);
    setNovoTitulo("");
    setNovoTexto("");
    setDialogAberto(false);
  };

  const toggleProva = (prova: string) => {
    setProvasSelecionadas((prev) => (prev.includes(prova) ? prev.filter((item) => item !== prova) : [...prev, prova]));
  };

  const formatarLista = (itens: string[]) => {
    const limpos = itens.map((item) => item.trim()).filter(Boolean);
    if (limpos.length === 0) return "";
    if (limpos.length === 1) return limpos[0].toUpperCase();
    return `${limpos.slice(0, -1).join(", ").toUpperCase()} E ${limpos[limpos.length - 1].toUpperCase()}`;
  };

  const complementoProvasETestemunhas = () => {
    const provas = [...provasSelecionadas, ...(provaOutro.trim() ? [provaOutro.trim()] : [])];
    const partes: string[] = [];

    if (provas.length > 0) {
      partes.push(`FORAM INDICADOS/APRESENTADOS OS SEGUINTES ELEMENTOS PARA SUBSIDIAR A DOCUMENTAÇÃO E EVENTUAL APURAÇÃO: ${formatarLista(provas)}.`);
    }

    if (temTestemunha === "sim" && testemunhas.trim()) {
      partes.push(`FOI INFORMADA A EXISTÊNCIA DE TESTEMUNHA(S), COM OS SEGUINTES DADOS/REFERÊNCIAS: ${upper(testemunhas)}.`);
    }

    return partes.length ? `\n\n${partes.join("\n\n")}` : "";
  };

  const montarCabecalhoInstitucional = (tipo = resultadoTipo, nome = resultadoNome) => {
    const data = new Date().toLocaleString("pt-BR");
    return [
      "BASE DE SEGURANÇA COMUNITÁRIA RIO BRANCO",
      "REGISTRO OPERACIONAL / HISTÓRICO POLICIAL",
      `NATUREZA/MODELO: ${upper(tipo, "NÃO INFORMADO")}`,
      `PESSOA PRINCIPAL: ${upper(nome, "NÃO INFORMADA")}`,
      `DATA/HORA DA GERAÇÃO: ${data}`,
      "UNIDADE: BSC RIO BRANCO",
    ].join("\n");
  };

  const salvarBancoFrequente = (novoBanco: BancoFrequente) => {
    setBancoFreq(novoBanco);
    window.localStorage.setItem(bancoStorageKey, JSON.stringify(novoBanco));
  };

  const adicionarFrequente = () => {
    const valor = freqTexto.trim();
    if (!valor) return;
    const lista = bancoFreq[freqTipo];
    const atualizado = {
      ...bancoFreq,
      [freqTipo]: [valor, ...lista.filter((item) => item.toLowerCase() !== valor.toLowerCase())].slice(0, 12),
    } as BancoFrequente;
    salvarBancoFrequente(atualizado);
    setFreqTexto("");
  };

  const removerFrequente = (tipo: keyof BancoFrequente, valor: string) => {
    salvarBancoFrequente({ ...bancoFreq, [tipo]: bancoFreq[tipo].filter((item) => item !== valor) });
  };

  const aplicarFrequente = (valor: string) => {
    if (freqTipo === "pessoas") setComumNome(valor);
    if (freqTipo === "veiculos") {
      if (activeTab === "transito") setTrVeiculo1(valor);
      else setComumLocal(valor);
    }
    if (freqTipo === "guarnicoes") setPrComposicao(valor);
  };

  const salvarHistorico = (tipo: string, nome: string, texto: string) => {
    const item: HistoricoItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      tipo,
      nome: nome || "NÃO INFORMADO",
      data: new Date().toLocaleString("pt-BR"),
      texto,
    };
    const atualizado = [item, ...historico].slice(0, 40);
    setHistorico(atualizado);
    window.localStorage.setItem(historicoStorageKey, JSON.stringify(atualizado));
  };

  const gerarRat = () => {
    let texto = "";
    
    if (ratTipo === "batida") {
      texto = `REALIZAMOS A OPERAÇÃO BATIDA POLICIAL, NOS LOCAIS DE GRANDE CONCENTRAÇÃO DE PESSOAS EM SITUAÇÃO DE RUA, COM A FINALIDADE DE PROMOVER SENSAÇÃO DE SEGURANÇA À POPULAÇÃO E COMERCIANTES LOCAIS. A OPERAÇÃO VISOU COIBIR E INIBIR DELITOS DE MAIOR OU MENOR POTENCIAL OFENSIVO QUE PORVENTURA PUDESSE VIR A OCORRER.

ABORDADOS:
${ratAbordados || "- NENHUM ABORDADO REGISTRADO"}

A OPERAÇÃO TRANSCORREU SEM ALTERAÇÕES.`;
    } else if (ratTipo === "blitz") {
      texto = `EM DECORRÊNCIA AO PLANO DE OCUPAÇÃO NPH, FOI REALIZADA OPERAÇÃO POLICIAL VOLTADA À FISCALIZAÇÃO DE MOTOCICLETAS, COM O OBJETIVO DE PROMOVER A SENSAÇÃO DE SEGURANÇA À POPULAÇÃO NO TRÂNSITO LOCAL E, QUANDO NECESSÁRIO, REALIZAR AÇÕES REPRESSIVAS.

VEÍCULOS FISCALIZADOS:
${ratVeiculosFiscalizados || "- NENHUM VEÍCULO FISCALIZADO"}

A OPERAÇÃO TRANSCORREU SEM ALTERAÇÕES.`;
    } else if (ratTipo === "presenca") {
      texto = `EM DECORRÊNCIA AO PLANO DE OCUPAÇÃO NPH, FOI REALIZADA A OPERAÇÃO PRESENÇA REALIZANDO PONTO BASE DE FORMA OSTENSIVA E VISÍVEL EM ATENÇÃO AO PLANO DE OCUPAÇÃO NPH, NOS LOCAIS DE GRANDE CONCENTRAÇÃO DE PESSOAS EM SITUAÇÃO DE RUA, COM A FINALIDADE DE PROMOVER SENSAÇÃO DE SEGURANÇA À POPULAÇÃO E COMERCIANTES LOCAIS. A OPERAÇÃO VISOU COIBIR E INIBIR DELITOS DE MAIOR OU MENOR POTENCIAL OFENSIVO QUE PORVENTURA PUDESSE VIR A OCORRER.

LOCAL DE PONTO BASE:
${ratLocalPontoBase || "- LOCAL NÃO INFORMADO"}

A OPERAÇÃO TRANSCORREU SEM ALTERAÇÕES.`;
    } else if (ratTipo === "bsc") {
      texto = `DURANTE TURNO DE SERVIÇO NA BASE COMUNITÁRIA MÓVEL DA PRAÇA RIO BRANCO, ALÉM DA PROMOÇÃO DA SEGURANÇA PÚBLICA, PAZ SOCIAL, E ATENDIMENTO À SOCIEDADE, NA DATA DE HOJE FORAM REGISTRADOS OS SEGUINTES REDS:

${ratReds || ""}

SEM MAIS, REGISTRA-SE.`;
    }
    
    finalizarGeracao("RAT", "", texto);
  };

  const finalizarGeracao = (tipo: string, nome: string, texto: string) => {
    try {
      const textoFinal = `${texto.trim()}${complementoProvasETestemunhas()}`.toUpperCase();
      setResultado(textoFinal);
      setResultadoTipo(tipo);
      setResultadoNome(nome || "NÃO INFORMADO");
      setErros([]);
      salvarHistorico(tipo, nome, textoFinal);
      toast.success(`✓ Histórico de ${tipo} gerado com sucesso!`);
    } catch (error) {
      toast.error("✗ Erro ao gerar histórico. Tente novamente.");
    }
  };

  const validar = (campos: Array<[string, string | string[]]>) => {
    const pendencias = campos
      .filter(([, valor]) => (Array.isArray(valor) ? valor.length === 0 : !valor.trim()))
      .map(([nome]) => nome);
    setErros(pendencias);
    return pendencias.length === 0;
  };

  const aplicarDadosComuns = () => {
    const nome = comumNome;
    const genero = comumGenero;
    const local = comumLocal;
    const dataHora = comumDataHora;

    if (activeTab === "extravio") {
      setExtNome(nome);
      setExtGenero(genero);
      setExtLocal(local);
      setExtData(dataHora);
    }
    if (activeTab === "furto") {
      setFurNome(nome);
      setFurGenero(genero);
    }
    if (activeTab === "estelionato") {
      setEsNome(nome);
      setEsGenero(genero);
      setEsData(dataHora);
    }
    if (activeTab === "transito") {
      setTrSolicitante(nome);
      setTrGenero(genero);
      setTrLocalRegistro(local);
      setTrData(dataHora);
    }
    if (activeTab === "prisao") {
      setPrNomeSuspeito(nome);
      setPrGeneroSuspeito(genero);
      setPrRuaRastreamento(local);
    }
    if (activeTab === "diversos") {
      setDivNome(nome);
      setDivGenero(genero);
      setDivLocal(local);
      setDivDataHora(dataHora);
    }
  };

  const toggleDoc = (doc: string) => {
    setExtDocs((prev) => (prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]));
  };

  const gerarExtravio = () => {
    if (extTipo === "objetos") {
      const docs = [...extDocs, ...(extOutros.trim() ? [extOutros.trim()] : [])];
      if (docs.length === 0) {
        setErros(["Objetos extraviados"]);
        return;
      }

      const qtd = docs.length;
      const tipoItem = qtd === 1 ? "OBJETO" : "OBJETOS";
      const extraviado = qtd === 1 ? "EXTRAVIADO" : "EXTRAVIADOS";
      const foi = qtd === 1 ? "FOI" : "FORAM";
      const referido = qtd === 1 ? "REFERIDO" : "REFERIDOS";
      const item = qtd === 1 ? "ITEM" : "ITENS";

      let texto = `EM ATENDIMENTO NA ${localRegistro}, COMPARECEU SENHOR NÃO INFORMADO, RELATANDO QUE TEVE SEU${qtd === 1 ? "" : "S"} ${tipoItem} ${qtd === 1 ? "PESSOAL" : "PESSOAIS"} ${extraviado}.

`;

      if (extSabeLocal === "sim") {
        texto += `SEGUNDO O SOLICITANTE, O EXTRAVIO TERIA OCORRIDO ${extData.toUpperCase() || "EM DATA/HORÁRIO NÃO PRECISADO"}, NAS IMEDIAÇÕES DE ${extLocal.toUpperCase() || "LOCAL NÃO PRECISADO"}. INFORMOU NÃO HAVER, A PRINCÍPIO, INDÍCIOS DE SUBTRAÇÃO, VIOLÊNCIA, GRAVE AMEAÇA OU OUTRA AÇÃO CRIMINOSA DIRETA, TRATANDO-SE DE POSSÍVEL EXTRAVIO.

`;
      } else {
        texto += `SEGUNDO O SOLICITANTE, NÃO SOUBE PRECISAR O LOCAL, A DATA OU O MOMENTO EXATO EM QUE OCORREU O EXTRAVIO, NÃO HAVENDO INDÍCIOS, A PRINCÍPIO, DE AÇÃO CRIMINOSA.

`;
      }

      texto += `INFORMOU QUE ${foi} ${extraviado} O${qtd === 1 ? "" : "S"} SEGUINTE${qtd === 1 ? "" : "S"} ${item}: ${docs.join(", ").toUpperCase()}.

RELATA AINDA QUE, ATÉ O MOMENTO, NÃO POSSUI INFORMAÇÕES SOBRE O PARADEIRO DO${qtd === 1 ? "" : "S"} ${referido} ${item}. DIANTE DOS FATOS, O SOLICITANTE BUSCOU O PRESENTE REGISTRO PARA FINS DE RESGUARDO DE DIREITOS E PREVENÇÃO CONTRA EVENTUAL USO INDEVIDO DE SEUS DADOS PESSOAIS.`;

      finalizarGeracao("Extravio", "NÃO INFORMADO", texto);
    } else {
      const docs = [...extDocs, ...(extOutros.trim() ? [extOutros.trim()] : [])];

      const solicitante = `${artigo(extGenero)} SOLICITANTE`;
      const qtd = docs.length;
      const item = plural(qtd, "ITEM", "ITENS");
      const documento = plural(qtd, "DOCUMENTO", "DOCUMENTOS");
      const extraviado = plural(qtd, "EXTRAVIADO", "EXTRAVIADOS");
      const referido = plural(qtd, "REFERIDO", "REFERIDOS");
      const foiForam = plural(qtd, "FOI", "FORAM");
      const pessoal = plural(qtd, "PESSOAL", "PESSOAIS");

      let texto = `EM ATENDIMENTO NA ${localRegistro}, COMPARECEU ${senhor(extGenero)} ${upper(extNome)}, RELATANDO QUE TEVE ${qtd === 1 ? "SEU" : "SEUS"} ${documento} ${pessoal} ${extraviado}.\n\n`;

      if (extSabeLocal === "sim") {
        texto += `SEGUNDO ${solicitante}, O EXTRAVIO TERIA OCORRIDO ${upper(extData, "EM DATA/HORÁRIO NÃO PRECISADO")}, NAS IMEDIAÇÕES DE ${upper(extLocal, "LOCAL NÃO PRECISADO")}. INFORMOU NÃO HAVER, A PRINCÍPIO, INDÍCIOS DE SUBTRAÇÃO, VIOLÊNCIA, GRAVE AMEAÇA OU OUTRA AÇÃO CRIMINOSA DIRETA, TRATANDO-SE DE POSSÍVEL EXTRAVIO.\n\n`;
      } else {
        texto += `SEGUNDO ${solicitante}, NÃO SOUBE PRECISAR O LOCAL, A DATA OU O MOMENTO EXATO EM QUE OCORREU O EXTRAVIO, NÃO HAVENDO INDÍCIOS, A PRINCÍPIO, DE AÇÃO CRIMINOSA.\n\n`;
      }

      texto += `INFORMOU QUE ${foiForam} ${extraviado} ${qtd === 1 ? "O SEGUINTE" : "OS SEGUINTES"} ${item}: ${docs.join(", ").toUpperCase()}.\n\n`;
      texto += `RELATA AINDA QUE, ATÉ O MOMENTO, NÃO POSSUI INFORMAÇÕES SOBRE O PARADEIRO ${qtd === 1 ? "DO" : "DOS"} ${referido} ${item}. DIANTE DOS FATOS, ${solicitante} BUSCOU O PRESENTE REGISTRO PARA FINS DE RESGUARDO DE DIREITOS E PREVENÇÃO CONTRA EVENTUAL USO INDEVIDO DE SEUS DADOS PESSOAIS.`;

      finalizarGeracao("Extravio", extNome, texto);
    }
  };

  const descricaoBemFurto = () => {
    if (furBem === "OUTROS") return upper(furBemOutro, "BEM NÃO ESPECIFICADO");
    if (furBem === "CORRENTE") return "CORRENTE/SEMELHANTE A OURO";
    if (furBem === "CELULAR") return "TELEFONE CELULAR";
    return furBem;
  };

  const gerarFurto = () => {

    const vitima = `${artigo(furGenero)} VÍTIMA`;
    let texto = `EM ATENDIMENTO Á ${upper(localRegistro)}, COMPARECEU ${vitimaTermo(furGenero)} ${upper(furNomeVitima)}, RELATANDO QUE FOI VITIMA DE FURTO.\n\n`;
    
    texto += `SEGUNDO A VÍTIMA, NO DIA ${upper(furData)}, POR VOLTA DE ${upper(furHora)}, ENCONTRAVA-SE EM ${upper(furLocalFato)}, QUANDO ${upper(furFormaSubtracao)}.\n\n`;
    
    if (furPercebeuFato === "nao") {
      texto += `RELATA QUE SOMENTE PERCEBEU O FATO POSTERIORMENTE, AO NOTAR A AUSÊNCIA DE SEUS PERTENCES, NÃO SABENDO INFORMAR A DINÂMICA DA AÇÃO NEM IDENTIFICAR POSSÍVEL AUTOR.\n\n`;
    } else {
      texto += `${vitima} RELATA QUE ${upper(furDinamicaFato)}.\n\n`;
    }
    
    let itensSubtraidos = [];
    if (furCelular) {
      itensSubtraidos.push(`um aparelho celular ${furCelularMarca.trim() ? `[${upper(furCelularMarca)}]` : "[marca/modelo/cor não informado]"}`);
    }
    if (furCorrente) {
      itensSubtraidos.push(`uma corrente/correntinha ${furCorrenteMaterial.trim() ? `[${upper(furCorrenteMaterial)}]` : "[material não informado]"}`);
    }
    if (furCarteira) {
      itensSubtraidos.push(`uma carteira ${furCarteiraConteudo.trim() ? `contendo ${upper(furCarteiraConteudo)}` : "[conteúdo não especificado]"}`);
    }
    if (furOutrosItens.trim()) {
      itensSubtraidos.push(`além de ${upper(furOutrosItens)}`);
    }
    
    if (itensSubtraidos.length > 0) {
      texto += `INFORMOU QUE FORAM SUBTRAÍDOS OS SEGUINTES OBJETOS: ${itensSubtraidos.join(", ")}.\n\n`;
    }
    
    if (furCelular && furCelularRastreamento === "sim") {
      texto += `FOI REALIZADA A TENTATIVA DE RASTREAMENTO DO APARELHO CELULAR DA VITIMA QUE FOI ${orientado(furGenero)} QUANTO AOS PROCEDIMENTOS DE BLOQUEIO DO IMEI A OPERADORA BEM COMO UTILIZAR APLICATIVOS DE RASTREIO (GOOGLE ENCONTRE MEU DISPOSITIVO OU BUSCAR IPHONE) PARA FUTUROS RASTREAMENTOS.\n\n`;
    }
    
    texto += `DIANTE DOS FATOS, A VÍTIMA BUSCOU O PRESENTE REGISTRO PARA FINS DE RESGUARDO DE DIREITOS.\n\n`;
    texto += `A VÍTIMA FOI DEVIDAMENTE ${orientado(furGenero)} QUANTO ÀS MEDIDAS LEGAIS CABÍVEIS.`;
    
    finalizarGeracao("Furto/Roubo", furNomeVitima, texto);
  };

  const gerarFurtoRouboImediato = () => {

    const vitima = `${artigo(friGeneroVitima)} VITIMA`;
    const bem = friTipoBem === "CELULAR" ? "CELULAR" : friTipoBem === "CORRENTINHA" ? "CORRENTINHA/CORRENTE" : friTipoBem === "CARTEIRA" ? "CARTEIRA" : friTipoBem === "MALA" ? "MALA/BOLSA" : "BEM";
    
    let texto = `A EQUIPE POLICIAL ${upper(friPrefixo)}, COMPOSTA PELOS MILITARES ${upper(friMilitares)}, ESTAVAM REALIZANDO PATRULHAMENTO NAS IMEDIAÇÕES DA ${upper(friDetalhesConhecimento)}, COM O OBJETIVO DE PREVENIR E REPRIMIR CRIMES CONTRA O PATRIMONIO. A ACAO FOI DESENVOLVIDA COM BASE EM ROTAS TRACADAS E PLANEJADAS DE ACORDO COM DADOS ESTATISTICOS.\n\n`;
    
    texto += `DADO MOMENTO A GUARNICIO ${upper(friFormaConhecimento, "RECEBEU INFORMACOES")}${friDetalhesConhecimento.trim() ? ` DE QUE NO LOCAL ${upper(friDetalhesConhecimento)}` : ""}.\n\n`;
    
    texto += `FOI REALIZADO CONTATO COM ${vitima} ${upper(friNomeVitima)}, QUE SEGUNDO DECLARACOES ${upper(friHistoricoVitima)}.\n\n`;
    
    if (friTipoBem === "CELULAR" && friRastreamentoCelular === "sim") {
      texto += `FOI REALIZADA A TENTATIVA DE RASTREAMENTO DO APARELHO CELULAR DA VITIMA QUE FOI ${orientado(friGeneroVitima)} QUANTO AOS PROCEDIMENTOS DE BLOQUEIO DO IMEI A OPERADORA BEM COMO UTILIZAR APLICATIVOS DE RASTREIO (GOOGLE ENCONTRE MEU DISPOSITIVO OU BUSCAR IPHONE) PARA FUTUROS RASTREAMENTOS.\n\n`;
      
      if (friDadosAparelho === "sim") {
        texto += `DADOS DO APARELHO: IMEI: ${upper(friImei, "NAO INFORMADO")}, MARCA/MODELO: ${upper(friMarcaModelo, "NAO INFORMADO")}.\n\n`;
      }
    }
    
    if (friTemAutor === "sim") {
      if (friAbordagemPolicial.trim()) {
        texto += `${upper(friAbordagemPolicial)}.\n\n`;
      }
      texto += `DADO A PALAVRA AO AUTOR, APOS INFORMADO O DIREITO A NAO AUTO INCRIMINACAO, ESTE DECLAROU QUE ${upper(friDeclaracaoAutor)}.\n\n`;
      texto += `PORTANTO, FOI DADA VOZ DE PRISAO AO AUTOR ${upper(friNomeAutor)} POR FURTO SENDO RESGUARDADOS SEUS DIREITOS CONSTITUCIONAIS. O AUTOR FOI ENCAMINHADO DIRETAMENTE PARA ${upper(friDelegacia)} JUNTAMENTE COM OS MATERIAIS APREENDIDOS PARA APRECIACAO DA AUTORIDADE COMPETENTE.`;
    } else {
      texto += `${vitima} FOI ENCAMINHADA PARA ${upper(friLocalDestino)} E NO LOCAL FOI LIBERADA E A GUARNICIO SEGUIU EM PATRULHAMENTO.`;
    }
    
    finalizarGeracao("Furto/Roubo Imediato", friNomeVitima, texto);
  };

  const gerarEstelionato = () => {

    const vitima = `${artigo(esGenero)} VÍTIMA`;
    let texto = `EM ATENDIMENTO NA ${localRegistro}, COMPARECEU ${vitimaTermo(esGenero)} ${upper(esNome)}, RELATANDO QUE FOI VÍTIMA DE ESTELIONATO/FRAUDE.\n\n`;
    texto += `SEGUNDO ${vitima}, NO DIA/PERÍODO ${upper(esData)}, RECEBEU CONTATO VIA ${upper(esMeio)}, OCASIÃO EM QUE UM INDIVÍDUO, QUE SE IDENTIFICOU COMO ${upper(esAutorId, "NÃO IDENTIFICADO")}, PASSOU A SOLICITAR INFORMAÇÕES, DADOS OU PROVIDÊNCIAS, ALEGANDO ${upper(esPretexto)}.\n\n`;

    if (esPagou === "sim") {
      texto += `${vitima} RELATOU QUE, ACREDITANDO NA VERACIDADE DAS INFORMAÇÕES, REALIZOU ${upper(esTipoPag)} NO VALOR DE R$ ${upper(esValor, "NÃO INFORMADO")}, DESTINADO A ${upper(esDestinatario, "DESTINATÁRIO NÃO INFORMADO")}. POSTERIORMENTE, PERCEBEU TER SIDO INDUZIDA EM ERRO, CONSTATANDO TRATAR-SE DE POSSÍVEL FRAUDE.\n\n`;
    } else {
      texto += `${vitima} INFORMOU QUE NÃO REALIZOU PAGAMENTO OU TRANSFERÊNCIA, BUSCANDO O REGISTRO PARA DOCUMENTAR A TENTATIVA DE FRAUDE E PREVENIR EVENTUAIS PREJUÍZOS.\n\n`;
    }

    texto += `${vitima} FOI ${orientado(esGenero)} QUANTO AO CONTATO IMEDIATO COM A INSTITUIÇÃO FINANCEIRA, PRESERVAÇÃO DE PRINTS, COMPROVANTES, PERFIS, E-MAILS, CHAVES PIX E DEMAIS ELEMENTOS DE PROVA, BEM COMO SOBRE AS PROVIDÊNCIAS LEGAIS CABÍVEIS.`;
    finalizarGeracao("Estelionato", esNome, texto);
  };

  const gerarTransito = () => {
    const solicitante = `${artigo(trGenero)} SOLICITANTE`;
    const tipo = trVitima === "sim" ? "COM VÍTIMA" : "SEM VÍTIMA";
    const tipoSinistro = trTipoSinistro === "estacionado" ? "VEÍCULO ESTACIONADO" : "ACIDENTE DE TRÂNSITO";
    
    let texto = `EM ATENDIMENTO NO ${upper(localRegistro)}, COMPARECEU ${vitimaTermo(trGenero)} ${upper(trSolicitante)}, RELATANDO ENVOLVIMENTO EM ${tipoSinistro} ${tipo}.\n\n`;
    
    const dinamicaVeiculo1 = trDinamicaVeiculo1 === "trafega-crescente" ? "TRAFEGAVA NO SENTIDO CRESCENTE" : trDinamicaVeiculo1 === "trafega-decrescente" ? "TRAFEGAVA NO SENTIDO DECRESCENTE" : trDinamicaVeiculo1 === "parado-semaforo" ? "ENCONTRAVA-SE PARADO NO SEMÁFORO" : trDinamicaVeiculo1 === "estacionado" ? "ENCONTRAVA-SE ESTACIONADO" : "ESTAVA FREIANDO";
    
    const tempoVerbo = trDinamicaVeiculo1 === "estacionado" || trDinamicaVeiculo1 === "parado-semaforo" ? "ESTAVA" : "CONDUZIA";
    const preposicao = trDinamicaVeiculo1 === "estacionado" || trDinamicaVeiculo1 === "parado-semaforo" ? "" : "PELA";
    const viaTexto = preposicao ? ` ${preposicao} ${upper(trVia)}` : ` EM ${upper(trVia)}`;
    
    texto += `SEGUNDO ${solicitante}, NO DIA ${upper(trData, "NÃO INFORMADO")}, POR VOLTA DE ${upper(trHora, "HORÁRIO NÃO INFORMADO")}, ${tempoVerbo} O VEÍCULO ${upper(trVeiculo1)}${viaTexto}, NO BAIRRO ${upper(trBairro, "NÃO INFORMADO")}, QUANDO ${dinamicaVeiculo1}, ENVOLVEU-SE EM SINISTRO.\n\n`;
    
    if (trVeiculos.length > 0) {
      texto += `OS VEÍCULOS ENVOLVIDOS APRESENTAVAM OS SEGUINTES DANOS:\n`;
      trVeiculos.forEach(v => {
        texto += `- ${upper(v.descricao)}: ${v.danos.join(", ").toUpperCase()}\n`;
      });
      texto += `\n`;
    }
    
    if (trVeiculoEvadiu === "sim") {
      texto += `CONFORME INFORMADO, ${upper(trQualEvadiu || "UM DOS VEÍCULOS")} EVADIU DO LOCAL DO SINISTRO.\n\n`;
    } else if (trVeiculoEvadiu === "nao-sabe") {
      texto += `O SOLICITANTE INFORMOU NÃO SABER SE ALGUM VEÍCULO EVADIU DO LOCAL.\n\n`;
    }
    
    if (trVitima === "sim") {
      texto += `EM DECORRÊNCIA DO ACIDENTE, HOUVE VÍTIMA, SENDO ${upper(trNomeVitima, "VÍTIMA NÃO IDENTIFICADA")}, QUE APRESENTAVA ${upper(trLesoes, "LESÕES APARENTES OU QUEIXAS A APURAR")}, SENDO SOCORRIDA POR ${upper(trSocorro, "MEIO NÃO INFORMADO")} E ENCAMINHADA PARA ${upper(trUnidadeSaude, "UNIDADE DE SAÚDE NÃO INFORMADA")}.\n\n`;
      if (modo === "completo" && trVitimaDito.trim()) texto += `SEGUNDO RELATO DA VÍTIMA, "${trVitimaDito.trim()}".\n\n`;
    } else {
      texto += `RELATA QUE O ACIDENTE RESULTOU APENAS EM DANOS MATERIAIS NOS VEÍCULOS ENVOLVIDOS, NÃO HAVENDO VÍTIMAS OU NECESSIDADE DE ATENDIMENTO MÉDICO NO LOCAL.\n\n`;
    }
    
    if (trCrimeTransito === "sim") {
      const sinaisSelecionados = trSinaisEmbriaguez.filter(s => s.selecionado).length;
      texto += `DURANTE O ATENDIMENTO, FORAM OBSERVADOS SINAIS INDICATIVOS DE POSSÍVEL EMBRIAGUEZ DO CONDUTOR:\n`;
      trSinaisEmbriaguez.forEach(s => {
        if (s.selecionado) texto += `- ${upper(s.nome)}\n`;
      });
      texto += `\nTOTAL DE ${sinaisSelecionados} SINAIS OBSERVADOS.\n\n`;
      
      if (trUsouEtilometro === "sim") {
        texto += `FOI REALIZADO TESTE DE ETILÔMETRO, APRESENTANDO RESULTADO DE ${upper(trResultadoEtilometro, "NÃO INFORMADO")}.\n`;
        texto += trCondutorQuis === "sim" ? `O CONDUTOR ACEITOU REALIZAR O TESTE.\n\n` : `O CONDUTOR RECUSOU REALIZAR O TESTE.\n\n`;
      }
      
      if (sinaisSelecionados >= 3) {
        texto += `DIANTE DOS FATOS E DA QUANTIDADE DE SINAIS OBSERVADOS (${sinaisSelecionados}), CARACTERIZA-SE POSSÍVEL CRIME DE TRÂNSITO, SENDO NECESSÁRIA APURAÇÃO POSTERIOR PELA AUTORIDADE COMPETENTE.\n\n`;
      } else {
        texto += `EMBORA TENHAM SIDO OBSERVADOS SINAIS DE EMBRIAGUEZ (${sinaisSelecionados}), A QUANTIDADE NÃO CARACTERIZA CRIME DE TRÂNSITO NESTE MOMENTO, SENDO CONSIGNADAS AS INFORMAÇÕES PARA EVENTUAL APURAÇÃO POSTERIOR.\n\n`;
      }
    }
    
    texto += trPericia === "sim" ? `O LOCAL FOI PRESERVADO PARA TRABALHOS PERICIAIS, SENDO ACIONADA A PERÍCIA TÉCNICA.\n\n` : `NÃO HOUVE ACIONAMENTO DE PERÍCIA NO LOCAL.\n\n`;
    
    texto += trPartesLocal === "sim"
      ? `AS PARTES ENVOLVIDAS PERMANECERAM NO LOCAL, SENDO REALIZADO O DEVIDO REGISTRO PARA FINS DE RESGUARDO DE DIREITOS. DIANTE DOS FATOS, ${solicitante} FOI ${orientado(trGenero)} QUANTO ÀS MEDIDAS LEGAIS CABÍVEIS.`
      : `CONFORME RELATADO, UMA OU MAIS PARTES ENVOLVIDAS NÃO PERMANECERAM NO LOCAL ATÉ A FINALIZAÇÃO DO ATENDIMENTO, SENDO CONSIGNADAS AS INFORMAÇÕES DISPONÍVEIS PARA FINS DE RESGUARDO DE DIREITOS E POSTERIOR APURAÇÃO, SE NECESSÁRIO. DIANTE DOS FATOS, ${solicitante} FOI ${orientado(trGenero)} QUANTO ÀS MEDIDAS LEGAIS CABÍVEIS.`;
    
    finalizarGeracao("Acidente de Trânsito", trSolicitante, texto);
  };

  const gerarPrisao = () => {
    let texto = "";
    
    if (prTemCameras === "sim") {
      // Template COM Olho Vivo
      texto = `SEGUNDO OS MILITARES, REALIZAVAM PATRULHAMENTO PREVENTIVO NO HIPERCENTRO DE BELO HORIZONTE A FIM DE PREVENIR E REPRIMIR OS CRIMES CONTRA O PATRIMÔNIO, EM LOCAL DE INCIDÊNCIA DE FURTOS/ROUBOS/RECEPTAÇÃO, AÇÃO DESENVOLVIDA PELA EQUIPE POSICIONADA EM ROTAS TRAÇADAS E PLANEJADAS DE ACORDO COM OS DADOS ESTATÍSTICOS, COM APOIO DAS CÂMERAS DO SISTEMA OLHO VIVO SENDO QUE EM DADO MOMENTO FOI PASSADO VIA REDE DE RADIO QUE A CÂMERA Nº ${upper(prNumeroCamera, "NÃO INFORMADA")}, FLAGROU UM INDIVÍDUO COM CARACTERÍSTICAS SEMELHANTES A UM SUSPEITO COM MANDADO DE PRISÃO EM ABERTO, CONTIDO EM LISTA LEVANTADA PELO SERVIÇO DE INTELIGÊNCIA CAMINHANDO PELA RUA ${upper(prRuaRastreamento, "NÃO INFORMADA")}.

`;
      texto += `DIANTE DISSO, REALIZARAM RASTREAMENTO, SENDO O SUSPEITO LOCALIZADO NA RUA ${upper(prRuaRastreamento, "NÃO INFORMADA")} ONDE LHE FOI DADA ORDEM DE PARADA. AO REALIZAREM A ABORDAGEM, ESTE SE IDENTIFICOU COMO ${upper(prNomeSuspeito, "NÃO INFORMADO")}.

`;
    } else {
      // Template SEM Olho Vivo
      texto = `SEGUNDO OS MILITARES, REALIZAVAM PATRULHAMENTO PREVENTIVO NO HIPERCENTRO DE BELO HORIZONTE A FIM DE PREVENIR E REPRIMIR OS CRIMES CONTRA O PATRIMÔNIO, EM LOCAL DE INCIDÊNCIA DE FURTOS/ROUBOS/RECEPTAÇÃO, AÇÃO DESENVOLVIDA PELA EQUIPE POSICIONADA EM ROTAS TRAÇADAS E PLANEJADAS DE ACORDO COM OS DADOS ESTATÍSTICOS, SENDO QUE EM DADO MOMENTO SE DEPARARAM COM UM INDIVÍDUO COM CARACTERÍSTICAS SEMELHANTES A UM SUSPEITO COM MANDADO DE PRISÃO EM ABERTO, CONTIDO EM LISTA LEVANTADA PELO SERVIÇO DE INTELIGÊNCIA.

`;
      texto += `DIANTE DISSO, FOI DADA ORDEM DE PARADA AO INDIVÍDUO E, AO REALIZAREM A ABORDAGEM, ESTE SE IDENTIFICOU COMO ${upper(prNomeSuspeito, "NÃO INFORMADO")}.

`;
    }
    
    if (prResistencia === "sim") {
      texto += `DURANTE A ABORDAGEM POLICIAL, ${artigo(prGeneroSuspeito)} ${senhor(prGeneroSuspeito)} ${upper(prNomeSuspeito)}, DEMONSTROU RESISTÊNCIA ÀS ORDENS EMANADAS PELA GUARNIÇÃO, RECUSANDO-SE INICIALMENTE A ACATAR AS DETERMINAÇÕES LEGAIS DOS MILITARES, APRESENTANDO COMPORTAMENTO EXALTADO.\n\nMESMO APÓS VERBALIZAÇÃO CLARA E REITERADA PARA QUE COLOCASSE AS MÃOS NA CABEÇA E SE SUBMETESSE À BUSCA PESSOAL, O AUTOR TENTOU DESVENCILHAR-SE DA EQUIPE POLICIAL, RESISTINDO FISICAMENTE À CONTENÇÃO.\n\nDIANTE DA RESISTÊNCIA APRESENTADA E VISANDO RESGUARDAR A INTEGRIDADE FÍSICA DA EQUIPE POLICIAL, DO PRÓPRIO AUTOR E DE TERCEIROS, FOI NECESSÁRIO O EMPREGO DIFERENCIADO DA FORÇA, EM CONFORMIDADE COM OS PRINCÍPIOS DA LEGALIDADE, NECESSIDADE, PROPORCIONALIDADE E MODERAÇÃO, SENDO O INDIVÍDUO DEVIDAMENTE CONTIDO.\n\n`;
      
      if (prUsouIMPO === "sim") {
        texto += `DIANTE DA NECESSIDADE DE CONTENÇÃO, FOI NECESSÁRIO O EMPREGO DO INSTRUMENTO DE MENOR POTENCIAL OFENSIVO (IMPO), CONSISTENTE EM ${upper(prTipoIMPO, "NÃO INFORMADO")}. O IMPO FOI UTILIZADO PELO MILITAR ${upper(prMilitarIMPO, "NÃO INFORMADO")}, ATINGINDO A REGIÃO ${upper(prRegiaoAtingida, "NÃO INFORMADA")}, COM A FINALIDADE DE CONTER A INJUSTA AGRESSÃO/RESISTÊNCIA ATIVA/TENTATIVA DE FUGA APRESENTADA PELO AUTOR.\n\nAPÓS A INTERVENÇÃO, O INDIVÍDUO FOI DEVIDAMENTE CONTIDO, CESSANDO A RESISTÊNCIA, SENDO POSTERIORMENTE SUBMETIDO À BUSCA PESSOAL E DEMAIS PROCEDIMENTOS POLICIAIS DE PRAXE.\n\n`;
      }
      
      if (prTemLesao === "sim") {
        texto += `O AUTOR APRESENTAVA ${upper(prDescLesao, "APARENTE AUSÊNCIA DE LESÃO")}, SENDO ENCAMINHADO PARA ATENDIMENTO MÉDICO NA UNIDADE DE SAÚDE ${upper(prUnidadeSaudePrisao, "NÃO INFORMADA")}, NÚMERO DA FICHA ${upper(prNumeroFicha, "NÃO INFORMADO")}.\n\n`;
      }
    }
    
    texto += `EM BUSCA DE SEUS DADOS PESSOAIS NOS SISTEMAS INFORMATIZADOS, CONSTATOU-SE QUE HÁ EM SEU DESFAVOR UM MANDADO DE PRISÃO EM ABERTO`;
    if (prNumeroProcesso.trim()) {
      texto += ` - PROCESSO Nº ${upper(prNumeroProcesso)}`;
    }
    texto += `.

`;
    texto += `DESSA FORMA, A GUARNIÇÃO O INFORMOU ACERCA DO MANDADO, SENDO DADA VOZ DE PRISÃO E RESGUARDADOS OS SEUS DIREITOS CONSTITUCIONAIS, BEM COMO O ENCAMINHOU IMEDIATAMENTE A ${upper(prEncaminhamento, "DELEGACIA COMPETENTE")}.`;
    finalizarGeracao("Cumprimento de Prisão", prNomeSuspeito, texto);
  };

  const gerarDiversos = () => {

    const pessoa = `${artigo(divGenero)} ${senhor(divGenero)}`;
    const vitima = `${artigo(divGenero)} VÍTIMA`;
    const autor = divAutorNome.trim() ? `${artigo(divAutorGenero)} ${senhor(divAutorGenero)} ${upper(divAutorNome)}` : "AUTOR NÃO IDENTIFICADO";
    let texto = `EM ATENDIMENTO NA ${localRegistro}, COMPARECEU ${pessoa} ${upper(divNome)}, RELATANDO FATO RELACIONADO À NATUREZA ${upper(divTipo)}.\n\n`;

    if (divTipo === "OPERAÇÃO BSC") {
      texto = `DURANTE TURNO DE SERVIÇO NA BASE COMUNITÁRIA MÓVEL DA PRAÇA RIO BRANCO, ALÉM DA PROMOÇÃO DA SEGURANÇA PÚBLICA, PAZ SOCIAL, E ATENDIMENTO À SOCIEDADE, NA DATA DE HOJE FORAM REGISTRADOS OS SEGUINTES REDS:\n\n${upper(divRelato)}\n\nSEM MAIS, REGISTRA-SE.`;
    } else if (divTipo === "PESSOA DESAPARECIDA") {
      texto += `SEGUNDO O RELATO, A PESSOA ENCONTRA-SE EM LOCAL INCERTO OU NÃO SABIDO DESDE ${upper(divDataHora, "DATA/HORÁRIO NÃO INFORMADO")}, TENDO COMO ÚLTIMA REFERÊNCIA ${upper(divLocal, "LOCAL NÃO INFORMADO")}. FORAM REPASSADAS AS SEGUINTES INFORMAÇÕES RELEVANTES: ${upper(divRelato)}.\n\n`;
      texto += `${vitima} FOI ${orientado(divGenero)} QUANTO À NECESSIDADE DE PRESERVAR CONTATOS, MENSAGENS, IMAGENS, ROTAS, VÍNCULOS E DEMAIS INFORMAÇÕES QUE POSSAM AUXILIAR NA LOCALIZAÇÃO, BEM COMO A FORMALIZAR COMPLEMENTAÇÃO PERANTE A AUTORIDADE COMPETENTE.`;
    } else if (divTipo === "LOCALIZAÇÃO DE PESSOA") {
      texto += `SEGUNDO O RELATO, A PESSOA FOI LOCALIZADA EM ${upper(divLocal, "LOCAL NÃO INFORMADO")}, NA DATA/PERÍODO ${upper(divDataHora, "NÃO INFORMADO")}. CONSTAM COMO INFORMAÇÕES RELEVANTES: ${upper(divRelato)}.\n\n`;
      texto += `O PRESENTE REGISTRO É REALIZADO PARA DOCUMENTAÇÃO FORMAL DA LOCALIZAÇÃO, ATUALIZAÇÃO DAS INFORMAÇÕES E RESGUARDO DE DIREITOS DAS PARTES ENVOLVIDAS.`;
    } else if (divTipo === "VIOLÊNCIA DOMÉSTICA") {
      texto += `SEGUNDO ${vitima}, O FATO OCORREU EM ${upper(divLocal, "LOCAL NÃO INFORMADO")}, NA DATA/PERÍODO ${upper(divDataHora, "NÃO INFORMADO")}, TENDO COMO ENVOLVIDO ${autor}. O RELATO APRESENTADO FOI: ${upper(divRelato)}.\n\n`;
      texto += `${vitima} FOI ${orientado(divGenero)} QUANTO ÀS MEDIDAS PROTETIVAS DE URGÊNCIA, PRESERVAÇÃO DE PROVAS, ACOMPANHAMENTO À DELEGACIA ESPECIALIZADA QUANDO CABÍVEL E DEMAIS PROVIDÊNCIAS PREVISTAS NA LEGISLAÇÃO APLICÁVEL.`;
    } else {
      texto += `SEGUNDO ${vitima}, O FATO OCORREU EM ${upper(divLocal, "LOCAL NÃO INFORMADO")}, NA DATA/PERÍODO ${upper(divDataHora, "NÃO INFORMADO")}, ENVOLVENDO ${autor}. O RELATO APRESENTADO FOI: ${upper(divRelato)}.\n\n`;
      if (divTemAutorPreso === "sim") {
        texto += `O ENVOLVIDO FOI CONTIDO/CONDUZIDO PARA APRESENTAÇÃO À AUTORIDADE COMPETENTE, COM RESGUARDO DOS DIREITOS CONSTITUCIONAIS E ADOÇÃO DAS PROVIDÊNCIAS LEGAIS CABÍVEIS.\n\n`;
      }
      texto += `${vitima} FOI ${orientado(divGenero)} QUANTO ÀS PROVIDÊNCIAS LEGAIS CABÍVEIS, PRESERVAÇÃO DE EVENTUAIS PROVAS E POSSIBILIDADE DE COMPLEMENTAÇÃO DAS INFORMAÇÕES PERANTE A AUTORIDADE COMPETENTE.`;
    }

    if (modo === "completo" && divProvidencias.trim()) {
      texto += `\n\nPROVIDÊNCIAS/OBSERVAÇÕES COMPLEMENTARES: ${upper(divProvidencias)}.`;
    }

    finalizarGeracao(divTipo, divNome, texto);
  };

  const revisaoJuridica = useMemo<RevisaoItem[]>(() => {
    const texto = resultado;
    if (!texto) return [];
    return [
      { label: "Identificação da pessoa atendida ou conduzida", ok: /SENHOR|SENHORA|VÍTIMA|SOLICITANTE|CONDUZIDO|CONDUZIDA/.test(texto) },
      { label: "Descrição objetiva do fato narrado", ok: /RELATOU|SEGUNDO|INFORMA|APRESENTOU/.test(texto) },
      { label: "Resguardo de direitos ou providência legal", ok: /RESGUARDO|PROVIDÊNCIAS LEGAIS|MEDIDAS LEGAIS|APURAÇÃO/.test(texto) },
      { label: "Orientação prestada ao cidadão", ok: /ORIENTAD|CIÊNCIA QUANTO|INFORMOU/.test(texto) },
      { label: "Preservação de prova ou encaminhamento quando aplicável", ok: /PROVA|COMPROVANTE|ENCAMINHADO|DEPLAN|PERÍCIA|BLOQUEIO|ELEMENTOS/.test(texto) },
      { label: "Cabeçalho institucional disponível para cópia/impressão", ok: Boolean(resultadoTipo && resultadoNome) },
      { label: "Checklist de anexos/provas considerado", ok: provasSelecionadas.length > 0 || provaOutro.trim().length > 0 || /ELEMENTOS|PROVAS|COMPROVANTES/.test(texto) },
      { label: "Testemunhas avaliadas quando informadas", ok: temTestemunha === "nao" || /TESTEMUNHA/.test(texto) },
      { label: "Texto sem marcadores pendentes", ok: !/\[|\]|INSERIR|PREENCHER/.test(texto) },
    ];
  }, [resultado, resultadoNome, resultadoTipo, provaOutro, provasSelecionadas.length, temTestemunha]);

  const resumoOperacional = useMemo(() => {
    if (!resultado) return "";
    const provas = [...provasSelecionadas, ...(provaOutro.trim() ? [provaOutro.trim()] : [])];
    return [
      `MODELO: ${upper(resultadoTipo, "NÃO INFORMADO")}`,
      `PESSOA PRINCIPAL: ${upper(resultadoNome, "NÃO INFORMADA")}`,
      `ABA/CONTEXTO ATUAL: ${upper(activeTab)}`,
      `LOCAL/REFERÊNCIA: ${upper(comumLocal || trLocalRegistro || divLocal, "NÃO INFORMADO")}`,
      `PROVAS/ANEXOS: ${provas.length ? formatarLista(provas) : "NÃO INFORMADOS"}`,
      `TESTEMUNHAS: ${temTestemunha === "sim" ? upper(testemunhas, "INFORMADAS, SEM DADOS COMPLETOS") : "NÃO INFORMADAS"}`,
      `PROVIDÊNCIA: HISTÓRICO GERADO PARA DOCUMENTAÇÃO, RESGUARDO DE DIREITOS E PROVIDÊNCIAS LEGAIS CABÍVEIS.`,
    ].join("\n");
  }, [activeTab, comumLocal, divLocal, provaOutro, provasSelecionadas, resultado, resultadoNome, resultadoTipo, testemunhas, temTestemunha, trLocalRegistro]);

  const resultadoComCabecalho = useMemo(() => {
    if (!resultado) return "";
    return `${montarCabecalhoInstitucional()}\n\nRESUMO OPERACIONAL:\n${resumoOperacional}\n\nHISTÓRICO:\n${resultado}`;
  }, [resultado, resumoOperacional, resultadoNome, resultadoTipo]);

  const copiarTexto = async () => {
    if (!resultado) return;
    try {
      await navigator.clipboard.writeText(resultado);
      toast.success("✓ Histórico copiado para a área de transferência!");
    } catch (error) {
      toast.error("✗ Erro ao copiar. Tente novamente.");
    }
  };

  const copiarComCabecalho = async () => {
    if (!resultadoComCabecalho) return;
    try {
      await navigator.clipboard.writeText(resultadoComCabecalho);
      toast.success("✓ Histórico com cabeçalho copiado!");
    } catch (error) {
      toast.error("✗ Erro ao copiar. Tente novamente.");
    }
  };

  const copiarResumo = async () => {
    if (!resumoOperacional) return;
    try {
      await navigator.clipboard.writeText(resumoOperacional);
      toast.success("✓ Resumo copiado para a área de transferência!");
    } catch (error) {
      toast.error("✗ Erro ao copiar. Tente novamente.");
    }
  };

  const baixarTxt = () => {
    if (!resultado) return;
    try {
      const element = document.createElement("a");
      const file = new Blob([resultadoComCabecalho || resultado], { type: "text/plain;charset=utf-8" });
      element.href = URL.createObjectURL(file);
      element.download = `${resultadoTipo || "registro"}.txt`.replaceAll("/", "-");
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("✓ Arquivo baixado com sucesso!");
    } catch (error) {
      toast.error("✗ Erro ao baixar arquivo. Tente novamente.");
    }
  };

  const baixarDoc = () => {
    if (!resultado) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${resultadoTipo}</title></head><body><pre style="white-space:pre-wrap;font-family:Arial,sans-serif;line-height:1.5">${resultadoComCabecalho || resultado}</pre></body></html>`;
    const element = document.createElement("a");
    const file = new Blob([html], { type: "application/msword;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${resultadoTipo || "registro"}.doc`.replaceAll("/", "-");
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const imprimirResultado = () => {
    if (!resultado) return;
    const janela = window.open("", "_blank", "width=900,height=700");
    if (!janela) return;
    janela.document.write(`<!doctype html><html><head><title>${resultadoTipo}</title><style>body{font-family:Arial,sans-serif;padding:32px;line-height:1.55} pre{white-space:pre-wrap} h1{font-size:18px;text-align:center}.assinatura{margin-top:48px;text-align:center;border-top:1px solid #333;padding-top:8px}</style></head><body><pre>${resultadoComCabecalho || resultado}</pre><div class="assinatura">RESPONSÁVEL PELO REGISTRO</div></body></html>`);
    janela.document.close();
    janela.focus();
    janela.print();
  };

  const inserirFrase = (texto: string) => {
    setResultado((atual) => (atual ? `${atual}\n\n${texto}` : texto));
  };

  const excluirHistorico = (id: string) => {
    const atualizado = historico.filter((item) => item.id !== id);
    setHistorico(atualizado);
    window.localStorage.setItem(historicoStorageKey, JSON.stringify(atualizado));
  };

  const limparTudo = () => {
    setResultado("");
    setResultadoTipo("");
    setResultadoNome("");
    setErros([]);

    // Limpar campos da aba ativa
    if (activeTab === "extravio") {
      setExtNome("");
      setExtGenero("masculino");
      setExtDocs([]);
      setExtOutros("");
      setExtSabeLocal("nao");
      setExtLocal("");
      setExtData("");
    } else if (activeTab === "furto") {
      setFurNome("");
      setFurNomeVitima("");
      setFurGenero("masculino");
      setFurData("");
      setFurHora("");
      setFurLocalFato("");
      setFurFormaSubtracao("");
      setFurPercebeuFato("sim");
      setFurDinamicaFato("");
      setFurCelular(false);
      setFurCelularMarca("");
      setFurCelularRastreamento("nao");
      setFurCorrente(false);
      setFurCorrenteMaterial("");
      setFurCarteira(false);
      setFurCarteiraConteudo("");
      setFurOutrosItens("");
      setFurTemImei("nao");
      setFurImei("");
    } else if (activeTab === "estelionato") {
      setEsNome("");
      setEsGenero("masculino");
      setEsData("");
      setEsMeio("TELEFONE");
      setEsAutorId("");
      setEsPretexto("");
      setEsPagou("nao");
      setEsTipoPag("PIX");
      setEsValor("");
      setEsDestinatario("");
    } else if (activeTab === "transito") {
      setTrLocalRegistro("BASE DE SEGURANÇA COMUNITÁRIA RIO BRANCO");
      setTrSolicitante("");
      setTrGenero("masculino");
      setTrData("");
      setTrHora("");
      setTrVeiculo1("");
      setTrVia("");
      setTrBairro("");
      setTrLocalExato("");
      setTrVeiculo2("");
      setTrCondutor2("");
      setTrVitima("nao");
      setTrNomeVitima("");
      setTrGeneroVitima("masculino");
      setTrLesoes("");
      setTrSocorro("");
      setTrUnidadeSaude("");
      setTrVitimaDito("");
      setTrTemVersaoCondutor2("nao");
      setTrVersaoCondutor2("");
      setTrPericia("nao");
      setTrDanosVeiculos("");
      setTrPartesLocal("sim");
    } else if (activeTab === "prisao") {
      setPrGuarnicao("");
      setPrComposicao("");
      setPrNumeroProcesso("");
      setPrDadosProcesso("");
      setPrTemCameras("sim");
      setPrNumeroCamera("");
      setPrRuaRastreamento("");
      setPrNomeSuspeito("");
      setPrGeneroSuspeito("masculino");
      setPrResistencia("nao");
      setPrResDesc("");
      setPrUsouIMPO("nao");
      setPrTipoIMPO("espargidor de agente químico OC");
      setPrMilitarIMPO("");
      setPrRegiaoAtingida("");
      setPrTemLesao("nao");
      setPrDescLesao("");
      setPrUnidadeSaudePrisao("");
      setPrNumeroFicha("");
      setPrEncaminhamento("DEPLAN 2");
    } else if (activeTab === "furtoImediato") {
      setFriPrefixo("");
      setFriMilitares("");
      setFriBloco("");
      setFriFormaConhecimento("RECEBEU INFORMACOES DE TRANSEUNTES");
      setFriDetalhesConhecimento("");
      setFriNomeVitima("");
      setFriGeneroVitima("masculino");
      setFriHistoricoVitima("");
      setFriTipoBem("CELULAR");
      setFriRastreamentoCelular("nao");
      setFriDadosAparelho("nao");
      setFriImei("");
      setFriMarcaModelo("");
      setFriLocalDestino("CROP 6 BASE POSTO DE ATENDIMENTO");
      setFriTemAutor("nao");
      setFriNomeAutor("");
      setFriGeneroAutor("masculino");
      setFriDeclaracaoAutor("");
      setFriAbordagemPolicial("");
      setFriDelegacia("DEPLAN 2");
    } else if (activeTab === "diversos") {
      setDivTipo("VIOLÊNCIA DOMÉSTICA");
      setDivNome("");
      setDivGenero("feminino");
      setDivAutorNome("");
      setDivAutorGenero("masculino");
      setDivLocal("");
      setDivDataHora("");
      setDivRelato("");
      setDivTemAutorPreso("nao");
      setDivProvidencias("");
    }
  };

  const cardChecklistOperacional = () => (
    <Card className="mb-6 border-primary/25 bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg"><ClipboardList className="h-5 w-5 text-primary" /> Provas, anexos e testemunhas</CardTitle>
        <CardDescription>Marque uma vez e o sistema acrescenta ao histórico gerado, quando houver informação disponível.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border border-border bg-muted p-4 md:grid-cols-4">
          {provasPadrao.map((prova) => (
            <label key={prova} className="flex items-center gap-2 text-sm">
              <Checkbox checked={provasSelecionadas.includes(prova)} onCheckedChange={() => toggleProva(prova)} />
              {prova}
            </label>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Outras provas/anexos</Label>
            <Input value={provaOutro} onChange={(e) => setProvaOutro(e.target.value)} placeholder="Ex: recibo, protocolo, filmagem particular" className="bg-muted border-border" />
          </div>
          <div className="space-y-2">
            <Label>Há testemunha?</Label>
            {simNao(temTestemunha, setTemTestemunha, "testemunha-geral")}
          </div>
        </div>
        {temTestemunha === "sim" && (
          <Textarea value={testemunhas} onChange={(e) => setTestemunhas(e.target.value)} rows={2} placeholder="Nome, contato ou referência da testemunha" className="bg-muted border-border" />
        )}
      </CardContent>
    </Card>
  );

  const formHeader = (titulo: string, descricao: string) => (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        {titulo}
      </CardTitle>
      <CardDescription>{descricao}</CardDescription>
    </CardHeader>
  );

  const generoSelect = (value: Genero, onChange: (valor: Genero) => void, id: string) => (
    <Select value={value} onValueChange={(valor) => onChange(valor as Genero)}>
      <SelectTrigger id={id} className="bg-muted border-border">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="masculino">Masculino</SelectItem>
        <SelectItem value="feminino">Feminino</SelectItem>
      </SelectContent>
    </Select>
  );

  const simNao = (value: string, onChange: (valor: string) => void, prefixo: string) => (
    <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-2 gap-2">
      <div className="flex items-center space-x-2 rounded-md border border-border bg-muted p-3">
        <RadioGroupItem value="sim" id={`${prefixo}-sim`} />
        <label htmlFor={`${prefixo}-sim`} className="cursor-pointer text-sm">Sim</label>
      </div>
      <div className="flex items-center space-x-2 rounded-md border border-border bg-muted p-3">
        <RadioGroupItem value="nao" id={`${prefixo}-nao`} />
        <label htmlFor={`${prefixo}-nao`} className="cursor-pointer text-sm">Não</label>
      </div>
    </RadioGroup>
  );

  return (
    <div className={`min-h-screen bg-background text-foreground ${temaDark ? 'dark' : 'light'}`}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <FloatingToolbar onCopy={copiarTexto} onDownload={baixarTxt} onPrint={() => window.print()} onClear={limparTudo} hasResult={!!resultado} />

      <header className={`border-b border-border bg-card/80 backdrop-blur ${sidebarOpen ? 'pl-72' : 'pl-4'} transition-all duration-300`}>
        <div className="py-6 pr-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
                  <img src="/manus-storage/pasted_file_RD8OrZ_image_38d2a508.png" alt="PMMG 6ª CIA PM" className="h-10 w-10 object-contain" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight leading-tight">Modelos 6ª Cia PM</h1>
                  <p className="text-xs text-muted-foreground font-medium">Sistema de Registros Policiais</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={localRegistro} onValueChange={setLocalRegistro}>
                <SelectTrigger className="w-[280px] bg-muted border-border font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CARTÓRIO DE REGISTRO DE OCORRÊNCIAS POLICIAIS – CROP">CARTÓRIO DE REGISTRO DE OCORRÊNCIAS POLICIAIS – CROP</SelectItem>
                  <SelectItem value="BASE DE SEGURANÇA COMUNITÁRIA RIO BRANCO">BASE DE SEGURANÇA COMUNITÁRIA RIO BRANCO</SelectItem>
                  <SelectItem value="BASE DE SEGURANÇA COMUNITÁRIA PRAÇA SETE">BASE DE SEGURANÇA COMUNITÁRIA PRAÇA SETE</SelectItem>
                  <SelectItem value="BASE DE SEGURANÇA COMUNITÁRIA MERCADO CENTRAL">BASE DE SEGURANÇA COMUNITÁRIA MERCADO CENTRAL</SelectItem>
                </SelectContent>
              </Select>

              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 font-semibold" onClick={() => window.open('https://chatgpt.com/g/g-67bdf9f4a3848191b62ffccc5b72fcc4-assistente-virtual-redacao-de-historico-reds', '_blank')}>
                <MessageCircle className="mr-2 h-5 w-5" /> Assistente de Registro
              </Button>
              <Button variant="outline" className="border-border" onClick={() => setTemaDark(!temaDark)}>
                {temaDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="outline" className="border-border" onClick={limparTudo}>
                <Trash2 className="mr-2 h-4 w-4" /> Limpar resultado
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className={`py-8 ${sidebarOpen ? 'pl-72' : 'pl-4'} transition-all duration-300`}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsContent value="extravio">
            <Card>{formHeader("Extravio de Documentos/Objetos", "Selecione os itens e informe local/hora apenas se houver referência segura.")}
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Tipo de Extravio</Label>
                  <div className="grid gap-2 md:grid-cols-2">
                    <label className="flex items-center gap-2 rounded-lg border border-border bg-muted p-3 cursor-pointer hover:bg-muted/80">
                      <input type="radio" name="ext-tipo" value="documentos" checked={extTipo === "documentos"} onChange={(e) => setExtTipo(e.target.value as "documentos" | "objetos")} />
                      <span className="font-medium">Documentos</span>
                    </label>
                    <label className="flex items-center gap-2 rounded-lg border border-border bg-muted p-3 cursor-pointer hover:bg-muted/80">
                      <input type="radio" name="ext-tipo" value="objetos" checked={extTipo === "objetos"} onChange={(e) => setExtTipo(e.target.value as "documentos" | "objetos")} />
                      <span className="font-medium">Objetos</span>
                    </label>
                  </div>
                </div>

                {extTipo === "documentos" ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-2"><Label>Nome do solicitante</Label><Input value={extNome} onChange={(e) => setExtNome(e.target.value)} className="bg-muted border-border" /></div>
                    <div className="space-y-2"><Label>Gênero</Label>{generoSelect(extGenero, setExtGenero, "ext-genero")}</div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-2"><Label>Nome do solicitante</Label><Input value={extNome} onChange={(e) => setExtNome(e.target.value)} className="bg-muted border-border" /></div>
                    <div className="space-y-2"><Label>Gênero</Label>{generoSelect(extGenero, setExtGenero, "ext-genero")}</div>
                  </div>
                )}
                <div className="space-y-3"><Label>{extTipo === "documentos" ? "Documentos" : "Objetos"} extraviados</Label><div className="grid gap-3 rounded-lg border border-border bg-muted p-4 md:grid-cols-3">{documentosExtravio.map((doc) => <label key={doc} className="flex items-center gap-2 text-sm"><Checkbox checked={extDocs.includes(doc)} onCheckedChange={() => toggleDoc(doc)} />{doc}</label>)}</div></div>
                <div className="space-y-2"><Label>Outros itens</Label><Input value={extOutros} onChange={(e) => setExtOutros(e.target.value)} placeholder="Ex: carteira, R$ 50,00" className="bg-muted border-border" /></div>
                <div className="space-y-3"><Label>Sabe local/data/hora aproximados?</Label>{simNao(extSabeLocal, setExtSabeLocal, "ext-local")}</div>
                {extSabeLocal === "sim" && <div className="grid gap-4 rounded-lg border border-primary/30 bg-primary/5 p-4 md:grid-cols-2"><div className="space-y-2"><Label>Data/hora aproximada</Label><Input value={extData} onChange={(e) => setExtData(e.target.value)} className="bg-background border-border" /></div><div className="space-y-2"><Label>Local aproximado</Label><Input value={extLocal} onChange={(e) => setExtLocal(e.target.value)} className="bg-background border-border" /></div></div>}
                <Button onClick={gerarExtravio} className="w-full bg-primary text-primary-foreground hover:bg-primary/90"><FileText className="mr-2 h-4 w-4" />Gerar Histórico</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="furto">
            <Card>{formHeader("Furto/Roubo", "Modelo para furtos em via pública onde a vítima comparece à delegacia após o fato.")}
              <CardContent className="space-y-5">
                <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <Label>Dados do Registro</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Nome da Vítima</Label><Input value={furNomeVitima} onChange={(e) => setFurNomeVitima(e.target.value)} placeholder="Colocar nome da vítima" className="bg-background border-border" /></div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2"><Label>Data</Label><Input value={furData} onChange={(e) => setFurData(e.target.value)} placeholder="Ex: 30/04/2026" className="bg-background border-border" /></div>
                    <div className="space-y-2"><Label>Horário</Label><Input value={furHora} onChange={(e) => setFurHora(e.target.value)} placeholder="Ex: 14h" className="bg-background border-border" /></div>
                    <div className="space-y-2"><Label>Gênero</Label>{generoSelect(furGenero, setFurGenero, "fur-genero")}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Dinâmica do Fato</Label>
                  <div className="space-y-2"><Label>Local do Fato</Label><Input value={furLocalFato} onChange={(e) => setFurLocalFato(e.target.value)} placeholder="Ex: via pública, estabelecimento, evento, transporte coletivo" className="bg-muted border-border" /></div>
                  <div className="space-y-2"><Label>Forma de Subtração</Label><Textarea value={furFormaSubtracao} onChange={(e) => setFurFormaSubtracao(e.target.value)} placeholder="Descrever como ocorreu a subtração" rows={2} className="bg-muted border-border" /></div>
                </div>

                <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <Label>Percebeu o Fato?</Label>
                  {simNao(furPercebeuFato, setFurPercebeuFato, "fur-percebeu")}
                  {furPercebeuFato === "sim" && <div className="space-y-2"><Label>Como foi a Dinâmica?</Label><Textarea value={furDinamicaFato} onChange={(e) => setFurDinamicaFato(e.target.value)} placeholder="Descrever como o fato ocorreu" rows={2} className="bg-background border-border" /></div>}
                </div>

                <div className="space-y-3">
                  <Label>Itens Subtraídos</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="fur-celular" checked={furCelular} onCheckedChange={(checked) => setFurCelular(checked === true)} />
                      <Label htmlFor="fur-celular" className="cursor-pointer">Celular</Label>
                    </div>
                    {furCelular && <div className="ml-6 space-y-2"><Input value={furCelularMarca} onChange={(e) => setFurCelularMarca(e.target.value)} placeholder="Marca/modelo/cor" className="bg-background border-border" /><Label>Rastreamento?</Label>{simNao(furCelularRastreamento, setFurCelularRastreamento, "fur-cel-rastreamento")}</div>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="fur-corrente" checked={furCorrente} onCheckedChange={(checked) => setFurCorrente(checked === true)} />
                      <Label htmlFor="fur-corrente" className="cursor-pointer">Corrente/Correntinha</Label>
                    </div>
                    {furCorrente && <div className="ml-6 space-y-2"><Input value={furCorrenteMaterial} onChange={(e) => setFurCorrenteMaterial(e.target.value)} placeholder="Material (ouro, prata, etc)" className="bg-background border-border" /></div>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="fur-carteira" checked={furCarteira} onCheckedChange={(checked) => setFurCarteira(checked === true)} />
                      <Label htmlFor="fur-carteira" className="cursor-pointer">Carteira</Label>
                    </div>
                    {furCarteira && <div className="ml-6 space-y-2"><Input value={furCarteiraConteudo} onChange={(e) => setFurCarteiraConteudo(e.target.value)} placeholder="RG, CPF, cartões bancários, etc" className="bg-background border-border" /></div>}
                  </div>
                  <div className="space-y-2">
                    <Label>Outros Itens</Label>
                    <Input value={furOutrosItens} onChange={(e) => setFurOutrosItens(e.target.value)} placeholder="Ex: mala, bolsa, relógio, etc" className="bg-muted border-border" />
                  </div>
                </div>

                <Button onClick={gerarFurto} className="w-full bg-primary text-primary-foreground hover:bg-primary/90"><FileText className="mr-2 h-4 w-4" />Gerar Histórico</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="furtoImediato">
            <Card>{formHeader("Furto/Roubo Imediato", "Modelo para crimes de oportunidade com abordagem imediata pela guarnição.")}
              <CardContent className="space-y-5">
                <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <Label>Dados da Guarnição</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Prefixo ou Nomes</Label><Input value={friPrefixo} onChange={(e) => setFriPrefixo(e.target.value)} placeholder="Ex: GT6 P.A. 10" className="bg-background border-border" /></div>
                    <div className="space-y-2"><Label>Militares</Label><Input value={friMilitares} onChange={(e) => setFriMilitares(e.target.value)} placeholder="Ex: 3º SARGENTO CICLANO, SOLDADO BELTRANO" className="bg-background border-border" /></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Dinâmica do Fato</Label>
                  <div className="space-y-2"><Label>Forma de Conhecimento</Label><Select value={friFormaConhecimento} onValueChange={setFriFormaConhecimento}><SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="RECEBEU INFORMACOES DE TRANSEUNTES">Recebeu informações de transeuntes</SelectItem><SelectItem value="ACIONADOS PELO COMPOM">Acionados pelo COMPOM</SelectItem><SelectItem value="OLHO VIVO">Olho vivo</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Detalhes do Conhecimento</Label><Input value={friDetalhesConhecimento} onChange={(e) => setFriDetalhesConhecimento(e.target.value)} placeholder="Ex: RUA PRINCIPAL, CENTRO" className="bg-muted border-border" /></div>
                </div>

                <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <Label>Dados da Vítima</Label>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-2"><Label>Nome da Vítima</Label><Input value={friNomeVitima} onChange={(e) => setFriNomeVitima(e.target.value)} placeholder="Colocar nome da vítima" className="bg-background border-border" /></div>
                    <div className="space-y-2"><Label>Gênero</Label>{generoSelect(friGeneroVitima, setFriGeneroVitima, "fri-genero")}</div>
                  </div>
                  <div className="space-y-2"><Label>Histórico dos Fatos (Versão da Vítima)</Label><Textarea value={friHistoricoVitima} onChange={(e) => setFriHistoricoVitima(e.target.value)} placeholder="Narrar o histórico dos fatos, conforme versão da vítima" rows={3} className="bg-background border-border" /></div>
                </div>

                <div className="space-y-3">
                  <Label>Tipo de Bem Subtraído</Label>
                  <Select value={friTipoBem} onValueChange={setFriTipoBem}>
                    <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CELULAR">Celular</SelectItem>
                      <SelectItem value="CORRENTINHA">Correntinha</SelectItem>
                      <SelectItem value="CARTEIRA">Carteira</SelectItem>
                      <SelectItem value="MALA">Mala</SelectItem>
                      <SelectItem value="OUTROS">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {friTipoBem === "CELULAR" && (
                  <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <Label>Houve rastreamento de aparelho celular?</Label>
                    {simNao(friRastreamentoCelular, setFriRastreamentoCelular, "fri-rastreamento")}
                    {friRastreamentoCelular === "sim" && (
                      <div className="space-y-3">
                        <Label>Dados do aparelho?</Label>
                        {simNao(friDadosAparelho, setFriDadosAparelho, "fri-dados")}
                        {friDadosAparelho === "sim" && (
                          <div className="grid gap-4 md:grid-cols-2">
                            <Input value={friImei} onChange={(e) => setFriImei(e.target.value)} placeholder="Digite o IMEI" className="bg-background border-border" />
                            <Input value={friMarcaModelo} onChange={(e) => setFriMarcaModelo(e.target.value)} placeholder="Ex: Samsung Galaxy S21" className="bg-background border-border" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2"><Label>Local onde a vítima foi deixada</Label><Input value={friLocalDestino} onChange={(e) => setFriLocalDestino(e.target.value)} placeholder="Ex: CROP 6 BASE POSTO DE ATENDIMENTO" className="bg-muted border-border" /></div>

                <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <Label>Dados do Autor</Label>
                  <Label>Houve autor?</Label>
                  {simNao(friTemAutor, setFriTemAutor, "fri-autor")}
                  {friTemAutor === "sim" && (
                    <div className="space-y-3">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2 md:col-span-2"><Label>Nome do Autor</Label><Input value={friNomeAutor} onChange={(e) => setFriNomeAutor(e.target.value)} placeholder="Colocar nome do autor" className="bg-background border-border" /></div>
                        <div className="space-y-2"><Label>Gênero</Label>{generoSelect(friGeneroAutor, setFriGeneroAutor, "fri-genero-autor")}</div>
                      </div>
                      <div className="space-y-2"><Label>Durante a Abordagem</Label><Textarea value={friAbordagemPolicial} onChange={(e) => setFriAbordagemPolicial(e.target.value)} placeholder="A abordagem policial foi realizada pelo militar [inserir nome ou prefixo do militar], sendo procedida busca pessoal no abordado, momento em que foi localizado em sua posse o seguinte material: [descrever detalhadamente os objetos encontrados]." rows={3} className="bg-background border-border" /></div>
                      <div className="space-y-2"><Label>Declaração do Autor</Label><Textarea value={friDeclaracaoAutor} onChange={(e) => setFriDeclaracaoAutor(e.target.value)} placeholder="Descrever o que o autor declarou" rows={3} className="bg-background border-border" /></div>
                      <div className="space-y-2"><Label>Delegacia de Encaminhamento</Label><Input value={friDelegacia} onChange={(e) => setFriDelegacia(e.target.value)} placeholder="Ex: DEPLAN 2" className="bg-background border-border" /></div>
                    </div>
                  )}
                </div>

                <Button onClick={gerarFurtoRouboImediato} className="w-full bg-primary text-primary-foreground hover:bg-primary/90"><FileText className="mr-2 h-4 w-4" />Gerar Histórico</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estelionato">
            <Card>{formHeader("Estelionato/Fraude", "Modelo técnico com preservação de provas digitais e orientação financeira.")}
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3"><div className="space-y-2 md:col-span-2"><Label>Nome da vítima</Label><Input value={esNome} onChange={(e) => setEsNome(e.target.value)} className="bg-muted border-border" /></div><div className="space-y-2"><Label>Gênero</Label>{generoSelect(esGenero, setEsGenero, "es-genero")}</div></div>
                <div className="grid gap-4 md:grid-cols-3"><div className="space-y-2"><Label>Data/período</Label><Input value={esData} onChange={(e) => setEsData(e.target.value)} className="bg-muted border-border" /></div><div className="space-y-2"><Label>Meio de contato</Label><Select value={esMeio} onValueChange={setEsMeio}><SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="TELEFONE">Telefone</SelectItem><SelectItem value="WHATSAPP">WhatsApp</SelectItem><SelectItem value="REDE SOCIAL">Rede social</SelectItem><SelectItem value="E-MAIL">E-mail</SelectItem><SelectItem value="SITE/APLICATIVO">Site/aplicativo</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Como o autor se identificou</Label><Input value={esAutorId} onChange={(e) => setEsAutorId(e.target.value)} className="bg-muted border-border" /></div></div>
                <div className="space-y-2"><Label>Pretexto utilizado</Label><Textarea value={esPretexto} onChange={(e) => setEsPretexto(e.target.value)} rows={2} className="bg-muted border-border" /></div>
                <div className="space-y-3"><Label>Houve pagamento ou transferência?</Label>{simNao(esPagou, setEsPagou, "es-pagou")}</div>
                {esPagou === "sim" && <div className="grid gap-4 rounded-lg border border-primary/30 bg-primary/5 p-4 md:grid-cols-3"><Select value={esTipoPag} onValueChange={setEsTipoPag}><SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PIX">Pix</SelectItem><SelectItem value="TRANSFERÊNCIA BANCÁRIA">Transferência</SelectItem><SelectItem value="BOLETO">Boleto</SelectItem><SelectItem value="PAGAMENTO COM CARTÃO">Cartão</SelectItem></SelectContent></Select><Input value={esValor} onChange={(e) => setEsValor(e.target.value)} placeholder="Valor" className="bg-background border-border" /><Input value={esDestinatario} onChange={(e) => setEsDestinatario(e.target.value)} placeholder="Destinatário/chave Pix" className="bg-background border-border" /></div>}
                <Button onClick={gerarEstelionato} className="w-full bg-primary text-primary-foreground hover:bg-primary/90"><FileText className="mr-2 h-4 w-4" />Gerar Histórico</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transito">
            <Card>{formHeader("Acidente de Trânsito", "Modelo com múltiplos veículos, dinâmica, sinais de embriaguez e crime de trânsito.")}
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3"><div className="space-y-2"><Label>Tipo de sinistro</Label><Select value={trTipoSinistro} onValueChange={setTrTipoSinistro}><SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="colisao">Colisão</SelectItem><SelectItem value="estacionado">Veículo Estacionado</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Com vítima?</Label>{simNao(trVitima, setTrVitima, "tr-vitima")}</div><div className="space-y-2"><Label>Gênero</Label>{generoSelect(trGenero, setTrGenero, "tr-genero")}</div></div>
                <div className="grid gap-4 md:grid-cols-3"><Input value={trSolicitante} onChange={(e) => setTrSolicitante(e.target.value)} placeholder="Solicitante" className="bg-muted border-border" /><Input value={trData} onChange={(e) => setTrData(e.target.value)} placeholder="Data" className="bg-muted border-border" /><Input value={trHora} onChange={(e) => setTrHora(e.target.value)} placeholder="Hora" className="bg-muted border-border" /></div>
                <div className="grid gap-4 md:grid-cols-3"><Input value={trVia} onChange={(e) => setTrVia(e.target.value)} placeholder="Via/Avenida" className="bg-muted border-border" /><Input value={trBairro} onChange={(e) => setTrBairro(e.target.value)} placeholder="Bairro" className="bg-muted border-border" /><Input value={trLocalExato} onChange={(e) => setTrLocalExato(e.target.value)} placeholder="Ponto exato" className="bg-muted border-border" /></div>
                <div className="space-y-3"><Label>Dinâmica do veículo do solicitante</Label><Select value={trDinamicaVeiculo1} onValueChange={setTrDinamicaVeiculo1}><SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="trafega-crescente">Trafegava sentido crescente</SelectItem><SelectItem value="trafega-decrescente">Trafegava sentido decrescente</SelectItem><SelectItem value="parado-semaforo">Parado no semáforo</SelectItem><SelectItem value="estacionado">Estacionado</SelectItem><SelectItem value="freiando">Freiando</SelectItem></SelectContent></Select></div>
                <div className="space-y-3"><Label>Veículos e Danos</Label><div className="space-y-2"><div className="grid gap-2 md:grid-cols-2"><Input value={trNovoVeiculo} onChange={(e) => setTrNovoVeiculo(e.target.value)} placeholder="Descrição do veículo (marca/modelo/placa)" className="bg-muted border-border" /><Input value={trNovoDano} onChange={(e) => setTrNovoDano(e.target.value)} placeholder="Dano (ex: amassado, quebrado)" className="bg-muted border-border" /></div><Button onClick={() => { if (trNovoVeiculo.trim()) { setTrVeiculos([...trVeiculos, { id: Date.now().toString(), descricao: trNovoVeiculo, danos: trNovoDano.trim() ? [trNovoDano] : [] }]); setTrNovoVeiculo(""); setTrNovoDano(""); } }} className="w-full">Adicionar veículo</Button></div>{trVeiculos.length > 0 && <div className="rounded-lg border border-border bg-muted p-3 space-y-2"><p className="text-xs font-semibold text-muted-foreground">Veículos adicionados:</p>{trVeiculos.map((v) => <div key={v.id} className="flex items-center justify-between text-sm p-2 bg-background rounded"><div><p className="font-medium">{v.descricao}</p>{v.danos.length > 0 && <p className="text-xs text-muted-foreground">Danos: {v.danos.join(", ")}</p>}</div><Button onClick={() => setTrVeiculos(trVeiculos.filter(x => x.id !== v.id))} size="sm" variant="ghost" className="h-6 w-6 p-0"><Trash2 className="h-3 w-3" /></Button></div>)}</div>}</div>
                <div className="space-y-3"><Label>Algum veículo evadiu do local?</Label><RadioGroup value={trVeiculoEvadiu} onValueChange={setTrVeiculoEvadiu}><div className="flex items-center space-x-2"><RadioGroupItem value="sim" id="tr-evadiu-sim" /><Label htmlFor="tr-evadiu-sim">Sim</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="nao" id="tr-evadiu-nao" /><Label htmlFor="tr-evadiu-nao">Não</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="nao-sabe" id="tr-evadiu-nao-sabe" /><Label htmlFor="tr-evadiu-nao-sabe">Não sabe</Label></div></RadioGroup>{trVeiculoEvadiu === "sim" && <Input value={trQualEvadiu} onChange={(e) => setTrQualEvadiu(e.target.value)} placeholder="Qual veículo? (descrição/placa)" className="bg-muted border-border" />}</div>
                <div className="space-y-3"><Label>É crime de trânsito?</Label>{simNao(trCrimeTransito, setTrCrimeTransito, "tr-crime")}</div>
                {trCrimeTransito === "sim" && <div className="space-y-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4"><Label className="font-semibold">Sinais de embriaguez observados:</Label><div className="space-y-2">{trSinaisEmbriaguez.map((sinal, idx) => <div key={idx} className="flex items-center space-x-2"><Checkbox checked={sinal.selecionado} onCheckedChange={(checked) => { const newSinais = [...trSinaisEmbriaguez]; newSinais[idx].selecionado = checked as boolean; setTrSinaisEmbriaguez(newSinais); }} id={`sinal-${idx}`} /><Label htmlFor={`sinal-${idx}`} className="text-sm">{sinal.nome}</Label></div>)}</div><div className="space-y-3 mt-4"><Label>Etilômetro utilizado?</Label>{simNao(trUsouEtilometro, setTrUsouEtilometro, "tr-etilo")}{trUsouEtilometro === "sim" && <div className="space-y-2"><Input value={trResultadoEtilometro} onChange={(e) => setTrResultadoEtilometro(e.target.value)} placeholder="Resultado do etilômetro" className="bg-background border-border" /><Label>Condutor quis realizar o teste?</Label>{simNao(trCondutorQuis, setTrCondutorQuis, "tr-quis")}</div>}</div></div>}
                {trVitima === "sim" && <div className="space-y-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4"><div className="grid gap-4 md:grid-cols-3"><Input value={trNomeVitima} onChange={(e) => setTrNomeVitima(e.target.value)} placeholder="Nome da vítima" className="bg-background border-border" />{generoSelect(trGeneroVitima, setTrGeneroVitima, "tr-genero-vitima")}<Input value={trLesoes} onChange={(e) => setTrLesoes(e.target.value)} placeholder="Lesões/queixas" className="bg-background border-border" /></div><div className="grid gap-4 md:grid-cols-2"><Input value={trSocorro} onChange={(e) => setTrSocorro(e.target.value)} placeholder="Socorro: SAMU/Bombeiros" className="bg-background border-border" /><Input value={trUnidadeSaude} onChange={(e) => setTrUnidadeSaude(e.target.value)} placeholder="Hospital/unidade" className="bg-background border-border" /></div></div>}
                <div className="grid gap-4 md:grid-cols-3"><div className="space-y-2"><Label>Perícia acionada?</Label>{simNao(trPericia, setTrPericia, "tr-pericia")}</div><div className="space-y-2"><Label>Partes permaneceram no local?</Label>{simNao(trPartesLocal, setTrPartesLocal, "tr-partes")}</div></div>
                <Button onClick={gerarTransito} className="w-full bg-primary text-primary-foreground hover:bg-primary/90"><FileText className="mr-2 h-4 w-4" />Gerar Histórico</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prisao">
            <Card>{formHeader("Cumprimento de Prisão", "Modelo por informações de inteligência, Olho Vivo, dados do processo e encaminhamento.")}
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2"><Input value={prGuarnicao} onChange={(e) => setPrGuarnicao(e.target.value)} placeholder="Guarnição/viatura" className="bg-muted border-border" /><Input value={prComposicao} onChange={(e) => setPrComposicao(e.target.value)} placeholder="Composição da guarnição" className="bg-muted border-border" /></div>
                <div className="grid gap-4 md:grid-cols-2"><Input value={prNumeroProcesso} onChange={(e) => setPrNumeroProcesso(e.target.value)} placeholder="Número do processo/mandado" className="bg-muted border-border" /><Input value={prDadosProcesso} onChange={(e) => setPrDadosProcesso(e.target.value)} placeholder="Vara/comarca/observação" className="bg-muted border-border" /></div>
                <div className="space-y-3"><Label>Houve apoio de câmera Olho Vivo?</Label>{simNao(prTemCameras, setPrTemCameras, "pr-camera")}{prTemCameras === "sim" && <Input value={prNumeroCamera} onChange={(e) => setPrNumeroCamera(e.target.value)} placeholder="Número da câmera" className="bg-muted border-border" />}</div>

                <div className="grid gap-4 md:grid-cols-3"><Input value={prRuaRastreamento} onChange={(e) => setPrRuaRastreamento(e.target.value)} placeholder="Rua/local da localização" className="bg-muted border-border" /><Input value={prNomeSuspeito} onChange={(e) => setPrNomeSuspeito(e.target.value)} placeholder="Nome do conduzido" className="bg-muted border-border" />{generoSelect(prGeneroSuspeito, setPrGeneroSuspeito, "pr-genero")}</div>
                <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Houve resistência?</Label>{simNao(prResistencia, setPrResistencia, "pr-res")}</div><div className="space-y-2"><Label>Encaminhamento</Label><Select value={prEncaminhamento} onValueChange={setPrEncaminhamento}><SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="DEPLAN 2">DEPLAN 2</SelectItem><SelectItem value="DEPLAN 4">DEPLAN 4</SelectItem></SelectContent></Select></div></div>
                {prResistencia === "sim" && (
                  <div className="space-y-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <Label className="font-semibold">Detalhes da Resistência</Label>
                    <div className="space-y-2"><Label>Usou IMPO (Instrumento de Menor Potencial Ofensivo)?</Label>{simNao(prUsouIMPO, setPrUsouIMPO, "pr-impo")}</div>
                    {prUsouIMPO === "sim" && (
                      <div className="space-y-3">
                        <div className="space-y-2"><Label>Tipo de IMPO</Label><Select value={prTipoIMPO} onValueChange={setPrTipoIMPO}><SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="espargidor de agente químico OC">Espargidor de agente químico OC</SelectItem><SelectItem value="dispositivo elétrico incapacitante">Dispositivo elétrico incapacitante</SelectItem><SelectItem value="bastão policial">Bastão policial</SelectItem><SelectItem value="munição de impacto controlado">Munição de impacto controlado</SelectItem><SelectItem value="elastômero">Elastômero</SelectItem></SelectContent></Select></div>
                        <div className="grid gap-4 md:grid-cols-2"><Input value={prMilitarIMPO} onChange={(e) => setPrMilitarIMPO(e.target.value)} placeholder="Militar que usou (nome/posto/prefixo)" className="bg-background border-border" /><Input value={prRegiaoAtingida} onChange={(e) => setPrRegiaoAtingida(e.target.value)} placeholder="Região atingida" className="bg-background border-border" /></div>
                      </div>
                    )}
                    <div className="space-y-2"><Label>Houve lesão?</Label>{simNao(prTemLesao, setPrTemLesao, "pr-lesao")}</div>
                    {prTemLesao === "sim" && (
                      <div className="space-y-3">
                        <Input value={prDescLesao} onChange={(e) => setPrDescLesao(e.target.value)} placeholder="Descrever lesão/aparência" className="bg-background border-border" />
                        <div className="grid gap-4 md:grid-cols-2"><Input value={prUnidadeSaudePrisao} onChange={(e) => setPrUnidadeSaudePrisao(e.target.value)} placeholder="Unidade de saúde" className="bg-background border-border" /><Input value={prNumeroFicha} onChange={(e) => setPrNumeroFicha(e.target.value)} placeholder="Número da ficha" className="bg-background border-border" /></div>
                      </div>
                    )}
                  </div>
                )}
                <Button onClick={gerarPrisao} className="w-full bg-primary text-primary-foreground hover:bg-primary/90"><FileText className="mr-2 h-4 w-4" />Gerar Histórico</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diversos">
            <Card>{formHeader("Outros Modelos", "Modelos adicionais com campos reduzidos e texto técnico padronizado.")}
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3"><div className="space-y-2"><Label>Modelo</Label><Select value={divTipo} onValueChange={setDivTipo}><SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger><SelectContent>{modelosDiversos.map((modelo) => <SelectItem key={modelo} value={modelo}>{modelo}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Nome da pessoa atendida</Label><Input value={divNome} onChange={(e) => setDivNome(e.target.value)} className="bg-muted border-border" /></div><div className="space-y-2"><Label>Gênero</Label>{generoSelect(divGenero, setDivGenero, "div-genero")}</div></div>
                <div className="grid gap-4 md:grid-cols-3"><Input value={divLocal} onChange={(e) => setDivLocal(e.target.value)} placeholder="Local do fato/localização" className="bg-muted border-border" /><Input value={divDataHora} onChange={(e) => setDivDataHora(e.target.value)} placeholder="Data/hora/período" className="bg-muted border-border" /><Input value={divAutorNome} onChange={(e) => setDivAutorNome(e.target.value)} placeholder="Autor/envolvido, se houver" className="bg-muted border-border" /></div>
                {modo === "completo" && <div className="space-y-2"><Label>Gênero do autor/envolvido</Label>{generoSelect(divAutorGenero, setDivAutorGenero, "div-autor-genero")}</div>}
                <Textarea value={divRelato} onChange={(e) => setDivRelato(e.target.value)} placeholder="Relato objetivo do fato, sinais, danos, ameaças, agressões ou circunstâncias relevantes" rows={4} className="bg-muted border-border" />
                <div className="space-y-2"><Label>Autor preso/conduzido?</Label>{simNao(divTemAutorPreso, setDivTemAutorPreso, "div-preso")}</div>
                {modo === "completo" && <Textarea value={divProvidencias} onChange={(e) => setDivProvidencias(e.target.value)} placeholder="Providências ou observações complementares" rows={2} className="bg-muted border-border" />}
                <Button onClick={gerarDiversos} className="w-full bg-primary text-primary-foreground hover:bg-primary/90"><FileText className="mr-2 h-4 w-4" />Gerar Histórico</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rat">
            <Card>{formHeader("RAT - Relatório de Atividades Táticas", "Selecione o tipo de operação realizada.")}
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Tipo de Operação</Label>
                  <div className="grid gap-2 md:grid-cols-2">
                    <label className="flex items-center gap-2 rounded-lg border border-border bg-muted p-3 cursor-pointer hover:bg-muted/80">
                      <input type="radio" name="rat-tipo" value="batida" checked={ratTipo === "batida"} onChange={(e) => setRatTipo(e.target.value)} />
                      <span className="font-medium">Batida Policial</span>
                    </label>
                    <label className="flex items-center gap-2 rounded-lg border border-border bg-muted p-3 cursor-pointer hover:bg-muted/80">
                      <input type="radio" name="rat-tipo" value="blitz" checked={ratTipo === "blitz"} onChange={(e) => setRatTipo(e.target.value)} />
                      <span className="font-medium">Operação Blitz</span>
                    </label>
                    <label className="flex items-center gap-2 rounded-lg border border-border bg-muted p-3 cursor-pointer hover:bg-muted/80">
                      <input type="radio" name="rat-tipo" value="presenca" checked={ratTipo === "presenca"} onChange={(e) => setRatTipo(e.target.value)} />
                      <span className="font-medium">Operação Presença</span>
                    </label>
                    <label className="flex items-center gap-2 rounded-lg border border-border bg-muted p-3 cursor-pointer hover:bg-muted/80">
                      <input type="radio" name="rat-tipo" value="bsc" checked={ratTipo === "bsc"} onChange={(e) => setRatTipo(e.target.value)} />
                      <span className="font-medium">Operação BSC</span>
                    </label>
                  </div>
                </div>

                {ratTipo === "batida" && (
                  <div className="space-y-2">
                    <Label>Abordados</Label>
                    <Textarea value={ratAbordados} onChange={(e) => setRatAbordados(e.target.value)} placeholder="Ex: - Fulano de Tal, 25 anos, RG 1234567" className="bg-muted border-border min-h-24" />
                  </div>
                )}

                {ratTipo === "blitz" && (
                  <div className="space-y-2">
                    <Label>Veículos Fiscalizados</Label>
                    <Textarea value={ratVeiculosFiscalizados} onChange={(e) => setRatVeiculosFiscalizados(e.target.value)} placeholder="Ex: - Motocicleta Preta, Placa ABC-1234" className="bg-muted border-border min-h-24" />
                  </div>
                )}

                {ratTipo === "presenca" && (
                  <div className="space-y-2">
                    <Label>Local de Ponto Base</Label>
                    <Input value={ratLocalPontoBase} onChange={(e) => setRatLocalPontoBase(e.target.value)} placeholder="Ex: Praça Rio Branco" className="bg-muted border-border" />
                  </div>
                )}

                {ratTipo === "bsc" && (
                  <div className="space-y-2">
                    <Label>REDs Registrados</Label>
                    <Textarea value={ratReds} onChange={(e) => setRatReds(e.target.value)} placeholder="Digite os REDs (Registros de Eventos Diversos) aqui" className="bg-muted border-border min-h-32" />
                  </div>
                )}

                <Button onClick={gerarRat} className="w-full bg-primary text-primary-foreground hover:bg-primary/90"><FileText className="mr-2 h-4 w-4" />Gerar Histórico</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <Card>{formHeader("Histórico Local", "Registros salvos automaticamente neste navegador para consulta e reutilização.")}
              <CardContent className="space-y-4">
                {historico.length === 0 && <p className="text-sm text-muted-foreground">Nenhum registro salvo ainda.</p>}
                {historico.map((item) => <div key={item.id} className="rounded-lg border border-border bg-muted p-4"><div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><div><p className="font-semibold">{item.tipo} — {item.nome}</p><p className="text-xs text-muted-foreground">{item.data}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => { setResultado(item.texto); setResultadoTipo(item.tipo); setResultadoNome(item.nome); }}><RotateCcw className="mr-2 h-4 w-4" />Reutilizar</Button><Button size="sm" variant="outline" onClick={() => excluirHistorico(item.id)}><Trash2 className="mr-2 h-4 w-4" />Excluir</Button></div></div></div>)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Seções utilitárias movidas para baixo dos modelos */}
        {/* Resultado do histórico gerado - movido para o topo */}
        {resultado && (
          <Card className="mb-6 border-primary/30 bg-card">
            <CardHeader>
              <CardTitle className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <span>Histórico Gerado — {resultadoTipo}</span>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={copiarTexto} size="sm" variant="outline"><Copy className="mr-2 h-4 w-4" />Copiar histórico</Button>
                </div>
              </CardTitle>
              <CardDescription>{resultadoNome}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="min-h-[260px] rounded-lg border border-border bg-muted p-5 font-mono text-sm leading-relaxed whitespace-pre-wrap">{resultado}</div>
            </CardContent>
          </Card>
        )}

        {plantao && (
          <Alert className="mb-6 border-primary/40 bg-primary/10">
            <Shield className="h-4 w-4" />
            <AlertDescription>Modo plantão ativo: use os atalhos abaixo para alternar rapidamente entre os modelos mais usados e gerar histórico com menos rolagem.</AlertDescription>
          </Alert>
        )}

        {plantao && (
          <Card className="mb-6 border-primary/25 bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Atalhos de plantão</CardTitle>
              <CardDescription>Selecione rapidamente a natureza mais comum durante o atendimento.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-6">
              {[
                ["extravio", "Extravio"],
                ["furto", "Furto/Roubo"],
                ["estelionato", "Estelionato"],
                ["transito", "Trânsito"],
                ["prisao", "Prisão"],
                ["diversos", "Outros"],
              ].map(([valor, rotulo]) => (
                <Button key={valor} variant="outline" className="border-border" onClick={() => setActiveTab(valor)}>{rotulo}</Button>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="border-primary/25 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><BookOpen className="h-5 w-5 text-primary" /> Biblioteca técnica</CardTitle>
            <CardDescription>Clique para inserir, ou use os ícones para editar/apagar.</CardDescription>
            <Button onClick={iniciarCriacaoModelo} className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90"><Save className="mr-2 h-4 w-4" />Adicionar novo modelo</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {frasesTecnicas.map((frase) => (
              <div key={frase.titulo} className="flex items-center gap-2 rounded-lg border border-border bg-muted p-2">
                <button type="button" onClick={() => inserirFrase(frase.texto)} className="flex-1 text-left text-sm hover:text-primary truncate">{frase.titulo}</button>
                <button type="button" onClick={() => editarFrase(frase)} className="p-1 text-muted-foreground hover:text-primary" title="Editar">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setApagarFrase(frase)} className="p-1 text-muted-foreground hover:text-destructive" title="Apagar">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Modal de edição/criação de frase técnica */}
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>{criandoNovoModelo ? "Adicionar novo modelo" : "Editar frase técnica"}</DialogTitle>
              <DialogDescription>{criandoNovoModelo ? "Crie um novo modelo com título e texto personalizados." : "Atualize o título e o texto da frase."}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={novoTitulo} onChange={(e) => setNovoTitulo(e.target.value)} placeholder="Ex: Orientação sobre direitos" className="bg-muted border-border" />
              </div>
              <div className="space-y-2">
                <Label>Texto</Label>
                <Textarea value={novoTexto} onChange={(e) => setNovoTexto(e.target.value)} rows={5} placeholder="Digite o texto do modelo..." className="bg-muted border-border" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogAberto(false); setCriandoNovoModelo(false); }}>Cancelar</Button>
              <Button onClick={criandoNovoModelo ? salvarNovoModelo : salvarEdicao} className="bg-primary text-primary-foreground hover:bg-primary/90">{criandoNovoModelo ? "Criar modelo" : "Salvar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AlertDialog de confirmação de exclusão */}
        <AlertDialog open={!!apagarFrase} onOpenChange={(open) => !open && setApagarFrase(null)}>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Apagar frase técnica?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja apagar "{apagarFrase?.titulo}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmarDelecao} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Apagar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
