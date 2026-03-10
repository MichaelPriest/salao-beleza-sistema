// src/services/clientesService.js
import { firebaseService } from './firebase';

export const clientesService = {
  // Listar todos os clientes
  listar: async () => {
    try {
      const clientes = await firebaseService.getAll('clientes');
      
      // Ordenar por nome
      clientes.sort((a, b) => a.nome?.localeCompare(b.nome));
      
      return clientes;
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      throw error;
    }
  },

  // Buscar cliente por ID
  buscarPorId: async (id) => {
    try {
      const cliente = await firebaseService.getById('clientes', id);
      return cliente;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      throw error;
    }
  },

  // Buscar cliente por email
  buscarPorEmail: async (email) => {
    try {
      const clientes = await firebaseService.getAll('clientes');
      return clientes.find(c => c.email?.toLowerCase() === email.toLowerCase());
    } catch (error) {
      console.error('Erro ao buscar cliente por email:', error);
      throw error;
    }
  },

  // Buscar cliente por telefone
  buscarPorTelefone: async (telefone) => {
    try {
      const clientes = await firebaseService.getAll('clientes');
      // Remover formatação do telefone para comparação
      const telefoneLimpo = telefone.replace(/\D/g, '');
      return clientes.find(c => c.telefone?.replace(/\D/g, '') === telefoneLimpo);
    } catch (error) {
      console.error('Erro ao buscar cliente por telefone:', error);
      throw error;
    }
  },

  // Criar novo cliente
  criar: async (cliente) => {
    try {
      // Validar dados obrigatórios
      if (!cliente.nome) {
        throw new Error('Nome do cliente é obrigatório');
      }

      // Verificar se já existe cliente com mesmo email (se fornecido)
      if (cliente.email) {
        const existente = await clientesService.buscarPorEmail(cliente.email);
        if (existente) {
          throw new Error('Já existe um cliente cadastrado com este email');
        }
      }

      const dadosParaSalvar = {
        nome: String(cliente.nome).trim(),
        email: cliente.email ? String(cliente.email).toLowerCase().trim() : null,
        telefone: cliente.telefone ? String(cliente.telefone).trim() : null,
        celular: cliente.celular ? String(cliente.celular).trim() : null,
        cpf: cliente.cpf ? String(cliente.cpf).replace(/\D/g, '') : null,
        rg: cliente.rg ? String(cliente.rg) : null,
        dataNascimento: cliente.dataNascimento ? String(cliente.dataNascimento) : null,
        endereco: cliente.endereco ? {
          logradouro: String(cliente.endereco.logradouro || '').trim(),
          numero: String(cliente.endereco.numero || '').trim(),
          complemento: String(cliente.endereco.complemento || '').trim(),
          bairro: String(cliente.endereco.bairro || '').trim(),
          cidade: String(cliente.endereco.cidade || '').trim(),
          estado: String(cliente.endereco.estado || '').trim(),
          cep: cliente.endereco.cep ? String(cliente.endereco.cep).replace(/\D/g, '') : null
        } : null,
        observacoes: cliente.observacoes ? String(cliente.observacoes).trim() : null,
        comoConheceu: cliente.comoConheceu ? String(cliente.comoConheceu) : null,
        indicadoPor: cliente.indicadoPor ? String(cliente.indicadoPor) : null,
        status: cliente.status || 'ativo',
        dataCadastro: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const novoId = await firebaseService.add('clientes', dadosParaSalvar);
      
      // Registrar log de auditoria
      await registrarLog('criar', 'clientes', novoId, `Cliente ${dadosParaSalvar.nome} criado`);

      return { ...dadosParaSalvar, id: novoId };
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  },

  // Atualizar cliente
  atualizar: async (id, cliente) => {
    try {
      // Validar dados obrigatórios
      if (!cliente.nome) {
        throw new Error('Nome do cliente é obrigatório');
      }

      // Verificar se já existe outro cliente com mesmo email
      if (cliente.email) {
        const existente = await clientesService.buscarPorEmail(cliente.email);
        if (existente && existente.id !== id) {
          throw new Error('Já existe outro cliente cadastrado com este email');
        }
      }

      const dadosParaSalvar = {
        nome: String(cliente.nome).trim(),
        email: cliente.email ? String(cliente.email).toLowerCase().trim() : null,
        telefone: cliente.telefone ? String(cliente.telefone).trim() : null,
        celular: cliente.celular ? String(cliente.celular).trim() : null,
        cpf: cliente.cpf ? String(cliente.cpf).replace(/\D/g, '') : null,
        rg: cliente.rg ? String(cliente.rg) : null,
        dataNascimento: cliente.dataNascimento ? String(cliente.dataNascimento) : null,
        endereco: cliente.endereco ? {
          logradouro: String(cliente.endereco.logradouro || '').trim(),
          numero: String(cliente.endereco.numero || '').trim(),
          complemento: String(cliente.endereco.complemento || '').trim(),
          bairro: String(cliente.endereco.bairro || '').trim(),
          cidade: String(cliente.endereco.cidade || '').trim(),
          estado: String(cliente.endereco.estado || '').trim(),
          cep: cliente.endereco.cep ? String(cliente.endereco.cep).replace(/\D/g, '') : null
        } : null,
        observacoes: cliente.observacoes ? String(cliente.observacoes).trim() : null,
        comoConheceu: cliente.comoConheceu ? String(cliente.comoConheceu) : null,
        indicadoPor: cliente.indicadoPor ? String(cliente.indicadoPor) : null,
        status: cliente.status || 'ativo',
        updatedAt: new Date().toISOString()
      };

      await firebaseService.update('clientes', id, dadosParaSalvar);
      
      // Registrar log de auditoria
      await registrarLog('atualizar', 'clientes', id, `Cliente ${dadosParaSalvar.nome} atualizado`);

      return { ...dadosParaSalvar, id };
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  },

  // Excluir cliente
  excluir: async (id) => {
    try {
      // Verificar se cliente tem atendimentos
      const atendimentos = await firebaseService.getAll('atendimentos');
      const temAtendimentos = atendimentos.some(a => a.clienteId === id);
      
      if (temAtendimentos) {
        // Em vez de excluir, apenas desativar
        await clientesService.atualizar(id, { status: 'inativo' });
        
        await registrarLog('desativar', 'clientes', id, 'Cliente desativado (possui histórico)');
        
        return { id, status: 'inativo', message: 'Cliente desativado (possui histórico)' };
      } else {
        // Se não tem atendimentos, pode excluir
        await firebaseService.delete('clientes', id);
        
        await registrarLog('excluir', 'clientes', id, 'Cliente excluído');
        
        return { id, message: 'Cliente excluído com sucesso' };
      }
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      throw error;
    }
  },

  // Buscar histórico do cliente
  buscarHistorico: async (id) => {
    try {
      const [atendimentos, pagamentos, agendamentos] = await Promise.all([
        firebaseService.getAll('atendimentos'),
        firebaseService.getAll('pagamentos'),
        firebaseService.getAll('agendamentos')
      ]);

      const historicoAtendimentos = atendimentos
        .filter(a => a.clienteId === id)
        .sort((a, b) => new Date(b.data) - new Date(a.data));

      const historicoPagamentos = pagamentos
        .filter(p => p.clienteId === id)
        .sort((a, b) => new Date(b.data) - new Date(a.data));

      const historicoAgendamentos = agendamentos
        .filter(a => a.clienteId === id)
        .sort((a, b) => new Date(b.data) - new Date(a.data));

      // Calcular estatísticas
      const totalGasto = historicoPagamentos.reduce((acc, p) => acc + (p.valor || 0), 0);
      const totalAtendimentos = historicoAtendimentos.length;
      const ultimaVisita = historicoAtendimentos[0]?.data || null;
      const frequencia = calcularFrequencia(historicoAtendimentos);

      return {
        atendimentos: historicoAtendimentos,
        pagamentos: historicoPagamentos,
        agendamentos: historicoAgendamentos,
        estatisticas: {
          totalGasto,
          totalAtendimentos,
          ultimaVisita,
          frequencia
        }
      };
    } catch (error) {
      console.error('Erro ao buscar histórico do cliente:', error);
      throw error;
    }
  },

  // Buscar clientes aniversariantes do mês
  buscarAniversariantes: async (mes) => {
    try {
      const clientes = await firebaseService.getAll('clientes');
      const mesBusca = mes || new Date().getMonth() + 1;
      
      return clientes.filter(c => {
        if (!c.dataNascimento) return false;
        const dataNasc = new Date(c.dataNascimento);
        return dataNasc.getMonth() + 1 === mesBusca;
      }).sort((a, b) => {
        const diaA = new Date(a.dataNascimento).getDate();
        const diaB = new Date(b.dataNascimento).getDate();
        return diaA - diaB;
      });
    } catch (error) {
      console.error('Erro ao buscar aniversariantes:', error);
      throw error;
    }
  },

  // Buscar estatísticas gerais
  buscarEstatisticas: async () => {
    try {
      const clientes = await firebaseService.getAll('clientes');
      const atendimentos = await firebaseService.getAll('atendimentos');
      
      const ativos = clientes.filter(c => c.status === 'ativo').length;
      const inativos = clientes.filter(c => c.status === 'inativo').length;
      
      // Clientes que mais frequentam
      const frequenciaClientes = {};
      atendimentos.forEach(a => {
        if (a.clienteId) {
          frequenciaClientes[a.clienteId] = (frequenciaClientes[a.clienteId] || 0) + 1;
        }
      });

      const topClientes = Object.entries(frequenciaClientes)
        .map(([id, total]) => {
          const cliente = clientes.find(c => c.id === id);
          return {
            id,
            nome: cliente?.nome || 'Cliente',
            total
          };
        })
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      return {
        total: clientes.length,
        ativos,
        inativos,
        topClientes,
        taxaFidelidade: clientes.length > 0 ? (ativos / clientes.length * 100).toFixed(1) : 0
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
};

// Função auxiliar para calcular frequência
function calcularFrequencia(atendimentos) {
  if (atendimentos.length < 2) return 'nova';

  const datas = atendimentos.map(a => new Date(a.data)).sort((a, b) => a - b);
  const primeiro = datas[0];
  const ultimo = datas[datas.length - 1];
  const diasEntre = Math.ceil((ultimo - primeiro) / (1000 * 60 * 60 * 24));
  
  if (diasEntre < 30) return 'alta';
  if (diasEntre < 90) return 'media';
  return 'baixa';
}

// Função auxiliar para registrar logs
async function registrarLog(acao, entidade, entidadeId, detalhes) {
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    await firebaseService.add('auditoria', {
      acao,
      entidade,
      entidadeId,
      usuario: usuario.nome || 'Sistema',
      usuarioId: usuario.id || null,
      data: new Date().toISOString(),
      detalhes
    });
  } catch (error) {
    console.warn('Erro ao registrar log:', error);
  }
}
