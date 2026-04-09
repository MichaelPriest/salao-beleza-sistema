// src/scripts/criarTabelasSupabase.js
import { firebaseService } from '../services/firebase';

export const criarTabelasSupabase = async () => {
  console.log('🔧 Garantindo tabelas base no Supabase...');
  const ok = await firebaseService.ensureTables();

  if (ok) {
    console.log('✅ Processo concluído com sucesso');
  } else {
    console.log('⚠️ Execute manualmente o SQL no painel do Supabase (SQL Editor).');
  }

  return ok;
};

export default criarTabelasSupabase;
