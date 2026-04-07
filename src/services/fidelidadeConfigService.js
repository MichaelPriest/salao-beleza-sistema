// src/services/fidelidadeConfigService.js
import { firebaseService } from './firebase';
import { Timestamp } from './timestamp';

export const fidelidadeConfigService = {
  // Buscar configurações ativas
  buscarAtivas: async () => {
    try {
      const configuracoes = await firebaseService.getAll('config_fidelidade');
      
      // Se houver múltiplas, pegar a mais recente
      if (configuracoes.length > 0) {
        configuracoes.sort((a, b) => {
          const dataA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dataB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dataB - dataA;
        });
        return configuracoes[0];
      }
      
      // Configuração padrão se não existir
      return {
        ativo: true,
        pontosPorReal: 1,
        pontosAniversario: 50,
        pontosIndicacao: 100,
        multiplicadorBase: 1,
        niveis: {
          bronze: { minimo: 0, multiplicador: 1, cor: '#cd7f32' },
          prata: { minimo: 500, multiplicador: 1.2, cor: '#c0c0c0' },
          ouro: { minimo: 2000, multiplicador: 1.5, cor: '#ffd700' },
          platina: { minimo: 5000, multiplicador: 2, cor: '#e5e4e2' }
        },
        regrasEspeciais: {
          primeiraCompra: true,
          bonusPrimeiroAtendimento: 100,
          aniversario: true
        }
      };
    } catch (error) {
      console.error('Erro ao buscar configurações de fidelidade:', error);
      throw error;
    }
  },

  // Salvar configurações
  salvar: async (config) => {
    try {
      const dadosParaSalvar = {
        ...config,
        ativo: config.ativo !== false,
        pontosPorReal: Number(config.pontosPorReal) || 1,
        pontosAniversario: Number(config.pontosAniversario) || 50,
        pontosIndicacao: Number(config.pontosIndicacao) || 100,
        multiplicadorBase: Number(config.multiplicadorBase) || 1,
        niveis: config.niveis || {
          bronze: { minimo: 0, multiplicador: 1, cor: '#cd7f32' },
          prata: { minimo: 500, multiplicador: 1.2, cor: '#c0c0c0' },
          ouro: { minimo: 2000, multiplicador: 1.5, cor: '#ffd700' },
          platina: { minimo: 5000, multiplicador: 2, cor: '#e5e4e2' }
        },
        regrasEspeciais: config.regrasEspeciais || {
          primeiraCompra: true,
          bonusPrimeiroAtendimento: 100,
          aniversario: true
        },
        updatedAt: Timestamp.now()
      };

      // Se não tiver ID, criar nova configuração
      if (!config.id) {
        dadosParaSalvar.createdAt = Timestamp.now();
        const novoId = await firebaseService.add('config_fidelidade', dadosParaSalvar);
        return { ...dadosParaSalvar, id: novoId };
      } 
      // Se tiver ID, atualizar existente
      else {
        await firebaseService.update('config_fidelidade', config.id, dadosParaSalvar);
        return { ...dadosParaSalvar, id: config.id };
      }
    } catch (error) {
      console.error('Erro ao salvar configurações de fidelidade:', error);
      throw error;
    }
  },

  // Calcular nível baseado em pontos
  calcularNivel: (pontos, config) => {
    try {
      const niveis = config?.niveis || {
        bronze: { minimo: 0 },
        prata: { minimo: 500 },
        ouro: { minimo: 2000 },
        platina: { minimo: 5000 }
      };

      const niveisOrdenados = Object.entries(niveis)
        .map(([nome, dados]) => ({ nome, minimo: dados.minimo }))
        .sort((a, b) => b.minimo - a.minimo);

      for (const nivel of niveisOrdenados) {
        if (pontos >= nivel.minimo) {
          return nivel.nome;
        }
      }

      return 'bronze';
    } catch (error) {
      console.error('Erro ao calcular nível:', error);
      return 'bronze';
    }
  },

  // Calcular multiplicador baseado no nível
  calcularMultiplicador: (nivel, config) => {
    try {
      return config?.niveis?.[nivel]?.multiplicador || 1;
    } catch (error) {
      return 1;
    }
  },

  // Calcular pontos a serem ganhos
  calcularPontos: (valor, nivel, config, regrasEspeciais = {}) => {
    try {
      if (!config?.ativo) return 0;

      let pontos = Math.floor(valor * (config.pontosPorReal || 1));
      
      // Aplicar multiplicador do nível
      const multiplicador = config.niveis?.[nivel]?.multiplicador || 1;
      pontos = Math.floor(pontos * multiplicador);

      // Aplicar bônus especiais
      if (regrasEspeciais.primeiraCompra && config.regrasEspeciais?.primeiraCompra) {
        pontos += config.regrasEspeciais?.bonusPrimeiroAtendimento || 0;
      }

      return pontos;
    } catch (error) {
      console.error('Erro ao calcular pontos:', error);
      return 0;
    }
  }
};
