import { useState, useEffect, useCallback } from 'react';
import { firebaseService } from '../services/firebase';
import { gerarDespesaComissao } from '../services/financeiroIntegration';
import { toast } from 'react-hot-toast';

export const useComissoes = () => {
  const [comissoes, setComissoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPendente: 0,
    totalPago: 0,
    totalGeral: 0,
    quantidadePendente: 0,
    quantidadePaga: 0,
  });

  // Carregar comissões
  const carregarComissoes = useCallback(async (filtros = {}) => {
    try {
      setLoading(true);
      const dados = await firebaseService.getAll('comissoes');
      
      let comissoesFiltradas = dados;
      
      // Aplicar filtros
      if (filtros.profissionalId) {
        comissoesFiltradas = comissoesFiltradas.filter(c => c.profissionalId === filtros.profissionalId);
      }
      if (filtros.status) {
        comissoesFiltradas = comissoesFiltradas.filter(c => c.status === filtros.status);
      }
      if (filtros.dataInicio && filtros.dataFim) {
        comissoesFiltradas = comissoesFiltradas.filter(c => {
          const data = new Date(c.data);
          return data >= new Date(filtros.dataInicio) && data <= new Date(filtros.dataFim);
        });
      }

      setComissoes(comissoesFiltradas);
      calcularStats(comissoesFiltradas);
    } catch (error) {
      console.error('Erro ao carregar comissões:', error);
      toast.error('Erro ao carregar comissões');
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcular estatísticas
  const calcularStats = (dados) => {
    const pendente = dados.filter(c => c.status === 'pendente');
    const pago = dados.filter(c => c.status === 'pago');
    
    setStats({
      totalPendente: pendente.reduce((acc, c) => acc + Number(c.valor), 0),
      totalPago: pago.reduce((acc, c) => acc + Number(c.valor), 0),
      totalGeral: dados.reduce((acc, c) => acc + Number(c.valor), 0),
      quantidadePendente: pendente.length,
      quantidadePaga: pago.length,
    });
  };

  // Criar nova comissão (geralmente chamado quando um atendimento é finalizado)
  const criarComissao = async (dados) => {
    try {
      const comissao = {
        ...dados,
        status: 'pendente',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const id = await firebaseService.add('comissoes', comissao);
      
      // Gerar despesa no financeiro automaticamente
      const resultadoFinanceiro = await gerarDespesaComissao({ ...comissao, id });
      
      if (resultadoFinanceiro.success) {
        toast.success('Comissão registrada e despesa gerada no financeiro!');
      } else {
        toast.success('Comissão registrada (erro ao gerar despesa)');
      }

      await carregarComissoes();
      return { success: true, id };
    } catch (error) {
      console.error('Erro ao criar comissão:', error);
      toast.error('Erro ao registrar comissão');
      return { success: false, error };
    }
  };

  // Pagar comissão (quando o profissional recebe)
  const pagarComissao = async (comissaoId) => {
    try {
      await firebaseService.update('comissoes', comissaoId, {
        status: 'pago',
        dataPagamento: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Atualizar a despesa no financeiro também
      const transacoes = await firebaseService.getAll('transacoes');
      const despesa = transacoes.find(t => t.referenciaId === comissaoId && t.referenciaTipo === 'comissao');
      
      if (despesa) {
        await firebaseService.update('transacoes', despesa.id, {
          status: 'pago',
          dataPagamento: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      toast.success('Comissão marcada como paga!');
      await carregarComissoes();
      return { success: true };
    } catch (error) {
      console.error('Erro ao pagar comissão:', error);
      toast.error('Erro ao processar pagamento');
      return { success: false, error };
    }
  };

  // Calcular comissão baseada no valor do atendimento
  const calcularComissao = (valorAtendimento, percentual) => {
    return (valorAtendimento * percentual) / 100;
  };

  return {
    comissoes,
    loading,
    stats,
    carregarComissoes,
    criarComissao,
    pagarComissao,
    calcularComissao,
  };
};

export default useComissoes;
'''

print("✅ Hook useComissoes.js criado")
print(codigo_hook_comissoes[:500] + "...")
