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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FeedbackProvider>
        <DadosProvider>
          <AuthProvider>
            <AuthClienteProvider>
              <GlobalLoading />
              <Toaster position="top-right" />
              <GlobalSnackbar />
              
              <Router>
                <Routes>
                  {/* =========================================== */}
                  {/* ROTAS PÚBLICAS - SEM SIDEBAR */}
                  {/* =========================================== */}
                  <Route path="/login" element={<ModernLogin />} />
                  <Route path="/teste" element={<TesteAPI />} />
                  <Route path="/site" element={<SiteSalao />} />
                  <Route path="/403" element={<Page403 />} />
                  <Route path="/500" element={<Page500 />} />
                  <Route path="/manutencao" element={<Manutencao />} />
                  
                  {/* =========================================== */}
                  {/* ROTAS DO CLIENTE */}
                  {/* =========================================== */}
                  <Route path="/cliente/login" element={<ClienteLogin />} />
                  <Route path="/cliente/cadastro" element={<ClienteCadastro />} />
                  <Route path="/cliente/recuperar-senha" element={<ClienteRecuperarSenha />} />
                  
                  {/* Rotas do cliente com layout próprio */}
                  <Route path="/cliente" element={<ClienteLayout />}>
                    <Route path="dashboard" element={<ClienteDashboard />} />
                    <Route path="agendamentos" element={<ClienteAgendamentos />} />
                    <Route path="recompensas" element={<ClienteRecompensas />} />
                    <Route path="pontos" element={<ClientePontos />} />
                    <Route path="historico" element={<ClienteHistorico />} />
                    <Route path="perfil" element={<ClientePerfil />} />
                  </Route>
                  
                  {/* =========================================== */}
                  {/* ROTAS PRIVADAS DO SISTEMA - COM SIDEBAR */}
                  {/* =========================================== */}
                  <Route path="/" element={
                    <PrivateRoute>
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
                          </main>
                        </div>
                      </div>
                    </PrivateRoute>
                  } />
                  
                  {/* =========================================== */}
                  {/* ROTA 404 - DEVE SER A ÚLTIMA */}
                  {/* =========================================== */}
                  <Route path="*" element={<Page404 />} />
                </Routes>
              </Router>
            </AuthClienteProvider>
          </AuthProvider>
        </DadosProvider>
      </FeedbackProvider>
    </ThemeProvider>
  );
}

export default App;
