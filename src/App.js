// src/App.js
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';

// Contextos
import { FeedbackProvider } from './contexts/FeedbackContext';
import { DadosProvider } from './contexts/DadosContext';
import { AuthProvider } from './contexts/AuthContext';

// Components
import ModernHeader from './components/ModernHeader';
import ModernSidebar from './components/ModernSidebar';
import PrivateRoute from './components/PrivateRoute';
import GlobalLoading from './components/GlobalLoading';
import GlobalSnackbar from './components/GlobalSnackbar';

// Lazy load das páginas do cliente para evitar carregamento desnecessário
const AuthClienteProvider = lazy(() => import('./contexts/AuthClienteContext').then(m => ({ default: m.AuthClienteProvider })));
const ClienteLayout = lazy(() => import('./components/ClienteLayout'));
const ClienteLogin = lazy(() => import('./pages/ClienteLogin'));
const ClienteCadastro = lazy(() => import('./pages/ClienteCadastro'));
const ClienteRecuperarSenha = lazy(() => import('./pages/ClienteRecuperarSenha'));
const ClienteDashboard = lazy(() => import('./pages/ClienteDashboard'));
const ClienteAgendamentos = lazy(() => import('./pages/ClienteAgendamentos'));
const ClienteRecompensas = lazy(() => import('./pages/ClienteRecompensas'));
const ClientePontos = lazy(() => import('./pages/ClientePontos'));
const ClienteHistorico = lazy(() => import('./pages/ClienteHistorico'));
const ClientePerfil = lazy(() => import('./pages/ClientePerfil'));

// Importações normais (não cliente)
import ModernDashboard from './pages/ModernDashboard';
import ModernLogin from './pages/ModernLogin';
import ModernPerfil from './pages/ModernPerfil';
import ModernNotificacoes from './pages/ModernNotificacoes';
import ModernConfiguracoes from './pages/ModernConfiguracoes';
import ModernClientes from './pages/ModernClientes';
import ModernServicos from './pages/ModernServicos';
import ModernProfissionais from './pages/ModernProfissionais';
import Agenda from './pages/agenda';
import ModernAgendamentos from './pages/ModernAgendamentos';
import ModernAtendimentos from './pages/ModernAtendimentos';
import ModernAtendimento from './pages/ModernAtendimento';
import Fidelidade from './pages/Fidelidade';
import GerenciarFidelidade from './pages/GerenciarFidelidade';
import Recompensas from './pages/Recompensas';
import MeusPontos from './pages/MeusPontos';
import FidelidadeHistorico from './pages/FidelidadeHistorico';
import ModernFinanceiro from './pages/ModernFinanceiro';
import ModernCompras from './pages/ModernCompras';
import ModernRelatorios from './pages/ModernRelatorios';
import ContasPagar from './pages/ContasPagar';
import ContasReceber from './pages/ContasReceber';
import FluxoCaixa from './pages/FluxoCaixa';
import ModernEstoque from './pages/ModernEstoque';
import Fornecedores from './pages/Fornecedores';
import Entradas from './pages/Entradas';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import HistoricoAtendimentos from './pages/HistoricoAtendimentos';
import Auditoria from './pages/Auditoria';
import MinhasComissoes from './pages/MinhasComissoes';
import TesteAPI from './pages/TesteAPI';
import SiteSalao from './pages/SiteSalao';
import Page404 from './pages/404';
import Page403 from './pages/403';
import Page500 from './pages/500';
import Manutencao from './pages/Manutencao';
import ImportarServicos from './pages/ImportarServicos';

const theme = createTheme({
  palette: {
    primary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    secondary: {
      main: '#ff4081',
      light: '#ff79b0',
      dark: '#c60055',
    },
    background: {
      default: '#faf5ff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
});

const SistemaLayout = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <ModernSidebar />
    <div style={{ 
      flexGrow: 1, 
      display: 'flex', 
      flexDirection: 'column',
      width: 'calc(100% - 300px)',
    }}>
      <ModernHeader />
      <main style={{ 
        flexGrow: 1, 
        padding: '24px',
        backgroundColor: '#faf5ff',
        minHeight: 'calc(100vh - 64px)',
        overflow: 'auto'
      }}>
        {children}
      </main>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FeedbackProvider>
        <DadosProvider>
          {/* Provider do SISTEMA (funcionários) */}
          <AuthProvider>
            <GlobalLoading />
            <Toaster position="top-right" />
            <GlobalSnackbar />
            
            <Router>
              <Routes>
                {/* =========================================== */}
                {/* ROTAS PÚBLICAS */}
                {/* =========================================== */}
                <Route path="/teste" element={<TesteAPI />} />
                <Route path="/site" element={<SiteSalao />} />
                <Route path="/403" element={<Page403 />} />
                <Route path="/500" element={<Page500 />} />
                <Route path="/manutencao" element={<Manutencao />} />
                
                {/* =========================================== */}
                {/* ROTAS DO SISTEMA (FUNCIONÁRIOS) */}
                {/* =========================================== */}
                
                {/* Login do sistema */}
                <Route path="/login" element={<ModernLogin />} />
                
                {/* Rotas protegidas do sistema */}
                <Route path="/" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <Routes>
                        <Route index element={<ModernDashboard />} />
                        <Route path="clientes" element={<ModernClientes />} />
                        <Route path="servicos" element={<ModernServicos />} />
                        <Route path="profissionais" element={<ModernProfissionais />} />
                        <Route path="agendamentos" element={<ModernAgendamentos />} />
                        <Route path="agenda" element={<Agenda />} />
                        <Route path="atendimentos" element={<ModernAtendimentos />} />
                        <Route path="atendimento/:id" element={<ModernAtendimento />} />
                        <Route path="fidelidade" element={<Fidelidade />} />
                        <Route path="fidelidade/gerenciar" element={<GerenciarFidelidade />} />
                        <Route path="fidelidade/recompensas" element={<Recompensas />} />
                        <Route path="meus-pontos" element={<MeusPontos />} />
                        <Route path="fidelidade/historico/:id" element={<FidelidadeHistorico />} />
                        <Route path="financeiro" element={<ModernFinanceiro />} />
                        <Route path="financeiro/pagar" element={<ContasPagar />} />
                        <Route path="financeiro/receber" element={<ContasReceber />} />
                        <Route path="financeiro/fluxo" element={<FluxoCaixa />} />
                        <Route path="compras" element={<ModernCompras />} />
                        <Route path="relatorios" element={<ModernRelatorios />} />
                        <Route path="estoque" element={<ModernEstoque />} />
                        <Route path="fornecedores" element={<Fornecedores />} />
                        <Route path="entradas" element={<Entradas />} />
                        <Route path="usuarios" element={<GerenciarUsuarios />} />
                        <Route path="historico" element={<HistoricoAtendimentos />} />
                        <Route path="auditoria" element={<Auditoria />} />
                        <Route path="perfil" element={<ModernPerfil />} />
                        <Route path="notificacoes" element={<ModernNotificacoes />} />
                        <Route path="configuracoes" element={<ModernConfiguracoes />} />
                        <Route path="minhas-comissoes" element={<MinhasComissoes />} />
                        <Route path="importar-servicos" element={<ImportarServicos />} />
                      </Routes>
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* =========================================== */}
                {/* ROTAS DO CLIENTE - COM SEU PRÓPRIO PROVIDER */}
                {/* =========================================== */}
                <Route path="/cliente/*" element={
                  <Suspense fallback={<div>Carregando...</div>}>
                    <AuthClienteProvider>
                      <Routes>
                        <Route path="login" element={<ClienteLogin />} />
                        <Route path="cadastro" element={<ClienteCadastro />} />
                        <Route path="recuperar-senha" element={<ClienteRecuperarSenha />} />
                        <Route path="/" element={<ClienteLayout />}>
                          <Route path="dashboard" element={<ClienteDashboard />} />
                          <Route path="agendamentos" element={<ClienteAgendamentos />} />
                          <Route path="recompensas" element={<ClienteRecompensas />} />
                          <Route path="pontos" element={<ClientePontos />} />
                          <Route path="historico" element={<ClienteHistorico />} />
                          <Route path="perfil" element={<ClientePerfil />} />
                        </Route>
                      </Routes>
                    </AuthClienteProvider>
                  </Suspense>
                } />
                
                {/* =========================================== */}
                {/* ROTA 404 */}
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
