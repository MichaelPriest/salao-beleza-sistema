// src/services/imageCompressor.js
export const imageCompressor = {
  /**
   * Comprimir imagem Base64
   * @param {string} base64String - Imagem em formato Base64
   * @param {number} maxWidth - Largura máxima (padrão: 800px)
   * @param {number} quality - Qualidade (0-1, padrão: 0.6)
   * @returns {Promise<string>} - Imagem comprimida em Base64
   */
  compressImage: (base64String, maxWidth = 800, quality = 0.6) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64String;
      
      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (maxWidth * height) / width;
          width = maxWidth;
        }
        
        // Criar canvas para redimensionar
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Desenhar imagem redimensionada
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converter para Base64 com qualidade reduzida
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        
        // Verificar tamanho
        const sizeInBytes = Math.round((compressedBase64.length * 3) / 4);
        const sizeInKB = sizeInBytes / 1024;
        
        console.log(`📸 Imagem comprimida: ${sizeInKB.toFixed(2)}KB`);
        
        resolve(compressedBase64);
      };
      
      img.onerror = (error) => {
        reject(error);
      };
    });
  },
  
  /**
   * Validar tamanho da imagem
   * @param {string} base64String - Imagem em Base64
   * @returns {number} - Tamanho em KB
   */
  getImageSize: (base64String) => {
    const sizeInBytes = Math.round((base64String.length * 3) / 4);
    return sizeInBytes / 1024;
  },
  
  /**
   * Comprimir imagem até atingir tamanho alvo
   * @param {string} base64String - Imagem original
   * @param {number} targetSizeKB - Tamanho alvo em KB (padrão: 200KB)
   * @returns {Promise<string>} - Imagem comprimida
   */
  compressToTargetSize: async (base64String, targetSizeKB = 200) => {
    let quality = 0.9;
    let compressed = base64String;
    let size = imageCompressor.getImageSize(compressed);
    
    // Reduz qualidade progressivamente até atingir tamanho alvo
    while (size > targetSizeKB && quality > 0.1) {
      compressed = await imageCompressor.compressImage(base64String, 800, quality);
      size = imageCompressor.getImageSize(compressed);
      quality -= 0.1;
    }
    
    console.log(`✅ Imagem otimizada: ${size.toFixed(2)}KB (qualidade: ${(quality + 0.1).toFixed(1)})`);
    return compressed;
  }
};
