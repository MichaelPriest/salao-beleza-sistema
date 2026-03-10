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
} from '@mui/icons-material';
import InputMask from 'react-input-mask';
import { toast } from 'react-hot-toast';
import { firebaseService } from '../services/firebase'; // 🔥 IMPORTANTE: usar Firebase

// Máscaras para inputs
export const masks = {
  cpf: (value) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  },
  
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
  
  telefone: (value) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  },
  
  telefoneFixo: (value) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  },
  
  cep: (value) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  },
  
  data: (value) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{4})\d+?$/, '$1');
  },
  
  hora: (value) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1:$2')
      .replace(/(:\d{2})\d+?$/, '$1');
  },
  
  cartao: (value) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{4})(\d)/, '$1 $2')
      .replace(/(\d{4})(\d)/, '$1 $2')
      .replace(/(\d{4})(\d)/, '$1 $2')
      .replace(/(\d{4})\d+?$/, '$1');
  },
  
  dinheiro: (value) => {
    if (!value) return '';
    const apenasNumeros = value.replace(/\D/g, '');
    const valor = (parseInt(apenasNumeros) / 100).toFixed(2);
    return valor.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  },
};

// Componente de input com máscara
export const MaskedInput = ({ mask, value, onChange, ...props }) => {
  const getMaskFormat = (mask) => {
    const masks = {
      cpf: '999.999.999-99',
      cnpj: '99.999.999/9999-99',
      telefone: '(99) 99999-9999',
      telefoneFixo: '(99) 9999-9999',
      cep: '99999-999',
      data: '99/99/9999',
      hora: '99:99',
      cartao: '9999 9999 9999 9999',
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
    >
      {(inputProps) => <TextField {...inputProps} {...props} fullWidth />}
    </InputMask>
  );
};

// Serviço de busca de CEP
export const buscarCep = async (cep) => {
  try {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      return { erro: 'CEP deve ter 8 dígitos' };
    }

    // Tenta ViaCEP
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

// Componente de input com busca de CEP
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
      <TextField
        {...props}
        value={value || ''}
        onChange={onChange}
        onBlur={handleCepBlur}
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

// Componente de upload de imagem
export const ImageUpload = ({ value, onChange, label, ...props }) => {
  const [preview, setPreview] = useState(value);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem muito grande. Máximo 5MB');
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        toast.error('Arquivo deve ser uma imagem');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', mb: 2 }}>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="image-upload"
        type="file"
        onChange={handleImageChange}
      />
      <label htmlFor="image-upload">
        <Avatar
          src={preview}
          sx={{
            width: 120,
            height: 120,
            mx: 'auto',
            mb: 2,
            cursor: 'pointer',
            border: '2px dashed #9c27b0',
            '&:hover': {
              opacity: 0.8,
            },
          }}
        >
          {!preview && <PersonIcon sx={{ fontSize: 60 }} />}
        </Avatar>
        <Button variant="outlined" component="span" size="small" sx={{ mb: 1 }}>
          {value ? 'Trocar Foto' : 'Adicionar Foto'}
        </Button>
      </label>
      {value && (
        <IconButton
          size="small"
          color="error"
          onClick={() => {
            setPreview(null);
            onChange(null);
          }}
        >
          <DeleteIcon />
        </IconButton>
      )}
    </Box>
  );
};

// Componente de endereço completo
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

// 🔥 HISTÓRICO DE ATENDIMENTOS DO CLIENTE - CORRIGIDO COM FIREBASE
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
      // Buscar todos os atendimentos
      const todosAtendimentos = await firebaseService.getAll('atendimentos').catch(() => []);
      
      // Filtrar por cliente e status finalizado/cancelado
      const atendimentosCliente = todosAtendimentos.filter(a => 
        a.clienteId === clienteId && 
        (a.status === 'finalizado' || a.status === 'cancelado')
      );

      // Buscar profissionais e serviços para enriquecer os dados
      const [profissionaisData, servicosData] = await Promise.all([
        firebaseService.getAll('profissionais').catch(() => []),
        firebaseService.getAll('servicos').catch(() => []),
      ]);

      setAtendimentos(atendimentosCliente);
      setProfissionais(profissionaisData);
      setServicos(servicosData);

      // Calcular estatísticas
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
            {/* Cards de resumo */}
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
