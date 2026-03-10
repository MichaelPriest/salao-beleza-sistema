// src/services/comissoesService.js
import { firebaseService } from './firebase';

export const comissoesService = {
  // Buscar comissões do profissional
  buscarMinhasComissoes: async (profissionalId, filtros = {}) => {
    try {
      const [comissoes, atendimentos, servicos] = await Promise.all([
        firebaseService.getAll('comissoes'),
        firebaseService.getAll('atendimentos'),
        firebaseService.getAll('servicos')
      ]);

      let minhasComissoes = comissoes.filter(c => c.profissionalId === profissionalId);

      // Aplicar filtros
      if (filtros.mes && filtros.ano) {
        minhasComissoes = minhasComissoes.filter(c => {
          const data = new Date(c.data);
          return data.getMonth() + 1 === filtros.mes && 
                 data.getFullYear() === filtros.ano;
        });
      }

      if (filtros.status) {
        minhasComissoes = minhasComissoes.filter(c => c.status === filtros.status);
      }

      // Enriquecer com dados dos atendimentos
      const comissoesEnriquecidas = await Promise.all(
        minhasComissoes.map(async (comissao) => {
          const atendimento = atendimentos.find(a => a.id === comissao.atendimentoId);
          const servico = servicos.find(s => s.id === atendimento?.servicoId);
          
          return {
            ...comissao,
            atendimento: atendimento || null,
            servico: servico || null,
            dataFormatada: new Date(comissao.data).toLocaleDateString('pt-BR')
          };
        })
      );

      return comissoesEnriquecidas.sort((a, b) => new Date(b.data) - new Date(a.data));
    } catch (error) {
      console.error('Erro ao buscar comissões:', error);
      throw error;
    }
  },

  // Buscar resumo de comissões
  buscarResumo: async (profissionalId) => {
    try {
      const comissoes = await firebaseService.getAll('comissoes');
      const minhasComissoes = comissoes.filter(c => c.profissionalId === profissionalId);

      const hoje = new Date();
      const mesAtual = hoje.getMonth() + 1;
      const anoAtual = hoje.getFullYear();

      // Comissões do mês atual
      const comissoesMes = minhasComissoes.filter(c => {
        const data = new Date(c.data);
        return data.getMonth() + 1 === mesAtual && 
               data.getFullYear() === anoAtual;
      });

      // Comissões pendentes
      const pendentes = minhasComissoes.filter(c => c.status === 'pendente');
      
      // Comissões pagas
      const pagas = minhasComissoes.filter(c => c.status === 'pago');

      // Totais
      const totalMes = comissoesMes.reduce((acc, c) => acc + (c.valor || 0), 0);
      const totalPendente = pendentes.reduce((acc, c) => acc + (c.valor || 0), 0);
      const totalPago = pagas.reduce((acc, c) => acc + (c.valor || 0), 0);
      const totalGeral = minhasComissoes.reduce((acc, c) => acc + (c.valor || 0), 0);

      // Comissões por serviço
      const servicos = {};
      minhasComissoes.forEach(c => {
        if (c.servicoNome) {
          servicos[c.servicoNome] = (servicos[c.servicoNome] || 0) + c.valor;
        }
      });

      return {
        resumo: {
          totalMes,
          totalPendente,
          totalPago,
          totalGeral,
          quantidadeMes: comissoesMes.length,
          quantidadePendente: pendentes.length,
          quantidadePaga: pagas.length,
          quantidadeTotal: minhasComissoes.length
        },
        porServico: Object.entries(servicos).map(([nome, valor]) => ({
          nome,
          valor,
          percentual: totalGeral > 0 ? (valor / totalGeral * 100).toFixed(1) : 0
        })),
        mesAtual: {
          mes: mesAtual,
          ano: anoAtual,
          valor: totalMes
        }
      };
    } catch (error) {
      console.error('Erro ao buscar resumo:', error);
      throw error;
    }
  },

  // Calcular comissão de um atendimento
  calcularComissao: async (atendimentoId) => {
    try {
      const atendimento = await firebaseService.getById('atendimentos', atendimentoId);
      const profissional = await firebaseService.getById('profissionais', atendimento.profissionalId);
      const servico = await firebaseService.getById('servicos', atendimento.servicoId);

      if (!atendimento || !profissional || !servico) {
        throw new Error('Dados incompletos para calcular comissão');
      }

      // Percentual de comissão (pode vir do profissional ou do serviço)
      const percentual = profissional.comissao || servico.comissaoProfissional || 40;
      
      const valorAtendimento = atendimento.valorTotal || servico.preco || 0;
      const valorComissao = (valorAtendimento * percentual) / 100;

      return {
        atendimentoId,
        profissionalId: atendimento.profissionalId,
        profissionalNome: profissional.nome,
        servicoId: atendimento.servicoId,
        servicoNome: servico.nome,
        valorAtendimento,
        percentual,
        valor: valorComissao,
        data: atendimento.data,
        status: 'pendente'
      };
    } catch (error) {
      console.error('Erro ao calcular comissão:', error);
      throw error;
    }
  },

  // Registrar comissão
  registrar: async (atendimentoId) => {
    try {
      // Verificar se já existe comissão para este atendimento
      const comissoes = await firebaseService.getAll('comissoes');
      const existe = comissoes.find(c => c.atendimentoId === atendimentoId);

      if (existe) {
        return existe; // Já registrada
      }

      // Calcular comissão
      const dadosComissao = await comissoesService.calcularComissao(atendimentoId);

      const dadosParaSalvar = {
        ...dadosComissao,
        dataRegistro: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const novaComissaoId = await firebaseService.add('comissoes', dadosParaSalvar);

      // Registrar log
      await registrarLog('criar', 'comissoes', novaComissaoId, 
        `Comissão de R$ ${dadosComissao.valor.toFixed(2)} registrada`);

      return { ...dadosParaSalvar, id: novaComissaoId };
    } catch (error) {
      console.error('Erro ao registrar comissão:', error);
      throw error;
    }
  },

  // Marcar comissão como paga (admin)
  marcarComoPaga: async (comissaoId) => {
    try {
      await firebaseService.update('comissoes', comissaoId, {
        status: 'pago',
        dataPagamento: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      await registrarLog('pagar', 'comissoes', comissaoId, 'Comissão paga');

      return { id: comissaoId, status: 'pago' };
    } catch (error) {
      console.error('Erro ao marcar comissão como paga:', error);
      throw error;
    }
  },

  // Cancelar comissão (admin)
  cancelar: async (comissaoId, motivo) => {
    try {
      await firebaseService.update('comissoes', comissaoId, {
        status: 'cancelado',
        motivoCancelamento: motivo,
        updatedAt: new Date().toISOString()
      });

      await registrarLog('cancelar', 'comissoes', comissaoId, `Comissão cancelada: ${motivo}`);

      return { id: comissaoId, status: 'cancelado' };
    } catch (error) {
      console.error('Erro ao cancelar comissão:', error);
      throw error;
    }
  },

  // Buscar estatísticas para o profissional
  buscarEstatisticas: async (profissionalId) => {
    try {
      const comissoes = await firebaseService.getAll('comissoes');
      const minhasComissoes = comissoes.filter(c => c.profissionalId === profissionalId);

      // Agrupar por mês
      const porMes = {};
      minhasComissoes.forEach(c => {
        const data = new Date(c.data);
        const chave = `${data.getMonth() + 1}/${data.getFullYear()}`;
        
        if (!porMes[chave]) {
          porMes[chave] = {
            mes: data.getMonth() + 1,
            ano: data.getFullYear(),
            total: 0,
            quantidade: 0,
            pagas: 0,
            pendentes: 0
          };
        }
        
        porMes[chave].total += c.valor || 0;
        porMes[chave].quantidade++;
        
        if (c.status === 'pago') {
          porMes[chave].pagas += c.valor;
        } else if (c.status === 'pendente') {
          porMes[chave].pendentes += c.valor;
        }
      });

      // Calcular médias
      const totalGeral = minhasComissoes.reduce((acc, c) => acc + (c.valor || 0), 0);
      const mediaPorAtendimento = minhasComissoes.length > 0 
        ? totalGeral / minhasComissoes.length 
        : 0;

      return {
        porMes: Object.values(porMes).sort((a, b) => 
          b.ano - a.ano || b.mes - a.mes
        ),
        mediaPorAtendimento,
        totalComissoes: minhasComissoes.length,
        melhorMes: Object.values(porMes).sort((a, b) => b.total - a.total)[0] || null
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
};

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
