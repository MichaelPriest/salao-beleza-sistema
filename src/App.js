// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { lightTheme, darkTheme } from './theme';
import { CircularProgress, Box } from '@mui/material';

// Contextos
import { FeedbackProvider } from './contexts/FeedbackContext';
import { DadosProvider } from './contexts/DadosContext';
import { AuthProvider } from './contexts/AuthContext';
import { AuthClienteProvider } from './contexts/AuthClienteContext';

// Services
import firebaseService from './services/firebase';

// ============================================
// 🔥 OVERRIDE GLOBAL PARA BLOQUEAR ERROS DE PERMISSÃO NA ÁREA DO CLIENTE
// ============================================
const originalQuery = firebaseService.query;
const originalGetById = firebaseService.getById;
const originalGetAll = firebaseService.getAll;

// Sobrescrever query para ignorar erros de permissão em usuarios na área do cliente
firebaseService.query = async function(collectionName, ...args) {
  // Se for cliente e tentar acessar usuarios, retorna array vazio SEM ERRO
  if (window.location.pathname.startsWith('/cliente') && collectionName === 'usuarios') {
    console.log('🚫 Bloqueando query em usuarios na área do cliente');
    console.trace(); // 👈 Mostra de onde veio a chamada (opcional, pode remover depois)
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

// Sobrescrever getById para ignorar erros de permissão
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

// Sobrescrever getAll para ignorar erros de permissão
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
// ============================================

// Components
import ModernHeader from './components/ModernHeader';
import ModernSidebar from './components/ModernSidebar';
import PrivateRoute from './components/PrivateRoute';
import GlobalLoading from './components/GlobalLoading';
import GlobalSnackbar from './components/GlobalSnackbar';
import ClienteLayout from './components/ClienteLayout';
import ClientePrivateRoute from './components/ClientePrivateRoute';

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

// Pages de Disponibilidade
import Disponibilidade from './pages/Disponibilidade';

// Pages de Indicações
import Indicacoes from './pages/Indicacoes';

// Pages de Categorias
import CategoriasProdutos from './pages/CategoriasProdutos';

// Pages de Análise de Vendas
import AnaliseVendas from './pages/AnaliseVendas';

// Pages de Performance
import Performance from './pages/Performance';

// Pages de Backup e Logs
import Backup from './pages/Backup';
import Logs from './pages/Logs';

// ============================================
// 🔥 NOVAS PÁGINAS DE ANAMNESE (FORMULÁRIOS)
// ============================================
import FormulariosAnamnese from './pages/Anamnese/FormulariosAnamnese';
import RespostasAnamnese from './pages/Anamnese/RespostasAnamnese';
import ModelosAnamnese from './pages/Anamnese/ModelosAnamnese';
import RelatorioAnamnese from './pages/Anamnese/RelatorioAnamnese';
// ============================================

// Páginas do Cliente
import ClienteLogin from './pages/ClienteLogin';
import ClienteCadastro from './pages/ClienteCadastro';
import ClienteRecuperarSenha from './pages/ClienteRecuperarSenha';
import ClienteDashboard from './pages/ClienteDashboard';
import ClienteAgendamentos from './pages/ClienteAgendamentos';
import ClienteRecompensas from './pages/ClienteRecompensas';
import ClientePontos from './pages/ClientePontos';
import ClienteHistorico from './pages/ClienteHistorico';
import ClientePerfil from './pages/ClientePerfil';
import ClienteNotificacoes from './pages/ClienteNotificacoes';

// ============================================
// 🔥 NOVAS PÁGINAS DO CLIENTE PARA ANAMNESE
// ============================================
import ClienteAnamnese from './pages/ClienteAnamnese';
import ClienteAnamneseLista from './pages/ClienteAnamneseLista';
// ============================================

// Página de Teste
import TesteAPI from './pages/TesteAPI';

// Site Público
import SiteSalao from './pages/SiteSalao';

// Páginas de Erro
import Page404 from './pages/404';
import Page403 from './pages/403';
import Page500 from './pages/500';
import Manutencao from './pages/Manutencao';
import ImportarServicos from './pages/ImportarServicos';

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

// Componente para rotas do sistema (com sidebar)
const SistemaLayout = ({ children, theme }) => (
  <Box sx={{ display: 'flex', minHeight: '100vh' }}>
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
        minHeight: 'calc(100vh - 64px)',
        overflow: 'auto'
      }}>
        {children}
      </Box>
    </Box>
  </Box>
);

function App() {
  const [modoEscuro, setModoEscuro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [configuracoes, setConfiguracoes] = useState(null);
  const currentTheme = modoEscuro ? darkTheme : lightTheme;

  // Carregar configurações do Firebase
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
        } else {
          console.log('ℹ️ Nenhuma configuração encontrada, usando modo claro padrão');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar configurações:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarConfiguracoes();
  }, []);

  // Listener para mudanças no modo escuro via localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'modoEscuro') {
        setModoEscuro(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
                  fontFamily: '"Poppins", "Roboto", "Arial", sans-serif',
                },
                success: {
                  iconTheme: {
                    primary: currentTheme.palette.primary.main,
                    secondary: currentTheme.palette.background.paper,
                  },
                },
                error: {
                  iconTheme: {
                    primary: currentTheme.palette.error?.main || '#f44336',
                    secondary: currentTheme.palette.background.paper,
                  },
                },
              }}
            />
            <GlobalSnackbar />
            
            <Router>
              <Routes>
                {/* =========================================== */}
                {/* ROTA PRINCIPAL - SITE PÚBLICO */}
                {/* =========================================== */}
                <Route path="/" element={<SiteSalao />} />
                
                {/* =========================================== */}
                {/* ROTAS PÚBLICAS */}
                {/* =========================================== */}
                <Route path="/teste" element={<TesteAPI />} />
                <Route path="/403" element={<Page403 />} />
                <Route path="/500" element={<Page500 />} />
                <Route path="/manutencao" element={<Manutencao />} />
                
                {/* =========================================== */}
                {/* ROTAS DO CLIENTE */}
                {/* =========================================== */}
                
                {/* Rotas públicas do cliente (sem proteção) */}
                <Route path="/cliente/login" element={
                  <AuthClienteProvider>
                    <ClienteLogin />
                  </AuthClienteProvider>
                } />
                
                <Route path="/cliente/cadastro" element={
                  <AuthClienteProvider>
                    <ClienteCadastro />
                  </AuthClienteProvider>
                } />
                
                <Route path="/cliente/recuperar-senha" element={
                  <AuthClienteProvider>
                    <ClienteRecuperarSenha />
                  </AuthClienteProvider>
                } />
                
                {/* Rotas protegidas do cliente - com layout compartilhado */}
                <Route path="/cliente" element={
                  <AuthClienteProvider>
                    <ClientePrivateRoute>
                      <ClienteLayout />
                    </ClientePrivateRoute>
                  </AuthClienteProvider>
                }>
                  <Route path="dashboard" element={<ClienteDashboard />} />
                  <Route path="agendamentos" element={<ClienteAgendamentos />} />
                  <Route path="recompensas" element={<ClienteRecompensas />} />
                  <Route path="pontos" element={<ClientePontos />} />
                  <Route path="historico" element={<ClienteHistorico />} />
                  <Route path="perfil" element={<ClientePerfil />} />
                  <Route path="notificacoes" element={<ClienteNotificacoes />} />
                  
                  {/* 🔥 NOVAS ROTAS DE ANAMNESE PARA CLIENTE */}
                  <Route path="anamnese" element={<ClienteAnamneseLista />} />
                  <Route path="anamnese/:respostaId" element={<ClienteAnamnese />} />
                </Route>
                
                {/* 🔥 ROTA ESPECÍFICA PARA RESPONDER FORMULÁRIO DE ATENDIMENTO */}
                <Route path="/cliente/atendimento/:atendimentoId/anamnese" element={
                  <AuthClienteProvider>
                    <ClientePrivateRoute>
                      <ClienteLayout>
                        <ClienteAnamnese />
                      </ClienteLayout>
                    </ClientePrivateRoute>
                  </AuthClienteProvider>
                } />
                
                {/* 🔥 NOVA ROTA ESPECÍFICA PARA RESPONDER FORMULÁRIO DE AGENDAMENTO */}
                <Route path="/cliente/agendamento/:agendamentoId/anamnese" element={
                  <AuthClienteProvider>
                    <ClientePrivateRoute>
                      <ClienteLayout>
                        <ClienteAnamnese />
                      </ClienteLayout>
                    </ClientePrivateRoute>
                  </AuthClienteProvider>
                } />
                
                {/* =========================================== */}
                {/* ROTAS DO SISTEMA (FUNCIONÁRIOS) */}
                {/* =========================================== */}
                
                {/* Login do sistema */}
                <Route path="/login" element={<ModernLogin />} />
                
                {/* DASHBOARD DO SISTEMA */}
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernDashboard />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* CLIENTES */}
                <Route path="/clientes" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernClientes />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* SERVIÇOS */}
                <Route path="/servicos" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernServicos />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* PROFISSIONAIS */}
                <Route path="/profissionais" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernProfissionais />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* AGENDAMENTOS */}
                <Route path="/agendamentos" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernAgendamentos />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* AGENDA */}
                <Route path="/agenda" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Agenda />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* ATENDIMENTOS */}
                <Route path="/atendimentos" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernAtendimentos />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* ATENDIMENTO DETALHE */}
                <Route path="/atendimento/:id" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernAtendimento />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* FIDELIDADE */}
                <Route path="/fidelidade" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Fidelidade />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* GERENCIAR FIDELIDADE */}
                <Route path="/fidelidade/gerenciar" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <GerenciarFidelidade />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* RECOMPENSAS */}
                <Route path="/fidelidade/recompensas" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Recompensas />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* MEUS PONTOS */}
                <Route path="/meus-pontos" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <MeusPontos />
                    </SistemaLayout>
                  </PrivateRoute>
                } />

                {/* Indicações */}  
                <Route path="/indicacoes" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Indicacoes />
                    </SistemaLayout>
                  </PrivateRoute>
                } />

                {/* HISTÓRICO FIDELIDADE */}
                <Route path="/fidelidade/historico/:id" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <FidelidadeHistorico />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* FINANCEIRO */}
                <Route path="/financeiro" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernFinanceiro />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* CONTAS A PAGAR */}
                <Route path="/financeiro/pagar" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ContasPagar />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* CONTAS A RECEBER */}
                <Route path="/financeiro/receber" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ContasReceber />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* FLUXO DE CAIXA */}
                <Route path="/financeiro/fluxo" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <FluxoCaixa />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* COMPRAS */}
                <Route path="/compras" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernCompras />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* RELATÓRIOS */}
                <Route path="/relatorios" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernRelatorios />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* ESTOQUE */}
                <Route path="/estoque" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernEstoque />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* FORNECEDORES */}
                <Route path="/fornecedores" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Fornecedores />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* ENTRADAS */}
                <Route path="/entradas" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Entradas />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* USUÁRIOS */}
                <Route path="/usuarios" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <GerenciarUsuarios />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* HISTÓRICO ATENDIMENTOS */}
                <Route path="/historico" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <HistoricoAtendimentos />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* AUDITORIA */}
                <Route path="/auditoria" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Auditoria />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* PERFIL */}
                <Route path="/perfil" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernPerfil />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* NOTIFICAÇÕES */}
                <Route path="/notificacoes" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernNotificacoes />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* CONFIGURAÇÕES */}
                <Route path="/configuracoes" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModernConfiguracoes />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* MINHAS COMISSÕES */}
                <Route path="/minhas-comissoes" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <MinhasComissoes />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* IMPORTAR SERVIÇOS */}
                <Route path="/importar-servicos" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ImportarServicos />
                    </SistemaLayout>
                  </PrivateRoute>
                } />

                {/* =========================================== */}
                {/* 🔥 NOVAS ROTAS - ANAMNESE (FORMULÁRIOS) */}
                {/* =========================================== */}
                
                {/* Gerenciamento de Formulários */}
                <Route path="/anamnese/formularios" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <FormulariosAnamnese />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* Respostas dos Formulários */}
                <Route path="/anamnese/respostas" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <RespostasAnamnese />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* Modelos de Formulários */}
                <Route path="/anamnese/modelos" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <ModelosAnamnese />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* Relatórios de Anamnese */}
                <Route path="/anamnese/relatorios" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <RelatorioAnamnese />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* Detalhe de uma resposta específica */}
                <Route path="/anamnese/resposta/:id" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <RespostasAnamnese detalheId={true} />
                    </SistemaLayout>
                  </PrivateRoute>
                } />

                {/* =========================================== */}
                {/* NOVAS ROTAS - MARKETING E PROMOÇÕES */}
                {/* =========================================== */}
                
                {/* CUPONS DE DESCONTO */}
                <Route path="/cupons" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <GerenciarCupons />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* CAMPANHAS */}
                <Route path="/campanhas" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Campanhas />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* ANÁLISE DE CUPONS */}
                <Route path="/analise-cupons" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <AnaliseCupons />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* =========================================== */}
                {/* NOVAS ROTAS - PROFISSIONAIS */}
                {/* =========================================== */}
                
                {/* DISPONIBILIDADE DE PROFISSIONAIS */}
                <Route path="/disponibilidade" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Disponibilidade />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* =========================================== */}
                {/* NOVAS ROTAS - ESTOQUE */}
                {/* =========================================== */}
                
                {/* CATEGORIAS DE PRODUTOS */}
                <Route path="/categorias-produtos" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <CategoriasProdutos />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* =========================================== */}
                {/* NOVAS ROTAS - RELATÓRIOS */}
                {/* =========================================== */}
                
                {/* ANÁLISE DE VENDAS */}
                <Route path="/analise-vendas" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <AnaliseVendas />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* PERFORMANCE */}
                <Route path="/performance" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Performance />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* =========================================== */}
                {/* NOVAS ROTAS - ADMINISTRAÇÃO */}
                {/* =========================================== */}
                
                {/* BACKUP */}
                <Route path="/backup" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Backup />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* LOGS DO SISTEMA */}
                <Route path="/logs" element={
                  <PrivateRoute>
                    <SistemaLayout theme={currentTheme}>
                      <Logs />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* =========================================== */}
                {/* ROTA 404 - DEVE SER A ÚLTIMA */}
                {/* =========================================== */}
                <Route path="*" element={<Page404 />} />
              </Routes>
            </Router>
          </AuthProvider>
        </DadosProvider>
      </FeedbackProvider>
    </ThemeProvider>
  );
}

export default App;
