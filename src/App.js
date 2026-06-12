// src/App.js - VERSÃO COMPLETA COM HORÁRIO DE BRASÍLIA E ROTAS CORRIGIDAS

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { lightTheme, darkTheme } from './theme';
import { CircularProgress, Box } from '@mui/material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/pt-br';

// Configurar dayjs globalmente para horário de Brasília
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('pt-br');

// Configuração fixa do fuso horário de Brasília
export const BRASILIA_TIMEZONE = 'America/Sao_Paulo';

// Função global para formatar datas no horário de Brasília
export const formatBrasiliaTime = (date, format = 'DD/MM/YYYY HH:mm:ss') => {
  if (!date) return '';
  return dayjs(date).tz(BRASILIA_TIMEZONE).format(format);
};

// Função para formatar apenas a data
export const formatBrasiliaDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';
  return dayjs(date).tz(BRASILIA_TIMEZONE).format(format);
};

// Função para formatar apenas a hora
export const formatBrasiliaTimeOnly = (date, format = 'HH:mm:ss') => {
  if (!date) return '';
  return dayjs(date).tz(BRASILIA_TIMEZONE).format(format);
};

// Função para obter data/hora atual de Brasília
export const getCurrentBrasiliaTime = () => {
  return dayjs().tz(BRASILIA_TIMEZONE);
};

// Função para converter qualquer data para Brasília
export const toBrasiliaTime = (date) => {
  return dayjs(date).tz(BRASILIA_TIMEZONE);
};

// Função para comparar se duas datas são no mesmo dia (horário Brasília)
export const isSameDayBrasilia = (date1, date2) => {
  const d1 = dayjs(date1).tz(BRASILIA_TIMEZONE);
  const d2 = dayjs(date2).tz(BRASILIA_TIMEZONE);
  return d1.isSame(d2, 'day');
};

// Hook customizado para usar horário de Brasília
export const useBrasiliaTime = () => {
  const [currentTime, setCurrentTime] = useState(dayjs().tz(BRASILIA_TIMEZONE));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs().tz(BRASILIA_TIMEZONE));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return {
    currentTime,
    format: (date, formatStr = 'DD/MM/YYYY HH:mm:ss') => formatBrasiliaTime(date, formatStr),
    formatDate: (date, formatStr = 'DD/MM/YYYY') => formatBrasiliaDate(date, formatStr),
    formatTime: (date, formatStr = 'HH:mm:ss') => formatBrasiliaTimeOnly(date, formatStr),
    now: () => dayjs().tz(BRASILIA_TIMEZONE),
    isSameDay: (date1, date2) => isSameDayBrasilia(date1, date2)
  };
};

// Contextos
import { FeedbackProvider } from './contexts/FeedbackContext';
import { DadosProvider } from './contexts/DadosContext';
import { AuthProvider } from './contexts/AuthContext';
import { AuthClienteProvider } from './contexts/AuthClienteContext';

// Services
import firebaseService from './services/firebase';

// Components
import ModernHeader from './components/ModernHeader';
import ModernSidebar from './components/ModernSidebar';
import PrivateRoute from './components/PrivateRoute';
import GlobalLoading from './components/GlobalLoading';
import GlobalSnackbar from './components/GlobalSnackbar';
import ClienteLayout from './components/ClienteLayout';
import ClientePrivateRoute from './components/ClientePrivateRoute';
import SaasAdminRoute from './components/SaasAdminRoute';
import FidelidadeRoute from './components/FidelidadeRoute';
import Footer from './components/Footer';

// Pages Principais
import ModernDashboard from './pages/ModernDashboard';
import ModernLogin from './pages/ModernLogin';
import ModernPerfil from './pages/ModernPerfil';
import ModernNotificacoes from './pages/ModernNotificacoes';
import ModernConfiguracoes from './pages/ModernConfiguracoes';

// Pages Operacionais
import ModernClientes from './pages/ModernClientes';
import ModernServicos from './pages/ModernServicos';
import ModernProfissionais from './pages/ModernProfissionais';
import Agenda from './pages/agenda';
import ModernAgendamentos from './pages/ModernAgendamentos';
import ModernAtendimentos from './pages/ModernAtendimentos';
import ModernAtendimento from './pages/ModernAtendimento';

// Pages Fidelidade
import Fidelidade from './pages/Fidelidade';
import GerenciarFidelidade from './pages/GerenciarFidelidade';
import Recompensas from './pages/Recompensas';
import MeusPontos from './pages/MeusPontos';
import FidelidadeHistorico from './pages/FidelidadeHistorico';

// Pages Financeiras
import ModernFinanceiro from './pages/ModernFinanceiro';
import ModernCompras from './pages/ModernCompras';
import ModernRelatorios from './pages/ModernRelatorios';
import ContasPagar from './pages/ContasPagar';
import ContasReceber from './pages/ContasReceber';
import FluxoCaixa from './pages/FluxoCaixa';
import ModernCaixa from './pages/ModernCaixa';

// Pages Estoque
import ModernEstoque from './pages/ModernEstoque';
import Fornecedores from './pages/Fornecedores';
import Entradas from './pages/Entradas';

// Pages Administrativas
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import HistoricoAtendimentos from './pages/HistoricoAtendimentos';
import Auditoria from './pages/Auditoria';
import MinhasComissoes from './pages/MinhasComissoes';

// Pages de Cupons e Marketing
import GerenciarCupons from './pages/GerenciarCupons';
import Campanhas from './pages/Campanhas';
import AnaliseCupons from './pages/AnaliseCupons';
import PromocaoVisualizar from './pages/PromocaoVisualizar';

// Pages de Disponibilidade
import Disponibilidade from './pages/Disponibilidade';

// Pages de Indicações
import Indicacoes from './pages/Indicacoes';
import CadastroIndicacao from './pages/CadastroIndicacao';

// Pages de Categorias
import CategoriasProdutos from './pages/CategoriasProdutos';

// Pages de Análise de Vendas
import AnaliseVendas from './pages/AnaliseVendas';

// Pages de Performance
import Performance from './pages/Performance';

// Pages de Backup e Logs
import Backup from './pages/Backup';
import Logs from './pages/Logs';

// Pages de Anamnese
import FormulariosAnamnese from './pages/Anamnese/FormulariosAnamnese';
import RespostasAnamnese from './pages/Anamnese/RespostasAnamnese';
import ModelosAnamnese from './pages/Anamnese/ModelosAnamnese';
import RelatorioAnamnese from './pages/Anamnese/RelatorioAnamnese';

// Páginas do Cliente
import ClienteLogin from './pages/ClienteLogin';
import ClienteAuthCallback from './pages/ClienteAuthCallback';
import ClienteCadastro from './pages/ClienteCadastro';
import ClienteRecuperarSenha from './pages/ClienteRecuperarSenha';
import ClienteDashboard from './pages/ClienteDashboard';
import ClienteAgendamentos from './pages/ClienteAgendamentos';
import ClienteRecompensas from './pages/ClienteRecompensas';
import ClientePontos from './pages/ClientePontos';
import ClienteHistorico from './pages/ClienteHistorico';
import ClientePerfil from './pages/ClientePerfil';
import ClienteNotificacoes from './pages/ClienteNotificacoes';
import ClienteAnamnese from './pages/ClienteAnamnese';
import ClienteAnamneseLista from './pages/ClienteAnamneseLista';
import ClienteAnamneseVisualizar from './pages/ClienteAnamneseVisualizar';
import ClienteCadastroComplementar from './pages/ClienteCadastroComplementar';

// Páginas de Erro
import Page404 from './pages/404';
import Page403 from './pages/403';
import Page500 from './pages/500';
import Manutencao from './pages/Manutencao';
import ImportarServicos from './pages/ImportarServicos';
import TesteAPI from './pages/TesteAPI';
import SiteSalao from './pages/SiteSalao';
import TermosUso from './pages/TermosUso';
import PoliticaPrivacidade from './pages/PoliticaPrivacidade';
import ManualSistema from './pages/ManualSistema';
import SaasAdmin from './pages/SaasAdmin';
import SaasPagamentosConfig from './pages/SaasPagamentosConfig';
import SaasEmpresas from './pages/SaasEmpresas';
import SaasCobrancas from './pages/SaasCobrancas';
import SaasPlanos from './pages/SaasPlanos';
import SaasRelatorios from './pages/SaasRelatorios';
import SaasLanding from './pages/SaasLanding';
import SuperAdminSelecionarEmpresa from './pages/SuperAdminSelecionarEmpresa';
import AdminChamados from './pages/AdminChamados';

// ============================================
// OVERRIDE GLOBAL PARA BLOQUEAR ERROS DE PERMISSÃO
// ============================================
const originalQuery = firebaseService.query;
const originalGetById = firebaseService.getById;
const originalGetAll = firebaseService.getAll;
const originalUpdate = firebaseService.update;

firebaseService.query = async function(collectionName, ...args) {
  if (window.location.pathname.startsWith('/cliente') && collectionName === 'usuarios') {
    console.log('🚫 Bloqueando query em usuarios na área do cliente');
    return [];
  }
  try {
    return await originalQuery.call(this, collectionName, ...args);
  } catch (error) {
    if (error.code === 'permission-denied' || error.message?.includes('permission')) {
      console.log(`🚫 Ignorando erro de permissão em ${collectionName}`);
      return [];
    }
    throw error;
  }
};

firebaseService.getById = async function(collectionName, id) {
  if (window.location.pathname.startsWith('/cliente') && collectionName === 'usuarios') {
    console.log('🚫 Bloqueando getById em usuarios na área do cliente');
    return null;
  }
  try {
    return await originalGetById.call(this, collectionName, id);
  } catch (error) {
    if (error.code === 'permission-denied' || error.message?.includes('permission')) {
      console.log(`🚫 Ignorando erro de permissão em ${collectionName}/${id}`);
      return null;
    }
    throw error;
  }
};

firebaseService.getAll = async function(collectionName) {
  if (window.location.pathname.startsWith('/cliente') && collectionName === 'usuarios') {
    console.log('🚫 Bloqueando getAll em usuarios na área do cliente');
    return [];
  }
  try {
    return await originalGetAll.call(this, collectionName);
  } catch (error) {
    if (error.code === 'permission-denied' || error.message?.includes('permission')) {
      console.log(`🚫 Ignorando erro de permissão em ${collectionName}`);
      return [];
    }
    throw error;
  }
};

firebaseService.update = async function(collectionName, id, data) {
  if (window.location.pathname.startsWith('/cliente') && collectionName === 'notificacoes_cliente') {
    try {
      return await originalUpdate.call(this, collectionName, id, data);
    } catch (error) {
      if (error.code === 'permission-denied') {
        console.log('✅ Notificação marcada como lida (simulado)');
        return { id, ...data };
      }
      throw error;
    }
  }
  return originalUpdate.call(this, collectionName, id, data);
};
// ============================================

// Componente de Loading
const AppLoading = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    bgcolor: '#faf5ff'
  }}>
    <CircularProgress size={60} thickness={4} sx={{ color: '#9c27b0' }} />
  </Box>
);

// Layout para páginas do sistema (com sidebar)
const SistemaLayout = ({ children, theme }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Box sx={{ display: 'flex', flex: 1 }}>
      <ModernSidebar />
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        width: { xs: '100%', md: 'calc(100% - 300px)' },
      }}>
        <ModernHeader />
        <Box component="main" sx={{ 
          flexGrow: 1, 
          p: { xs: 2, md: 3 },
          backgroundColor: theme.palette.background.default,
          overflow: 'auto'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
    <Footer />
  </Box>
);

// Layout para páginas públicas e login (sem sidebar)
const SimpleLayout = ({ children }) => (
  <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Box sx={{ flex: 1 }}>
      {children}
    </Box>
    <Footer />
  </Box>
);

function App() {
  const [modoEscuro, setModoEscuro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [configuracoes, setConfiguracoes] = useState(null);
  const currentTheme = modoEscuro ? darkTheme : lightTheme;

  useEffect(() => {
    const carregarConfiguracoes = async () => {
      try {
        console.log('🔄 Carregando configurações do Firebase...');
        const configData = await firebaseService.getAll('configuracoes');
        
        if (configData && configData.length > 0) {
          const config = configData[0];
          setConfiguracoes(config);
          setModoEscuro(config.tema?.modoEscuro || false);
          console.log('✅ Configurações carregadas:', config);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar configurações:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarConfiguracoes();
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'modoEscuro') {
        setModoEscuro(e.newValue === 'true');
      }
    };

    const handleTemaAtualizado = (e) => {
      const modoEscuroAtual = typeof e.detail?.modoEscuro === 'boolean'
        ? e.detail.modoEscuro
        : localStorage.getItem('modoEscuro') === 'true';
      setModoEscuro(modoEscuroAtual);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('temaAtualizado', handleTemaAtualizado);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('temaAtualizado', handleTemaAtualizado);
    };
  }, []);

  if (loading) {
    return <AppLoading />;
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <FeedbackProvider>
        <DadosProvider>
          <AuthProvider>
            <GlobalLoading />
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: currentTheme.palette.background.paper,
                  color: currentTheme.palette.text.primary,
                  border: `1px solid ${currentTheme.palette.divider}`,
                  borderRadius: 12,
                },
              }}
            />
            <GlobalSnackbar />
            
            <Router>
              <Routes>
                {/* Rotas Públicas com Footer */}
                <Route path="/" element={
                  <SimpleLayout>
                    <SiteSalao />
                  </SimpleLayout>
                } />
                <Route path="/promocoes/:id" element={
                  <SimpleLayout>
                    <PromocaoVisualizar />
                  </SimpleLayout>
                } />
                <Route path="/e/:slug" element={
                  <SimpleLayout>
                    <SiteSalao />
                  </SimpleLayout>
                } />
                <Route path="/login" element={
                  <SimpleLayout>
                    <ModernLogin />
                  </SimpleLayout>
                } />
                <Route path="/teste" element={
                  <SimpleLayout>
                    <TesteAPI />
                  </SimpleLayout>
                } />
                <Route path="/403" element={
                  <SimpleLayout>
                    <Page403 />
                  </SimpleLayout>
                } />
                <Route path="/500" element={
                  <SimpleLayout>
                    <Page500 />
                  </SimpleLayout>
                } />
                <Route path="/manutencao" element={
                  <SimpleLayout>
                    <Manutencao />
                  </SimpleLayout>
                } />
                
                {/* Rotas do Cliente */}
                <Route path="/cliente/login" element={
                  <AuthClienteProvider>
                    <SimpleLayout>
                      <ClienteLogin />
                    </SimpleLayout>
                  </AuthClienteProvider>
                } />
                
                {/* 🔥 ROTA DE CALLBACK DO GOOGLE - IMPORTANTE */}
                <Route path="/cliente/auth/callback" element={
                  <AuthClienteProvider>
                    <SimpleLayout>
                      <ClienteAuthCallback />
                    </SimpleLayout>
                  </AuthClienteProvider>
                } />
                
                <Route path="/cliente/cadastro" element={
                  <AuthClienteProvider>
                    <SimpleLayout>
                      <ClienteCadastro />
                    </SimpleLayout>
                  </AuthClienteProvider>
                } />
                
                {/* Rota para cadastro via indicação */}
                <Route 
                  path="/cadastro" 
                  element={<CadastroIndicacao />} 
                />
                
                {/* Rota para cadastro complementar após login Google */}
                <Route path="/cliente/cadastro-complementar" element={
                  <AuthClienteProvider>
                    <SimpleLayout>
                      <ClienteCadastroComplementar />
                    </SimpleLayout>
                  </AuthClienteProvider>
                } />
                
                <Route path="/cliente/recuperar-senha" element={
                  <AuthClienteProvider>
                    <SimpleLayout>
                      <ClienteRecuperarSenha />
                    </SimpleLayout>
                  </AuthClienteProvider>
                } />
                
                <Route path="/cliente" element={
                  <AuthClienteProvider>
                    <ClientePrivateRoute>
                      <ClienteLayout />
                    </ClientePrivateRoute>
                  </AuthClienteProvider>
                }>
                  <Route path="dashboard" element={<ClienteDashboard />} />
                  <Route path="agendamentos" element={<ClienteAgendamentos />} />
                  <Route path="recompensas" element={<FidelidadeRoute cliente><ClienteRecompensas /></FidelidadeRoute>} />
                  <Route path="pontos" element={<FidelidadeRoute cliente><ClientePontos /></FidelidadeRoute>} />
                  <Route path="historico" element={<ClienteHistorico />} />
                  <Route path="perfil" element={<ClientePerfil />} />
                  <Route path="notificacoes" element={<ClienteNotificacoes />} />
                  <Route path="manual" element={<ManualSistema audience="cliente" />} />
                  <Route path="anamnese" element={<ClienteAnamneseLista />} />
                  <Route path="anamnese/:respostaId" element={<ClienteAnamneseVisualizar />} />
                  <Route path="atendimento/:atendimentoId/anamnese" element={<ClienteAnamnese />} />
                  <Route path="agendamento/:agendamentoId/anamnese" element={<ClienteAnamnese />} />
                </Route>
                
                {/* Rotas do Sistema com Sidebar e Footer */}
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernDashboard />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/clientes" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernClientes />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/servicos" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernServicos />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/profissionais" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernProfissionais />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/agendamentos" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernAgendamentos />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/agenda" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Agenda />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/atendimentos" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernAtendimentos />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/atendimento/:id" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernAtendimento />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/fidelidade" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <FidelidadeRoute allowInactive><Fidelidade /></FidelidadeRoute>
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/fidelidade/gerenciar" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <FidelidadeRoute allowInactive><GerenciarFidelidade /></FidelidadeRoute>
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/fidelidade/recompensas" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <FidelidadeRoute><Recompensas /></FidelidadeRoute>
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/meus-pontos" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <FidelidadeRoute><MeusPontos /></FidelidadeRoute>
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/indicacoes" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <FidelidadeRoute><Indicacoes /></FidelidadeRoute>
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/fidelidade/historico/:id" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <FidelidadeRoute><FidelidadeHistorico /></FidelidadeRoute>
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/financeiro" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernFinanceiro />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/financeiro/pagar" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ContasPagar />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/financeiro/receber" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ContasReceber />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/financeiro/fluxo" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <FluxoCaixa />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/financeiro/caixa" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernCaixa />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/compras" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernCompras />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/relatorios" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernRelatorios />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/estoque" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernEstoque />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/fornecedores" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Fornecedores />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/entradas" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Entradas />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/saas" element={<SimpleLayout><SaasLanding /></SimpleLayout>} />
                <Route path="/saas-admin" element={
                  <SaasAdminRoute>
                    <SistemaLayout theme={currentTheme}>
                      <SaasAdmin />
                    </SistemaLayout>
                  </SaasAdminRoute>
                } />
                <Route path="/saas-admin/empresas" element={
                  <SaasAdminRoute>
                    <SistemaLayout theme={currentTheme}>
                      <SaasEmpresas />
                    </SistemaLayout>
                  </SaasAdminRoute>
                } />
                <Route path="/saas-admin/assinaturas" element={
                  <SaasAdminRoute>
                    <SistemaLayout theme={currentTheme}>
                      <SaasPlanos />
                    </SistemaLayout>
                  </SaasAdminRoute>
                } />
                <Route path="/saas-admin/cobrancas" element={
                  <SaasAdminRoute>
                    <SistemaLayout theme={currentTheme}>
                      <SaasCobrancas />
                    </SistemaLayout>
                  </SaasAdminRoute>
                } />
                <Route path="/saas-admin/pagamentos" element={
                  <SaasAdminRoute>
                    <SistemaLayout theme={currentTheme}>
                      <SaasPagamentosConfig />
                    </SistemaLayout>
                  </SaasAdminRoute>
                } />
                <Route path="/saas-admin/relatorios" element={
                  <SaasAdminRoute>
                    <SistemaLayout theme={currentTheme}>
                      <SaasRelatorios />
                    </SistemaLayout>
                  </SaasAdminRoute>
                } />
                <Route path="/empresa" element={<Navigate to="/configuracoes?tab=empresa&empresaTab=dados" replace />} />
                <Route path="/empresa/unidades" element={<Navigate to="/configuracoes?tab=empresa&empresaTab=unidades" replace />} />
                <Route path="/empresa/assinatura" element={<Navigate to="/configuracoes?tab=empresa&empresaTab=assinatura" replace />} />
                <Route path="/empresa/cobranca" element={<Navigate to="/configuracoes?tab=empresa&empresaTab=cobranca" replace />} />
                <Route path="/empresa/site" element={<Navigate to="/configuracoes?tab=empresa&empresaTab=site" replace />} />
                <Route path="/usuarios" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <GerenciarUsuarios />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/historico" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <HistoricoAtendimentos />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/auditoria" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Auditoria />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/perfil" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernPerfil />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/notificacoes" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernNotificacoes />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/selecionar-empresa" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <SuperAdminSelecionarEmpresa />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/chamados" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <AdminChamados />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/manual" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ManualSistema audience="admin" />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/configuracoes" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernConfiguracoes />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/minhas-comissoes" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <MinhasComissoes />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/importar-servicos" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ImportarServicos />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/anamnese/formularios" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <FormulariosAnamnese />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/anamnese/respostas" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <RespostasAnamnese />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/anamnese/modelos" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModelosAnamnese />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/anamnese/relatorios" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <RelatorioAnamnese />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/cupons" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <GerenciarCupons />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/campanhas" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Campanhas />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/analise-cupons" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <AnaliseCupons />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/disponibilidade" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Disponibilidade />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/categorias-produtos" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <CategoriasProdutos />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/analise-vendas" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <AnaliseVendas />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/performance" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Performance />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/backup" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Backup />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                <Route path="/logs" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Logs />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                {/* Rotas de Termos e Privacidade */}
                <Route path="/termos-uso" element={
                  <SimpleLayout>
                    <TermosUso />
                  </SimpleLayout>
                } />
                <Route path="/politica-privacidade" element={
                  <SimpleLayout>
                    <PoliticaPrivacidade />
                  </SimpleLayout>
                } />                
                {/* Rota 404 com Footer */}
                <Route path="*" element={
                  <SimpleLayout>
                    <Page404 />
                  </SimpleLayout>
                } />
              </Routes>
            </Router>
          </AuthProvider>
        </DadosProvider>
      </FeedbackProvider>
    </ThemeProvider>
  );
}

export default App;
