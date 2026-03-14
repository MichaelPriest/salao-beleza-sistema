// src/components/PageTitle.js
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/': 'Dashboard',
  '/clientes': 'Clientes',
  '/servicos': 'Serviços',
  '/profissionais': 'Profissionais',
  '/agendamentos': 'Agendamentos',
  '/agenda': 'Agenda',
  '/atendimentos': 'Atendimentos',
  '/fidelidade': 'Fidelidade',
  '/fidelidade/gerenciar': 'Gerenciar Fidelidade',
  '/fidelidade/recompensas': 'Recompensas',
  '/meus-pontos': 'Meus Pontos',
  '/financeiro': 'Financeiro',
  '/financeiro/pagar': 'Contas a Pagar',
  '/financeiro/receber': 'Contas a Receber',
  '/financeiro/fluxo': 'Fluxo de Caixa',
  '/compras': 'Compras',
  '/relatorios': 'Relatórios',
  '/estoque': 'Estoque',
  '/fornecedores': 'Fornecedores',
  '/entradas': 'Entradas',
  '/usuarios': 'Usuários',
  '/historico': 'Histórico',
  '/auditoria': 'Auditoria',
  '/perfil': 'Perfil',
  '/notificacoes': 'Notificações',
  '/configuracoes': 'Configurações',
  '/minhas-comissoes': 'Minhas Comissões',
  '/importar-servicos': 'Importar Serviços',
  
  // Rotas do cliente
  '/cliente/dashboard': 'Área do Cliente',
  '/cliente/agendamentos': 'Meus Agendamentos',
  '/cliente/recompensas': 'Minhas Recompensas',
  '/cliente/pontos': 'Meus Pontos',
  '/cliente/historico': 'Meu Histórico',
  '/cliente/perfil': 'Meu Perfil',
  '/cliente/login': 'Login do Cliente',
  '/cliente/cadastro': 'Cadastro de Cliente',
  '/cliente/recuperar-senha': 'Recuperar Senha',
  
  // Páginas públicas
  '/login': 'Login',
  '/teste': 'Página de Teste',
  '/site': 'Site do Salão',
  '/403': 'Acesso Negado',
  '/500': 'Erro Interno',
  '/manutencao': 'Manutenção',
};

function PageTitle() {
  const location = useLocation();
  const path = location.pathname;
  
  // Tentar匹配 exato primeiro
  let title = pageTitles[path];
  
  // Se não encontrar, tentar匹配 rotas dinâmicas (como /atendimento/:id)
  if (!title) {
    if (path.startsWith('/atendimento/')) {
      title = 'Detalhes do Atendimento';
    } else if (path.startsWith('/fidelidade/historico/')) {
      title = 'Histórico de Fidelidade';
    }
  }
  
  const defaultTitle = 'BeautyPro - Sistema para Salão';
  
  return (
    <Helmet>
      <title>{title ? `${title} | BeautyPro` : defaultTitle}</title>
    </Helmet>
  );
}

export default PageTitle;
