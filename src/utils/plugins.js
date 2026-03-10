// src/utils/plugins.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Avatar,
  Button,
  IconButton,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  InputAdornment,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Person as PersonIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import InputMask from 'react-input-mask';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase';

// ===========================================
// SERVIÇO DE COMPRESSÃO DE IMAGEM
// ===========================================
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
    if (!base64String) return 0;
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
    
    console.log(`✅ Imagem otimizada: ${size.toFixed(2)}KB (qualidade final: ${(quality + 0.1).toFixed(1)})`);
    return compressed;
  }
};

// ===========================================
// MÁSCARAS
// ===========================================
export const masks = {
  // CPF: 000.000.000-00
  cpf: (value) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  },
  
  // RG: 00.000.000-0 ou 00.000.000-X
  rg: (value) => {
    if (!value) return '';
    return value
      .replace(/[^\dXx]/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})([\dXx]{1})/, '$1-$2')
      .replace(/(-\d{1})\d+?$/, '$1')
      .toUpperCase();
  },
  
  // CNPJ: 00.000.000/0000-00
  cnpj: (value) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  },
  
  // Telefone Celular: (00) 00000-0000
  telefone: (value) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  },
  
  // Telefone Fixo: (00) 0000-0000
  telefoneFixo: (value) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  },
  
  // CEP: 00000-000
  cep: (value) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  },
  
  // Data: 00/00/0000
  data: (value) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{4})\d+?$/, '$1');
  },
  
  // Hora: 00:00
  hora: (value) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1:$2')
      .replace(/(:\d{2})\d+?$/, '$1');
  },
  
  // Cartão de Crédito: 0000 0000 0000 0000
  cartao: (value) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{4})(\d)/, '$1 $2')
      .replace(/(\d{4})(\d)/, '$1 $2')
      .replace(/(\d{4})(\d)/, '$1 $2')
      .replace(/(\d{4})\d+?$/, '$1');
  },
  
  // Dinheiro: 0,00 → 1.000,00
  dinheiro: (value) => {
    if (!value) return '';
    const apenasNumeros = value.replace(/\D/g, '');
    const valor = (parseInt(apenasNumeros || '0') / 100).toFixed(2);
    return valor.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  },
  
  // Número: apenas números
  numero: (value) => {
    if (!value) return '';
    return value.replace(/\D/g, '');
  },
  
  // Letras: apenas letras
  letras: (value) => {
    if (!value) return '';
    return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
  },
  
  // Placa de Carro: ABC-1234
  placa: (value) => {
    if (!value) return '';
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .replace(/([A-Z]{3})(\d{4})/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  },
};

// ===========================================
// COMPONENTE DE INPUT COM MÁSCARA
// ===========================================
export const MaskedInput = ({ mask, value, onChange, ...props }) => {
  const getMaskFormat = (mask) => {
    const masks = {
      cpf: '999.999.999-99',
      rg: '99.999.999-9',
      cnpj: '99.999.999/9999-99',
      telefone: '(99) 99999-9999',
      telefoneFixo: '(99) 9999-9999',
      cep: '99999-999',
      data: '99/99/9999',
      hora: '99:99',
      cartao: '9999 9999 9999 9999',
      placa: 'AAA-9999',
    };
    return masks[mask] || '';
  };

  const handleChange = (e) => {
    const rawValue = e.target.value;
    const maskedValue = masks[mask] ? masks[mask](rawValue) : rawValue;
    onChange({ target: { name: props.name, value: maskedValue } });
  };

  return (
    <InputMask
      mask={getMaskFormat(mask)}
      value={value || ''}
      onChange={handleChange}
      disabled={props.disabled}
      maskChar={null}
    >
      {(inputProps) => <TextField {...inputProps} {...props} fullWidth />}
    </InputMask>
  );
};

// ===========================================
// SERVIÇO DE BUSCA DE CEP
// ===========================================
export const buscarCep = async (cep) => {
  try {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      return { erro: 'CEP deve ter 8 dígitos' };
    }

    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await response.json();
    
    if (data.erro) {
      return { erro: 'CEP não encontrado' };
    }
    
    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      estado: data.uf || '',
      cep: data.cep || '',
      complemento: data.complemento || '',
      success: true,
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return { erro: 'Erro ao buscar CEP' };
  }
};

// ===========================================
// COMPONENTE DE INPUT COM BUSCA DE CEP
// ===========================================
export const CepInput = ({ value, onChange, onCepFound, ...props }) => {
  const [loading, setLoading] = useState(false);

  const handleCepBlur = async () => {
    const cepLimpo = value?.replace(/\D/g, '') || '';
    if (cepLimpo.length === 8) {
      setLoading(true);
      const resultado = await buscarCep(value);
      setLoading(false);
      
      if (onCepFound && resultado.success) {
        onCepFound(resultado);
        toast.success('CEP encontrado!');
      } else if (resultado.erro) {
        toast.error(resultado.erro);
      }
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <MaskedInput
        mask="cep"
        value={value}
        onChange={onChange}
        onBlur={handleCepBlur}
        {...props}
        InputProps={{
          endAdornment: loading && (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

// ===========================================
// COMPONENTE DE UPLOAD DE IMAGEM COM COMPRESSÃO
// ===========================================
export const ImageUpload = ({ 
  value, 
  onChange, 
  label, 
  maxSizeKB = 200, // Tamanho máximo em KB (padrão: 200KB)
  ...props 
}) => {
  const [preview, setPreview] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [imageSize, setImageSize] = useState(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      toast.loading('Processando imagem...', { id: 'image-processing' });

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        toast.error('Arquivo deve ser uma imagem', { id: 'image-processing' });
        return;
      }

      // Validar tamanho original (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem muito grande. Máximo 5MB', { id: 'image-processing' });
        return;
      }

      // Converter File para Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        try {
          const base64String = reader.result;
          
          // Verificar tamanho original
          const originalSize = imageCompressor.getImageSize(base64String);
          console.log(`📸 Tamanho original: ${originalSize.toFixed(2)}KB`);

          // Comprimir imagem
          let finalImage = base64String;
          
          if (originalSize > maxSizeKB) {
            toast.loading(`Comprimindo imagem (${originalSize.toFixed(0)}KB → ${maxSizeKB}KB)...`, 
              { id: 'image-processing' });
            
            finalImage = await imageCompressor.compressToTargetSize(base64String, maxSizeKB);
          }

          // Verificar tamanho final
          const finalSize = imageCompressor.getImageSize(finalImage);
          setImageSize(finalSize);

          // Atualizar preview e valor
          setPreview(finalImage);
          onChange(finalImage);
          
          toast.success(`Imagem processada: ${finalSize.toFixed(1)}KB`, 
            { id: 'image-processing' });
          
        } catch (error) {
          console.error('Erro ao processar imagem:', error);
          toast.error('Erro ao processar imagem', { id: 'image-processing' });
        } finally {
          setUploading(false);
        }
      };
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao processar imagem');
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setImageSize(null);
    onChange(null);
  };

  return (
    <Box sx={{ textAlign: 'center', mb: 2 }}>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="image-upload"
        type="file"
        onChange={handleImageChange}
        disabled={uploading}
      />
      <label htmlFor="image-upload">
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Avatar
            src={preview}
            sx={{
              width: 120,
              height: 120,
              mx: 'auto',
              mb: 2,
              cursor: uploading ? 'wait' : 'pointer',
              border: '2px dashed #9c27b0',
              opacity: uploading ? 0.7 : 1,
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            {!preview && <PersonIcon sx={{ fontSize: 60 }} />}
          </Avatar>
          {uploading && (
            <CircularProgress
              size={40}
              sx={{
                position: 'absolute',
                top: '40%',
                left: '40%',
                color: '#9c27b0',
              }}
            />
          )}
        </Box>
        <Button
          variant="outlined"
          component="span"
          size="small"
          disabled={uploading}
          startIcon={<PhotoCameraIcon />}
          sx={{ mb: 1 }}
        >
          {value ? 'Trocar Foto' : 'Adicionar Foto'}
        </Button>
      </label>
      
      {imageSize && (
        <Typography variant="caption" display="block" color="textSecondary">
          Tamanho: {imageSize.toFixed(1)}KB
          {imageSize > maxSizeKB && (
            <WarningIcon fontSize="inherit" sx={{ ml: 0.5, color: 'warning.main', verticalAlign: 'middle' }} />
          )}
        </Typography>
      )}
      
      {value && (
        <IconButton
          size="small"
          color="error"
          onClick={handleRemoveImage}
          disabled={uploading}
        >
          <DeleteIcon />
        </IconButton>
      )}
    </Box>
  );
};

// ===========================================
// COMPONENTE DE FORMULÁRIO DE ENDEREÇO
// ===========================================
export const EnderecoForm = ({ endereco, onChange, onCepFound }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <CepInput
          fullWidth
          label="CEP"
          name="cep"
          value={endereco.cep || ''}
          onChange={(e) => onChange('cep', e.target.value)}
          onCepFound={onCepFound}
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={8}>
        <TextField
          fullWidth
          label="Logradouro"
          name="logradouro"
          value={endereco.logradouro || ''}
          onChange={(e) => onChange('logradouro', e.target.value)}
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Número"
          name="numero"
          value={endereco.numero || ''}
          onChange={(e) => onChange('numero', e.target.value)}
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={8}>
        <TextField
          fullWidth
          label="Complemento"
          name="complemento"
          value={endereco.complemento || ''}
          onChange={(e) => onChange('complemento', e.target.value)}
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Bairro"
          name="bairro"
          value={endereco.bairro || ''}
          onChange={(e) => onChange('bairro', e.target.value)}
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Cidade"
          name="cidade"
          value={endereco.cidade || ''}
          onChange={(e) => onChange('cidade', e.target.value)}
          size="small"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Estado"
          name="estado"
          value={endereco.estado || ''}
          onChange={(e) => onChange('estado', e.target.value.toUpperCase())}
          inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
          size="small"
          placeholder="UF"
        />
      </Grid>
    </Grid>
  );
};

// ===========================================
// HISTÓRICO DE ATENDIMENTOS DO CLIENTE
// ===========================================
export const HistoricoAtendimentosCliente = ({ clienteId, clienteNome }) => {
  const [atendimentos, setAtendimentos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    valorTotal: 0,
  });

  useEffect(() => {
    if (clienteId) {
      carregarHistorico();
    }
  }, [clienteId]);

  const carregarHistorico = async () => {
    setLoading(true);
    try {
      const todosAtendimentos = await firebaseService.getAll('atendimentos').catch(() => []);
      
      const atendimentosCliente = todosAtendimentos.filter(a => 
        a.clienteId === clienteId && 
        (a.status === 'finalizado' || a.status === 'cancelado')
      );

      const [profissionaisData, servicosData] = await Promise.all([
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('servicos').catch(() => []),
      ]);

      setAtendimentos(atendimentosCliente);
      setProfissionais(profissionaisData);
      setServicos(servicosData);

      const valorTotal = atendimentosCliente.reduce((acc, a) => {
        if (a.status === 'finalizado') {
          return acc + (a.valorTotal || 0);
        }
        return acc;
      }, 0);

      setStats({
        total: atendimentosCliente.length,
        valorTotal,
      });

    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  const getProfissionalNome = (profissionalId) => {
    if (!profissionalId) return 'Profissional não identificado';
    const profissional = profissionais.find(p => p.id === profissionalId);
    return profissional?.nome || 'Profissional não encontrado';
  };

  const getServicosNomes = (atendimento) => {
    if (atendimento.itensServico && atendimento.itensServico.length > 0) {
      return atendimento.itensServico.map(item => item.nome).join(', ');
    } else if (atendimento.servicoId) {
      const servico = servicos.find(s => s.id === atendimento.servicoId);
      return servico?.nome || 'Serviço não encontrado';
    }
    return 'Serviço não especificado';
  };

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'finalizado': return 'success';
      case 'cancelado': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0', fontWeight: 600 }}>
          Histórico de Atendimentos {clienteNome && `- ${clienteNome}`}
        </Typography>
        
        {loading ? (
          <LinearProgress />
        ) : atendimentos.length === 0 ? (
          <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
            Nenhum atendimento encontrado para este cliente
          </Typography>
        ) : (
          <>
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
              <Card variant="outlined" sx={{ flex: 1, p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total de Atendimentos
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {stats.total}
                </Typography>
              </Card>
              <Card variant="outlined" sx={{ flex: 1, p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Valor Total Gasto
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  R$ {stats.valorTotal.toFixed(2)}
                </Typography>
              </Card>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Data</strong></TableCell>
                    <TableCell><strong>Serviços</strong></TableCell>
                    <TableCell><strong>Profissional</strong></TableCell>
                    <TableCell align="right"><strong>Valor</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {atendimentos.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        {formatarData(item.data)}
                        <Typography variant="caption" display="block" color="textSecondary">
                          {item.horaInicio || ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {item.itensServico?.map((s, i) => (
                            <Chip
                              key={i}
                              label={s.nome}
                              size="small"
                              variant="outlined"
                            />
                          )) || (
                            <Chip
                              label={getServicosNomes(item)}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{getProfissionalNome(item.profissionalId)}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600} color="#4caf50">
                          R$ {item.valorTotal?.toFixed(2) || '0,00'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.status === 'finalizado' ? 'Finalizado' : 'Cancelado'}
                          size="small"
                          color={getStatusColor(item.status)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Total de atendimentos: {atendimentos.length}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                Valor total: R$ {atendimentos.reduce((acc, item) => acc + (item.valorTotal || 0), 0).toFixed(2)}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};
