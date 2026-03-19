// src/services/respostasAnamneseService.js
import { firebaseService } from './firebase';

export const respostasAnamneseService = {
  // Buscar respostas por ID
  buscarPorId: async (id) => {
    try {
      return await firebaseService.getById('respostas_anamnese', id);
    } catch (error) {
      console.error('Erro ao buscar resposta:', error);
      throw error;
    }
  },

  // Buscar respostas por agendamento
  buscarPorAgendamento: async (agendamentoId) => {
    try {
      const respostas = await firebaseService.query('respostas_anamnese', [
        { field: 'agendamentoId', operator: '==', value: agendamentoId }
      ]);
      return respostas[0] || null;
    } catch (error) {
      console.error('Erro ao buscar respostas por agendamento:', error);
      return null;
    }
  },

  // Buscar respostas por cliente
  buscarPorCliente: async (clienteId) => {
    try {
      const respostas = await firebaseService.query('respostas_anamnese', [
        { field: 'clienteId', operator: '==', value: clienteId }
      ]);
      return respostas.sort((a, b) => new Date(b.respondidoEm) - new Date(a.respondidoEm));
    } catch (error) {
      console.error('Erro ao buscar respostas do cliente:', error);
      return [];
    }
  },

  // Buscar respostas pendentes (para um profissional)
  buscarPendentes: async (profissionalId = null) => {
    try {
      let conditions = [
        { field: 'status', operator: '==', value: 'pendente' }
      ];
      
      if (profissionalId) {
        conditions.push({ field: 'profissionalId', operator: '==', value: profissionalId });
      }
      
      const respostas = await firebaseService.query('respostas_anamnese', conditions);
      return respostas.sort((a, b) => new Date(a.dataAgendamento) - new Date(b.dataAgendamento));
    } catch (error) {
      console.error('Erro ao buscar respostas pendentes:', error);
      return [];
    }
  },

  // Salvar respostas (criar ou atualizar)
  salvar: async (dados) => {
    try {
      // Validações
      if (!dados.formularioId) throw new Error('formularioId é obrigatório');
      if (!dados.agendamentoId) throw new Error('agendamentoId é obrigatório');
      if (!dados.clienteId) throw new Error('clienteId é obrigatório');
      if (!dados.respostas || !Array.isArray(dados.respostas)) {
        throw new Error('respostas deve ser um array');
      }

      // Verificar se já existe resposta para este agendamento
      const existente = await respostasAnamneseService.buscarPorAgendamento(dados.agendamentoId);
      
      const respostaData = {
        formularioId: dados.formularioId,
        formularioTitulo: dados.formularioTitulo || 'Formulário',
        agendamentoId: dados.agendamentoId,
        atendimentoId: dados.atendimentoId || null,
        clienteId: dados.clienteId,
        clienteNome: dados.clienteNome || 'Cliente',
        profissionalId: dados.profissionalId || null,
        profissionalNome: dados.profissionalNome || null,
        servicoId: dados.servicoId || null,
        servicoNome: dados.servicoNome || null,
        dataAgendamento: dados.dataAgendamento || new Date().toISOString().split('T')[0],
        horaAgendamento: dados.horaAgendamento || '',
        respostas: dados.respostas,
        observacoesProfissional: dados.observacoesProfissional || '',
        respondidoEm: new Date().toISOString(),
        respondidoPor: dados.respondidoPor || 'cliente', // 'cliente' ou 'profissional'
        respondidoPorId: dados.respondidoPorId || dados.clienteId,
        respondidoPorNome: dados.respondidoPorNome || dados.clienteNome,
        status: 'respondido',
        ip: dados.ip || null,
        userAgent: dados.userAgent || navigator?.userAgent || null
      };

      let resultado;
      
      if (existente) {
        // Atualizar existente
        resultado = await firebaseService.update('respostas_anamnese', existente.id, {
          ...respostaData,
          updatedAt: new Date().toISOString(),
          versao: (existente.versao || 1) + 1
        });
        console.log('✅ Respostas atualizadas com sucesso!');
      } else {
        // Criar novo
        resultado = await firebaseService.add('respostas_anamnese', {
          ...respostaData,
          versao: 1,
          createdAt: new Date().toISOString()
        });
        console.log('✅ Respostas salvas com sucesso!');
      }

      // Registrar log
      await firebaseService.add('logs_anamnese', {
        acao: existente ? 'atualizar' : 'criar',
        respostaId: resultado.id,
        agendamentoId: dados.agendamentoId,
        clienteId: dados.clienteId,
        usuarioId: dados.respondidoPorId,
        usuarioNome: dados.respondidoPorNome,
        timestamp: new Date().toISOString()
      }).catch(err => console.warn('Erro ao registrar log:', err));

      return resultado;
    } catch (error) {
      console.error('Erro ao salvar respostas:', error);
      throw error;
    }
  },

  // Marcar como visualizado pelo profissional
  marcarComoVisualizado: async (id, profissionalId, profissionalNome) => {
    try {
      const resultado = await firebaseService.update('respostas_anamnese', id, {
        status: 'visualizado',
        visualizadoEm: new Date().toISOString(),
        visualizadoPor: profissionalId,
        visualizadoPorNome: profissionalNome
      });
      console.log('✅ Respostas marcadas como visualizadas');
      return resultado;
    } catch (error) {
      console.error('Erro ao marcar como visualizado:', error);
      throw error;
    }
  },

  // Adicionar observações do profissional
  adicionarObservacoes: async (id, observacoes, profissionalId, profissionalNome) => {
    try {
      const resposta = await respostasAnamneseService.buscarPorId(id);
      
      const resultado = await firebaseService.update('respostas_anamnese', id, {
        observacoesProfissional: observacoes,
        observacoesAtualizadasEm: new Date().toISOString(),
        observacoesAtualizadasPor: profissionalId,
        observacoesAtualizadasPorNome: profissionalNome
      });
      
      console.log('✅ Observações adicionadas');
      return resultado;
    } catch (error) {
      console.error('Erro ao adicionar observações:', error);
      throw error;
    }
  },

  // Buscar estatísticas de respostas
  buscarEstatisticas: async (clienteId = null, profissionalId = null) => {
    try {
      let respostas = [];
      
      if (clienteId) {
        respostas = await respostasAnamneseService.buscarPorCliente(clienteId);
      } else if (profissionalId) {
        const conditions = [
          { field: 'profissionalId', operator: '==', value: profissionalId }
        ];
        respostas = await firebaseService.query('respostas_anamnese', conditions);
      } else {
        respostas = await firebaseService.getAll('respostas_anamnese');
      }

      const estatisticas = {
        total: respostas.length,
        respondidos: respostas.filter(r => r.status === 'respondido').length,
        visualizados: respostas.filter(r => r.status === 'visualizado').length,
        pendentes: respostas.filter(r => r.status === 'pendente').length,
        porFormulario: {},
        ultimasRespostas: respostas.slice(0, 5).map(r => ({
          id: r.id,
          clienteNome: r.clienteNome,
          data: r.respondidoEm,
          formulario: r.formularioTitulo
        }))
      };

      // Agrupar por formulário
      respostas.forEach(r => {
        if (!estatisticas.porFormulario[r.formularioTitulo]) {
          estatisticas.porFormulario[r.formularioTitulo] = 0;
        }
        estatisticas.porFormulario[r.formularioTitulo]++;
      });

      return estatisticas;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        total: 0,
        respondidos: 0,
        visualizados: 0,
        pendentes: 0,
        porFormulario: {},
        ultimasRespostas: []
      };
    }
  },

  // Exportar respostas para CSV/PDF
  exportar: async (clienteId = null) => {
    try {
      let respostas = [];
      
      if (clienteId) {
        respostas = await respostasAnamneseService.buscarPorCliente(clienteId);
      } else {
        respostas = await firebaseService.getAll('respostas_anamnese');
      }

      // Formatar para exportação
      const dadosExport = respostas.map(r => ({
        'Cliente': r.clienteNome,
        'Formulário': r.formularioTitulo,
        'Data': new Date(r.respondidoEm).toLocaleDateString('pt-BR'),
        'Status': r.status,
        'Profissional': r.profissionalNome || '-',
        'Observações': r.observacoesProfissional || '-'
      }));

      return dadosExport;
    } catch (error) {
      console.error('Erro ao exportar respostas:', error);
      throw error;
    }
  }
};
