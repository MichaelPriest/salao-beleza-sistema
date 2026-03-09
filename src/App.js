import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import ModernHeader from './components/ModernHeader';
import ModernSidebar from './components/ModernSidebar';
import PrivateRoute from './components/PrivateRoute';

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
import ModernAgendamentos from './pages/ModernAgendamentos';
import ModernAtendimentos from './pages/ModernAtendimentos';
import ModernAtendimento from './pages/ModernAtendimento';

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
import DiagnosticoCompleto from './pages/DiagnosticoCompleto';

// Página de Teste (opcional, pode remover depois)
import TesteAPI from './pages/TesteAPI';

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
          
          {/* Rotas Privadas */}
          <Route path="/" element={<ModernDashboard />} />
          
          {/* Operacional */}
          <Route path="/clientes" element={<ModernClientes />} />
          <Route path="/servicos" element={<ModernServicos />} />
          <Route path="/profissionais" element={<ModernProfissionais />} />
          <Route path="/agendamentos" element={<ModernAgendamentos />} />
          <Route path="/atendimentos" element={<ModernAtendimentos />} />
          <Route path="/atendimento/:id" element={<ModernAtendimento />} />
          
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
          <Route path="/debug" element={<Debug />} />
          {/* Perfil e Configurações */}
          <Route path="/perfil" element={<ModernPerfil />} />
          <Route path="/notificacoes" element={<ModernNotificacoes />} />
          <Route path="/configuracoes" element={<ModernConfiguracoes />} />
          // Adicione esta rota em AnimatedRoutes
          <Route path="/diagnostico" element={<DiagnosticoCompleto />} />

          {/* Rota fallback - 404 */}
          <Route path="*" element={<div>Página não encontrada</div>} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
      <Router>
        <Routes>
          {/* Rotas sem sidebar */}
          <Route path="/login" element={<ModernLogin />} />
          <Route path="/teste" element={<TesteAPI />} />
          
          {/* Rotas com sidebar - todas as outras rotas */}
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
    </ThemeProvider>
  );
}

export default App;
