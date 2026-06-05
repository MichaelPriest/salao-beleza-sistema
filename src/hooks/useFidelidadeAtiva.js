import { useCallback, useEffect, useState } from 'react';
import { fidelidadeConfigService } from '../services/fidelidadeConfigService';

export const FIDELIDADE_CONFIG_UPDATED_EVENT = 'fidelidadeConfigAtualizada';

export const notificarFidelidadeConfigAtualizada = (config) => {
  window.dispatchEvent(new CustomEvent(FIDELIDADE_CONFIG_UPDATED_EVENT, { detail: config }));
};

export const useFidelidadeAtiva = () => {
  const [ativo, setAtivo] = useState(false);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    try {
      const config = await fidelidadeConfigService.buscarAtivas();
      setAtivo(config?.ativo !== false);
    } catch (error) {
      console.error('Erro ao verificar disponibilidade da fidelidade:', error);
      setAtivo(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();

    const atualizar = (event) => {
      if (event.detail) {
        setAtivo(event.detail.ativo !== false);
        setLoading(false);
      } else {
        carregar();
      }
    };

    window.addEventListener(FIDELIDADE_CONFIG_UPDATED_EVENT, atualizar);
    return () => window.removeEventListener(FIDELIDADE_CONFIG_UPDATED_EVENT, atualizar);
  }, [carregar]);

  return { fidelidadeAtiva: ativo, fidelidadeLoading: loading, recarregarFidelidade: carregar };
};
