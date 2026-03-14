// src/scripts/migrarClientes.js
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseService } from '../services/firebase';

export const migrarClientesParaFirebaseAuth = async () => {
  try {
    // Buscar todos os clientes
    const clientes = await firebaseService.getAll('clientes');
    
    for (const cliente of clientes) {
      // Verificar se já tem UID (se o ID do documento já é um UID)
      if (cliente.id && cliente.id.length > 20) {
        console.log(`✅ Cliente ${cliente.nome} já tem UID: ${cliente.id}`);
        continue;
      }

      try {
        // Criar usuário no Firebase Auth
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          cliente.email,
          'senha123' // Senha temporária - peça para o cliente trocar
        );
        
        const user = userCredential.user;
        
        // Copiar dados do cliente para o novo ID (UID)
        const { id, ...clienteData } = cliente;
        
        await firebaseService.set('clientes', user.uid, {
          ...clienteData,
          migrado: true,
          migradoEm: new Date().toISOString(),
          senhaTemporaria: true
        });
        
        // Excluir documento antigo
        await firebaseService.delete('clientes', id);
        
        console.log(`✅ Cliente ${cliente.nome} migrado com UID: ${user.uid}`);
        
      } catch (error) {
        console.error(`❌ Erro ao migrar cliente ${cliente.nome}:`, error);
      }
    }
    
    console.log('🎉 Migração concluída!');
    
  } catch (error) {
    console.error('Erro na migração:', error);
  }
};
