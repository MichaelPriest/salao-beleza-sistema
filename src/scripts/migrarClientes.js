// src/scripts/migrarClientes.js
import { firebaseService } from '../services/firebase';
import { supabaseAuthService } from '../services/supabaseAuth';

export const migrarClientesParaSupabaseAuth = async () => {
  try {
    const clientes = await firebaseService.getAll('clientes');

    for (const cliente of clientes) {
      if (cliente.id && cliente.id.length > 20) {
        console.log(`✅ Cliente ${cliente.nome} já tem UID: ${cliente.id}`);
        continue;
      }

      try {
        const signUpResult = await supabaseAuthService.signUp(cliente.email, 'senha123', {
          nome: cliente.nome
        });

        const user = signUpResult.user;
        const { id, ...clienteData } = cliente;

        await firebaseService.set('clientes', user.id, {
          ...clienteData,
          migrado: true,
          migradoEm: new Date().toISOString(),
          senhaTemporaria: true
        });

        await firebaseService.delete('clientes', id);
        console.log(`✅ Cliente ${cliente.nome} migrado com UID: ${user.id}`);
      } catch (error) {
        console.error(`❌ Erro ao migrar cliente ${cliente.nome}:`, error);
      }
    }

    console.log('🎉 Migração concluída!');
  } catch (error) {
    console.error('Erro na migração:', error);
  }
};
