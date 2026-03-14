// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';

// Contextos
import { FeedbackProvider } from './contexts/FeedbackContext';
import { DadosProvider } from './contexts/DadosContext';
import { AuthProvider } from './contexts/AuthContext';
import { AuthClienteProvider } from './contexts/AuthClienteContext';

// Components
import ModernHeader from './components/ModernHeader';
import ModernSidebar from './components/ModernSidebar';
import PrivateRoute from './components/PrivateRoute';
import GlobalLoading from './components/GlobalLoading';
import GlobalSnackbar from './components/GlobalSnackbar';
import ClienteLayout from './components/ClienteLayout';

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

// Componente para rotas do sistema (com sidebar)
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
                
                {/* Dashboard - rota raiz */}
                <Route path="/" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <ModernDashboard />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* Todas as outras rotas do sistema - SEM aninhamento de Routes */}
                <Route path="/clientes" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <ModernClientes />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/servicos" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <ModernServicos />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/profissionais" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <ModernProfissionais />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/agendamentos" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <ModernAgendamentos />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/agenda" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <Agenda />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/atendimentos" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <ModernAtendimentos />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/atendimento/:id" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <ModernAtendimento />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/fidelidade" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <Fidelidade />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/fidelidade/gerenciar" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <GerenciarFidelidade />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/fidelidade/recompensas" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <Recompensas />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/meus-pontos" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <MeusPontos />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/fidelidade/historico/:id" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <FidelidadeHistorico />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/financeiro" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <ModernFinanceiro />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/financeiro/pagar" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <ContasPagar />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/financeiro/receber" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <ContasReceber />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/financeiro/fluxo" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <FluxoCaixa />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/compras" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <ModernCompras />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/relatorios" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <ModernRelatorios />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/estoque" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <ModernEstoque />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/fornecedores" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <Fornecedores />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/entradas" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <Entradas />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/usuarios" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <GerenciarUsuarios />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/historico" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <HistoricoAtendimentos />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/auditoria" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <Auditoria />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/perfil" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <ModernPerfil />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/notificacoes" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <ModernNotificacoes />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/configuracoes" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <ModernConfiguracoes />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/minhas-comissoes" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <MinhasComissoes />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/importar-servicos" element={
                  <PrivateRoute>
                    <SistemaLayout>
                      <ImportarServicos />
                    </SistemaLayout>
                  </PrivateRoute>
                } />
                
                {/* =========================================== */}
                {/* ROTAS DO CLIENTE - COM SEU PRÓPRIO PROVIDER */}
                {/* =========================================== */}
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
                
                {/* Rotas protegidas do cliente com layout */}
                <Route path="/cliente/dashboard" element={
                  <AuthClienteProvider>
                    <ClienteLayout>
                      <ClienteDashboard />
                    </ClienteLayout>
                  </AuthClienteProvider>
                } />
                
                <Route path="/cliente/agendamentos" element={
                  <AuthClienteProvider>
                    <ClienteLayout>
                      <ClienteAgendamentos />
                    </ClienteLayout>
                  </AuthClienteProvider>
                } />
                
                <Route path="/cliente/recompensas" element={
                  <AuthClienteProvider>
                    <ClienteLayout>
                      <ClienteRecompensas />
                    </ClienteLayout>
                  </AuthClienteProvider>
                } />
                
                <Route path="/cliente/pontos" element={
                  <AuthClienteProvider>
                    <ClienteLayout>
                      <ClientePontos />
                    </ClienteLayout>
                  </AuthClienteProvider>
                } />
                
                <Route path="/cliente/historico" element={
                  <AuthClienteProvider>
                    <ClienteLayout>
                      <ClienteHistorico />
                    </ClienteLayout>
                  </AuthClienteProvider>
                } />
                
                <Route path="/cliente/perfil" element={
                  <AuthClienteProvider>
                    <ClienteLayout>
                      <ClientePerfil />
                    </ClienteLayout>
                  </AuthClienteProvider>
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
