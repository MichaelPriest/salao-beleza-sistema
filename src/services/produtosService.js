// src/services/produtosService.js
import { firebaseService } from './firebase';

export const produtosService = {
  // Listar todos os produtos
  listar: async () => {
    try {
      const produtos = await firebaseService.getAll('produtos');
      
      // Ordenar por nome
      produtos.sort((a, b) => a.nome?.localeCompare(b.nome));
      
      return produtos;
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      throw error;
    }
  },

  // Buscar produto por ID
  buscarPorId: async (id) => {
    try {
      const produto = await firebaseService.getById('produtos', id);
      return produto;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  },

  // Buscar produto por código/nome
  buscarPorCodigo: async (codigo) => {
    try {
      const produtos = await firebaseService.getAll('produtos');
      return produtos.find(p => 
        p.codigo?.toLowerCase() === codigo.toLowerCase() ||
        p.nome?.toLowerCase().includes(codigo.toLowerCase())
      );
    } catch (error) {
      console.error('Erro ao buscar produto por código:', error);
      throw error;
    }
  },

  // Buscar produtos por categoria
  buscarPorCategoria: async (categoria) => {
    try {
      const produtos = await firebaseService.getAll('produtos');
      return produtos
        .filter(p => p.categoria === categoria)
        .sort((a, b) => a.nome?.localeCompare(b.nome));
    } catch (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      throw error;
    }
  },

  // Criar novo produto
  criar: async (produto) => {
    try {
      // Validar dados obrigatórios
      if (!produto.nome) {
        throw new Error('Nome do produto é obrigatório');
      }

      if (!produto.precoVenda || produto.precoVenda <= 0) {
        throw new Error('Preço de venda deve ser maior que zero');
      }

      const dadosParaSalvar = {
        nome: String(produto.nome).trim(),
        codigo: produto.codigo ? String(produto.codigo).trim() : null,
        descricao: produto.descricao ? String(produto.descricao).trim() : null,
        categoria: produto.categoria ? String(produto.categoria) : null,
        unidade: produto.unidade || 'un',
        precoCusto: Number(produto.precoCusto) || 0,
        precoVenda: Number(produto.precoVenda) || 0,
        quantidadeEstoque: Number(produto.quantidadeEstoque) || 0,
        estoqueMinimo: Number(produto.estoqueMinimo) || 5,
        localizacao: produto.localizacao ? String(produto.localizacao) : null,
        fornecedorId: produto.fornecedorId ? String(produto.fornecedorId) : null,
        fornecedorNome: produto.fornecedorNome || null,
        observacoes: produto.observacoes ? String(produto.observacoes).trim() : null,
        status: produto.status || 'ativo',
        dataCadastro: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Calcular margem de lucro
      if (dadosParaSalvar.precoCusto > 0 && dadosParaSalvar.precoVenda > 0) {
        dadosParaSalvar.margemLucro = ((dadosParaSalvar.precoVenda - dadosParaSalvar.precoCusto) / dadosParaSalvar.precoCusto) * 100;
      }

      const novoId = await firebaseService.add('produtos', dadosParaSalvar);
      
      // Registrar log de auditoria
      await registrarLog('criar', 'produtos', novoId, `Produto ${dadosParaSalvar.nome} criado`);

      return { ...dadosParaSalvar, id: novoId };
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  },

  // Atualizar produto
  atualizar: async (id, produto) => {
    try {
      // Validar dados obrigatórios
      if (!produto.nome) {
        throw new Error('Nome do produto é obrigatório');
      }

      const dadosParaSalvar = {
        nome: String(produto.nome).trim(),
        codigo: produto.codigo ? String(produto.codigo).trim() : undefined,
        descricao: produto.descricao ? String(produto.descricao).trim() : undefined,
        categoria: produto.categoria ? String(produto.categoria) : undefined,
        unidade: produto.unidade || 'un',
        precoCusto: produto.precoCusto !== undefined ? Number(produto.precoCusto) : undefined,
        precoVenda: produto.precoVenda !== undefined ? Number(produto.precoVenda) : undefined,
        quantidadeEstoque: produto.quantidadeEstoque !== undefined ? Number(produto.quantidadeEstoque) : undefined,
        estoqueMinimo: produto.estoqueMinimo !== undefined ? Number(produto.estoqueMinimo) : undefined,
        localizacao: produto.localizacao ? String(produto.localizacao) : undefined,
        fornecedorId: produto.fornecedorId ? String(produto.fornecedorId) : undefined,
        fornecedorNome: produto.fornecedorNome || undefined,
        observacoes: produto.observacoes ? String(produto.observacoes).trim() : undefined,
        status: produto.status || 'ativo',
        updatedAt: new Date().toISOString()
      };

      // Recalcular margem de lucro se preços foram alterados
      if (dadosParaSalvar.precoCusto !== undefined && dadosParaSalvar.precoVenda !== undefined) {
        if (dadosParaSalvar.precoCusto > 0 && dadosParaSalvar.precoVenda > 0) {
          dadosParaSalvar.margemLucro = ((dadosParaSalvar.precoVenda - dadosParaSalvar.precoCusto) / dadosParaSalvar.precoCusto) * 100;
        }
      }

      await firebaseService.update('produtos', id, dadosParaSalvar);
      
      // Registrar log de auditoria
      await registrarLog('atualizar', 'produtos', id, `Produto ${dadosParaSalvar.nome} atualizado`);

      return { ...dadosParaSalvar, id };
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  },

  // Excluir produto
  excluir: async (id) => {
    try {
      // Verificar se produto tem movimentações
      const [entradas, vendas] = await Promise.all([
        firebaseService.getAll('entradas'),
        firebaseService.getAll('itens_venda') // Assumindo que existe uma coleção de itens vendidos
      ]);

      const temMovimentacoes = 
        entradas.some(e => e.produtoId === id) ||
        (vendas && vendas.some(v => v.produtoId === id));

      if (temMovimentacoes) {
        // Se tem movimentações, apenas desativar
        await produtosService.atualizar(id, { status: 'inativo' });
        
        await registrarLog('desativar', 'produtos', id, 'Produto desativado (possui movimentações)');
        
        return { id, status: 'inativo', message: 'Produto desativado (possui histórico)' };
      } else {
        // Se não tem movimentações, pode excluir
        await firebaseService.delete('produtos', id);
        
        await registrarLog('excluir', 'produtos', id, 'Produto excluído');
        
        return { id, message: 'Produto excluído com sucesso' };
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      throw error;
    }
  },

  // Atualizar estoque
  atualizarEstoque: async (id, quantidade, tipo = 'adicionar') => {
    try {
      const produto = await firebaseService.getById('produtos', id);
      
      if (!produto) {
        throw new Error('Produto não encontrado');
      }

      let novaQuantidade;
      if (tipo === 'adicionar') {
        novaQuantidade = (produto.quantidadeEstoque || 0) + quantidade;
      } else if (tipo === 'remover') {
        novaQuantidade = (produto.quantidadeEstoque || 0) - quantidade;
        if (novaQuantidade < 0) {
          throw new Error('Estoque insuficiente');
        }
      } else {
        novaQuantidade = quantidade; // Definir valor absoluto
      }

      const dadosAtualizados = {
        quantidadeEstoque: novaQuantidade,
        updatedAt: new Date().toISOString()
      };

      await firebaseService.update('produtos', id, dadosAtualizados);

      // Registrar movimentação
      await registrarMovimentacao(id, tipo, quantidade, novaQuantidade, produto.nome);

      // Registrar log
      await registrarLog('atualizar_estoque', 'produtos', id, 
        `Estoque ${tipo === 'adicionar' ? 'adicionado' : 'removido'}: ${quantidade} unidades`);

      return { ...produto, ...dadosAtualizados, id };
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      throw error;
    }
  },

  // Buscar produtos com estoque baixo
  buscarEstoqueBaixo: async (limite = 10) => {
    try {
      const produtos = await firebaseService.getAll('produtos');
      
      return produtos
        .filter(p => {
          const estoque = p.quantidadeEstoque || 0;
          const minimo = p.estoqueMinimo || limite;
          return estoque <= minimo && p.status === 'ativo';
        })
        .sort((a, b) => {
          const percentualA = (a.quantidadeEstoque / a.estoqueMinimo) * 100;
          const percentualB = (b.quantidadeEstoque / b.estoqueMinimo) * 100;
          return percentualA - percentualB;
        });
    } catch (error) {
      console.error('Erro ao buscar produtos com estoque baixo:', error);
      throw error;
    }
  },

  // Buscar produtos sem estoque
  buscarSemEstoque: async () => {
    try {
      const produtos = await firebaseService.getAll('produtos');
      return produtos.filter(p => (p.quantidadeEstoque || 0) === 0 && p.status === 'ativo');
    } catch (error) {
      console.error('Erro ao buscar produtos sem estoque:', error);
      throw error;
    }
  },

  // Buscar estatísticas do estoque
  buscarEstatisticas: async () => {
    try {
      const produtos = await firebaseService.getAll('produtos');
      const produtosAtivos = produtos.filter(p => p.status === 'ativo');

      const totalProdutos = produtosAtivos.length;
      const valorTotalEstoque = produtosAtivos.reduce(
        (acc, p) => acc + (p.precoCusto || 0) * (p.quantidadeEstoque || 0), 
        0
      );
      const valorTotalVenda = produtosAtivos.reduce(
        (acc, p) => acc + (p.precoVenda || 0) * (p.quantidadeEstoque || 0), 
        0
      );

      const categorias = {};
      produtosAtivos.forEach(p => {
        if (p.categoria) {
          categorias[p.categoria] = (categorias[p.categoria] || 0) + 1;
        }
      });

      const estoqueBaixo = (await produtosService.buscarEstoqueBaixo()).length;
      const semEstoque = (await produtosService.buscarSemEstoque()).length;

      return {
        totalProdutos,
        valorTotalEstoque,
        valorTotalVenda,
        lucroPotencial: valorTotalVenda - valorTotalEstoque,
        estoqueBaixo,
        semEstoque,
        categorias: Object.keys(categorias).length,
        produtosPorCategoria: categorias
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  },

  // Buscar movimentações de um produto
  buscarMovimentacoes: async (produtoId) => {
    try {
      const [entradas, vendas] = await Promise.all([
        firebaseService.getAll('entradas'),
        firebaseService.getAll('itens_venda')
      ]);

      const movimentacoesEntrada = (entradas || [])
        .filter(e => e.produtoId === produtoId)
        .map(e => ({
          tipo: 'entrada',
          quantidade: e.quantidade,
          data: e.data,
          documento: e.documento,
          observacao: e.observacao
        }));

      const movimentacoesSaida = (vendas || [])
        .filter(v => v.produtoId === produtoId)
        .map(v => ({
          tipo: 'saida',
          quantidade: v.quantidade,
          data: v.data,
          vendaId: v.vendaId,
          observacao: 'Venda'
        }));

      return [...movimentacoesEntrada, ...movimentacoesSaida]
        .sort((a, b) => new Date(b.data) - new Date(a.data));
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      throw error;
    }
  }
};

// Função auxiliar para registrar movimentação de estoque
async function registrarMovimentacao(produtoId, tipo, quantidade, saldo, produtoNome) {
  try {
    await firebaseService.add('movimentacoes_estoque', {
      produtoId,
      produtoNome,
      tipo,
      quantidade,
      saldo,
      data: new Date().toISOString(),
      usuario: JSON.parse(localStorage.getItem('usuario') || '{}').nome || 'Sistema'
    });
  } catch (error) {
    console.warn('Erro ao registrar movimentação:', error);
  }
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
