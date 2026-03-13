// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Contextos
import { FeedbackProvider } from './contexts/FeedbackContext';
import { DadosProvider } from './contexts/DadosContext'; // 🔥 NOVO CONTEXTO

// Components
import ModernHeader from './components/ModernHeader';
import ModernSidebar from './components/ModernSidebar';
import PrivateRoute from './components/PrivateRoute';
import GlobalLoading from './components/GlobalLoading';
import GlobalSnackbar from './components/GlobalSnackbar';

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

// Página de Teste (opcional, pode remover depois)
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
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

// Componente que usa o useLocation
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        style={{ 
          width: '100%',
          height: '100%',
        }}
      >
        <Routes location={location}>
          {/* Rotas Públicas */}
          <Route path="/login" element={<ModernLogin />} />
          <Route path="/teste" element={<TesteAPI />} />
          <Route path="/site" element={<SiteSalao />} />
          
          {/* 🔥 PÁGINAS DE ERRO PÚBLICAS (FORA DO PRIVATE ROUTE) */}
          <Route path="/403" element={<Page403 />} />
          <Route path="/500" element={<Page500 />} />
          <Route path="/manutencao" element={<Manutencao />} />
          
          {/* Rotas Privadas */}
          <Route path="/" element={<ModernDashboard />} />
          
          {/* Operacional */}
          <Route path="/clientes" element={<ModernClientes />} />
          <Route path="/servicos" element={<ModernServicos />} />
          <Route path="/profissionais" element={<ModernProfissionais />} />
          <Route path="/agendamentos" element={<ModernAgendamentos />} />
          <Route path="/agenda" element={<Agenda />} /> 
          <Route path="/atendimentos" element={<ModernAtendimentos />} />
          <Route path="/atendimento/:id" element={<ModernAtendimento />} />

          {/* Fidelidade */}
          <Route path="/fidelidade" element={<Fidelidade />} />
          <Route path="/fidelidade/gerenciar" element={<GerenciarFidelidade />} />
          <Route path="/fidelidade/recompensas" element={<Recompensas />} />
          <Route path="/meus-pontos" element={<MeusPontos />} />         
          
          {/* Financeiro */}
          <Route path="/financeiro" element={<ModernFinanceiro />} />
          <Route path="/financeiro/pagar" element={<ContasPagar />} />
          <Route path="/financeiro/receber" element={<ContasReceber />} />
          <Route path="/financeiro/fluxo" element={<FluxoCaixa />} />
          <Route path="/compras" element={<ModernCompras />} />
          <Route path="/relatorios" element={<ModernRelatorios />} />
          
          {/* Estoque */}
          <Route path="/estoque" element={<ModernEstoque />} />
          <Route path="/fornecedores" element={<Fornecedores />} />
          <Route path="/entradas" element={<Entradas />} />
          
          {/* Administrativo */}
          <Route path="/usuarios" element={<GerenciarUsuarios />} />
          <Route path="/historico" element={<HistoricoAtendimentos />} />
          <Route path="/auditoria" element={<Auditoria />} />

          {/* Perfil e Configurações */}
          <Route path="/perfil" element={<ModernPerfil />} />
          <Route path="/notificacoes" element={<ModernNotificacoes />} />
          <Route path="/configuracoes" element={<ModernConfiguracoes />} />
          <Route path="/minhas-comissoes" element={<MinhasComissoes />} />
          <Route path="/importar-servicos" element={<ImportarServicos />} />
          
          {/* Rota 404 - DEVE SER A ÚLTIMA */}
          <Route path="*" element={<Page404 />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FeedbackProvider>
        {/* 🔥 DADOS PROVIDER - ENVOLVE TUDO PARA COMPARTILHAR DADOS */}
        <DadosProvider>
          {/* Loading Global */}
          <GlobalLoading />
          
          {/* Toaster do react-hot-toast */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '10px',
              },
              success: {
                icon: '✅',
                style: {
                  background: '#4caf50',
                },
              },
              error: {
                icon: '❌',
                style: {
                  background: '#f44336',
                },
              },
              loading: {
                icon: '⏳',
                style: {
                  background: '#ff9800',
                },
              },
            }}
          />
          
          {/* Snackbar Global do MUI */}
          <GlobalSnackbar />
          
          <Router>
            <Routes>
              {/* Rotas sem sidebar - PÚBLICAS */}
              <Route path="/login" element={<ModernLogin />} />
              <Route path="/teste" element={<TesteAPI />} />
              <Route path="/site" element={<SiteSalao />} />
              <Route path="/403" element={<Page403 />} />
              <Route path="/500" element={<Page500 />} />
              <Route path="/manutencao" element={<Manutencao />} />
              
              {/* Rotas com sidebar - todas as outras rotas (privadas) */}
              <Route path="/*" element={
                <PrivateRoute>
                  <div style={{ display: 'flex', minHeight: '100vh' }}>
                    <ModernSidebar />
                    <div style={{ 
                      flexGrow: 1, 
                      display: 'flex', 
                      flexDirection: 'column',
                      width: 'calc(100% - 300px)',
                      transition: 'width 0.3s ease',
                    }}>
                      <ModernHeader />
                      <main style={{ 
                        flexGrow: 1, 
                        padding: '24px',
                        backgroundColor: '#faf5ff',
                        minHeight: 'calc(100vh - 64px)',
                        overflow: 'auto'
                      }}>
                        <AnimatedRoutes />
                      </main>
                    </div>
                  </div>
                </PrivateRoute>
              } />
            </Routes>
          </Router>
        </DadosProvider>
      </FeedbackProvider>
    </ThemeProvider>
  );
}

export default App;
