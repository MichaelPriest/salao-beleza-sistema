// src/services/cupomService.js
import { firebaseService } from './firebase';
import { Timestamp } from 'firebase/firestore';

class CupomService {
  
  // ============================================
  // GERENCIAMENTO DE CUPONS
  // ============================================

  // Criar um novo cupom
  async criarCupom(dados) {
    try {
      const cupomData = {
        codigo: dados.codigo.toUpperCase(),
        descricao: dados.descricao || '',
        tipo: dados.tipo, // 'percentual', 'fixo', 'frete', 'produto'
        valor: Number(dados.valor) || 0,
        valorMinimo: Number(dados.valorMinimo) || 0,
        valorMaximoDesconto: Number(dados.valorMaximoDesconto) || null,
        
        // Validade
        dataInicio: dados.dataInicio || new Date().toISOString().split('T')[0],
        dataFim: dados.dataFim || null,
        diasSemana: dados.diasSemana || [], // ['segunda', 'terca', ...]
        horarioInicio: dados.horarioInicio || null,
        horarioFim: dados.horarioFim || null,
        
        // Limitações
        usoMaximo: Number(dados.usoMaximo) || null, // null = ilimitado
        usoMaximoPorCliente: Number(dados.usoMaximoPorCliente) || 1,
        usosAtuais: 0,
        
        // Restrições
        clientesElegiveis: dados.clientesElegiveis || 'todos', // 'todos', 'novos', 'vip', 'lista'
        listaClientesIds: dados.listaClientesIds || [],
        niveisPermitidos: dados.niveisPermitidos || ['bronze', 'prata', 'ouro', 'platina'],
        
        // Serviços/produtos elegíveis
        servicosElegiveis: dados.servicosElegiveis || 'todos', // 'todos', 'lista'
        listaServicosIds: dados.listaServicosIds || [],
        produtosElegiveis: dados.produtosElegiveis || 'todos',
        listaProdutosIds: dados.listaProdutosIds || [],
        
        // Status
        ativo: dados.ativo !== false,
        primeiroAcesso: dados.primeiroAcesso || false,
        
        // Metadados
        criadoPor: dados.criadoPor,
        criadoPorNome: dados.criadoPorNome,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Verificar se código já existe
      const existente = await this.buscarCupomPorCodigo(dados.codigo);
      if (existente) {
        throw new Error('Código de cupom já existe');
      }

      const id = await firebaseService.add('cupons', cupomData);
      return { id, ...cupomData };
    } catch (error) {
      console.error('Erro ao criar cupom:', error);
      throw error;
    }
  }

  // Atualizar cupom
  async atualizarCupom(id, dados) {
    try {
      const cupomData = {
        ...dados,
        updatedAt: Timestamp.now()
      };

      await firebaseService.update('cupons', id, cupomData);
      return { id, ...cupomData };
    } catch (error) {
      console.error('Erro ao atualizar cupom:', error);
      throw error;
    }
  }

  // Buscar cupom por código
  async buscarCupomPorCodigo(codigo) {
    try {
      const resultados = await firebaseService.query('cupons', [
        { field: 'codigo', operator: '==', value: codigo.toUpperCase() }
      ]);
      return resultados[0] || null;
    } catch (error) {
      console.error('Erro ao buscar cupom:', error);
      return null;
    }
  }

  // Listar todos os cupons
  async listarCupons(filtros = {}) {
    try {
      let conditions = [];
      
      if (filtros.ativo !== undefined) {
        conditions.push({ field: 'ativo', operator: '==', value: filtros.ativo });
      }
      
      if (filtros.tipo) {
        conditions.push({ field: 'tipo', operator: '==', value: filtros.tipo });
      }

      const cupons = await firebaseService.query('cupons', conditions);
      
      // Ordenar por data de criação (mais recentes primeiro)
      return cupons.sort((a, b) => {
        const dataA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dataB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dataB - dataA;
      });
    } catch (error) {
      console.error('Erro ao listar cupons:', error);
      return [];
    }
  }

  // ============================================
  // VALIDAÇÃO E APLICAÇÃO DE CUPONS
  // ============================================

  // Validar cupom para um cliente
  async validarCupom(codigo, clienteId, valorCompra = 0, itens = []) {
    try {
      const cupom = await this.buscarCupomPorCodigo(codigo);
      
      if (!cupom) {
        return { valido: false, motivo: 'Cupom não encontrado' };
      }

      // Verificar se está ativo
      if (!cupom.ativo) {
        return { valido: false, motivo: 'Cupom inativo' };
      }

      // Verificar data de validade
      const hoje = new Date();
      const dataInicio = new Date(cupom.dataInicio + 'T00:00:00');
      
      if (cupom.dataFim) {
        const dataFim = new Date(cupom.dataFim + 'T23:59:59');
        if (hoje < dataInicio) {
          return { valido: false, motivo: 'Cupom ainda não está ativo' };
        }
        if (hoje > dataFim) {
          return { valido: false, motivo: 'Cupom expirado' };
        }
      }

      // Verificar dia da semana
      if (cupom.diasSemana && cupom.diasSemana.length > 0) {
        const diasMap = {
          0: 'domingo', 1: 'segunda', 2: 'terca', 3: 'quarta',
          4: 'quinta', 5: 'sexta', 6: 'sabado'
        };
        const diaSemana = diasMap[hoje.getDay()];
        if (!cupom.diasSemana.includes(diaSemana)) {
          return { valido: false, motivo: 'Cupom não é válido para hoje' };
        }
      }

      // Verificar horário
      if (cupom.horarioInicio && cupom.horarioFim) {
        const horaAtual = hoje.getHours() * 60 + hoje.getMinutes();
        const [horaInicio, minInicio] = cupom.horarioInicio.split(':').map(Number);
        const [horaFim, minFim] = cupom.horarioFim.split(':').map(Number);
        const inicioMin = horaInicio * 60 + minInicio;
        const fimMin = horaFim * 60 + minFim;
        
        if (horaAtual < inicioMin || horaAtual > fimMin) {
          return { valido: false, motivo: 'Cupom não é válido neste horário' };
        }
      }

      // Verificar limite de uso geral
      if (cupom.usoMaximo && cupom.usosAtuais >= cupom.usoMaximo) {
        return { valido: false, motivo: 'Cupom atingiu o limite de usos' };
      }

      // Verificar limite por cliente
      if (clienteId) {
        const usosCliente = await this.contarUsosCliente(cupom.id, clienteId);
        if (usosCliente >= (cupom.usoMaximoPorCliente || 1)) {
          return { valido: false, motivo: 'Você já utilizou este cupom' };
        }
      }

      // Verificar valor mínimo
      if (cupom.valorMinimo > 0 && valorCompra < cupom.valorMinimo) {
        return { 
          valido: false, 
          motivo: `Valor mínimo de R$ ${cupom.valorMinimo.toFixed(2)}` 
        };
      }

      // Verificar serviços elegíveis
      if (cupom.servicosElegiveis === 'lista' && cupom.listaServicosIds.length > 0) {
        const servicosCompativeis = itens.some(item => 
          cupom.listaServicosIds.includes(item.id)
        );
        if (!servicosCompativeis) {
          return { valido: false, motivo: 'Cupom não é válido para estes serviços' };
        }
      }

      return { 
        valido: true, 
        cupom,
        desconto: this.calcularDesconto(cupom, valorCompra, itens)
      };
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      return { valido: false, motivo: 'Erro ao validar cupom' };
    }
  }

  // Calcular desconto
  calcularDesconto(cupom, valorCompra, itens = []) {
    let desconto = 0;
    let detalhes = [];

    switch (cupom.tipo) {
      case 'percentual':
        desconto = valorCompra * (cupom.valor / 100);
        if (cupom.valorMaximoDesconto) {
          desconto = Math.min(desconto, cupom.valorMaximoDesconto);
        }
        detalhes.push(`${cupom.valor}% de desconto`);
        break;

      case 'fixo':
        desconto = Math.min(cupom.valor, valorCompra);
        detalhes.push(`R$ ${cupom.valor.toFixed(2)} de desconto`);
        break;

      case 'frete':
        // Implementar lógica de frete
        detalhes.push('Frete grátis');
        break;

      case 'produto':
        // Calcular desconto em produtos específicos
        if (cupom.listaProdutosIds.length > 0) {
          itens.forEach(item => {
            if (cupom.listaProdutosIds.includes(item.id)) {
              const itemDesconto = (item.preco || 0) * (cupom.valor / 100);
              desconto += itemDesconto;
              detalhes.push(`${cupom.valor}% em ${item.nome}`);
            }
          });
        }
        break;
    }

    return {
      valor: desconto,
      tipo: cupom.tipo,
      detalhes,
      valorFinal: valorCompra - desconto
    };
  }

  // ============================================
  // REGISTRO DE USO
  // ============================================

  // Registrar uso do cupom
  async registrarUso(cupomId, clienteId, atendimentoId, valorOriginal, valorFinal) {
    try {
      const usoData = {
        cupomId,
        clienteId,
        atendimentoId,
        valorOriginal,
        valorFinal,
        descontoAplicado: valorOriginal - valorFinal,
        data: new Date().toISOString(),
        createdAt: Timestamp.now()
      };

      await firebaseService.add('usos_cupons', usoData);

      // Incrementar contador de usos do cupom
      const cupom = await firebaseService.getById('cupons', cupomId);
      if (cupom) {
        await firebaseService.update('cupons', cupomId, {
          usosAtuais: (cupom.usosAtuais || 0) + 1,
          updatedAt: Timestamp.now()
        });
      }

      return usoData;
    } catch (error) {
      console.error('Erro ao registrar uso do cupom:', error);
      throw error;
    }
  }

  // Contar usos de um cliente
  async contarUsosCliente(cupomId, clienteId) {
    try {
      const usos = await firebaseService.query('usos_cupons', [
        { field: 'cupomId', operator: '==', value: cupomId },
        { field: 'clienteId', operator: '==', value: clienteId }
      ]);
      return usos.length;
    } catch (error) {
      console.error('Erro ao contar usos:', error);
      return 0;
    }
  }

  // Histórico de usos de um cupom
  async historicoUso(cupomId) {
    try {
      const usos = await firebaseService.query('usos_cupons', [
        { field: 'cupomId', operator: '==', value: cupomId }
      ]);
      
      return usos.sort((a, b) => {
        const dataA = new Date(a.data);
        const dataB = new Date(b.data);
        return dataB - dataA;
      });
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  }

  // Histórico de usos de um cliente
  async historicoCliente(clienteId) {
    try {
      const usos = await firebaseService.query('usos_cupons', [
        { field: 'clienteId', operator: '==', value: clienteId }
      ]);
      
      return usos.sort((a, b) => {
        const dataA = new Date(a.data);
        const dataB = new Date(b.data);
        return dataB - dataA;
      });
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  }

  // ============================================
  // ESTATÍSTICAS
  // ============================================

  async obterEstatisticas() {
    try {
      const cupons = await this.listarCupons();
      const usos = await firebaseService.getAll('usos_cupons').catch(() => []);

      const ativos = cupons.filter(c => c.ativo).length;
      const inativos = cupons.length - ativos;
      const totalUsos = usos.length;
      const valorTotalDescontos = usos.reduce((acc, u) => acc + (u.descontoAplicado || 0), 0);

      // Usos por período (últimos 30 dias)
      const hoje = new Date();
      const trintaDiasAtras = new Date(hoje.setDate(hoje.getDate() - 30));
      const usosRecentes = usos.filter(u => new Date(u.data) >= trintaDiasAtras);

      // Top cupons mais usados
      const usosPorCupom = {};
      usos.forEach(u => {
        usosPorCupom[u.cupomId] = (usosPorCupom[u.cupomId] || 0) + 1;
      });

      const topCupons = Object.entries(usosPorCupom)
        .map(([cupomId, quantidade]) => {
          const cupom = cupons.find(c => c.id === cupomId);
          return {
            cupomId,
            codigo: cupom?.codigo || 'Desconhecido',
            quantidade,
            valorTotal: usos
              .filter(u => u.cupomId === cupomId)
              .reduce((acc, u) => acc + (u.descontoAplicado || 0), 0)
          };
        })
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5);

      return {
        totalCupons: cupons.length,
        ativos,
        inativos,
        totalUsos,
        valorTotalDescontos,
        mediaDesconto: usos.length > 0 ? valorTotalDescontos / usos.length : 0,
        usosRecentes: usosRecentes.length,
        topCupons
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        totalCupons: 0,
        ativos: 0,
        inativos: 0,
        totalUsos: 0,
        valorTotalDescontos: 0,
        mediaDesconto: 0,
        usosRecentes: 0,
        topCupons: []
      };
    }
  }
}

export const cupomService = new CupomService();
