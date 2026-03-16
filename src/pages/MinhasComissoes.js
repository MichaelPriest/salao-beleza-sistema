// src/pages/MinhasComissoes.js
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  Snackbar,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  Checkbox,
  useMediaQuery,
  useTheme,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
  Zoom,
  Fab,
  Skeleton,
  Collapse,
  Pagination,
  Stack,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { firebaseService } from '../services/firebase';
import { auditoriaService } from '../services/auditoriaService';
import { format, isValid, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Importações para PDF e Excel
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Ícones
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BarChartIcon from '@mui/icons-material/BarChart';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PercentIcon from '@mui/icons-material/Percent';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import WarningIcon from '@mui/icons-material/Warning';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShareIcon from '@mui/icons-material/Share';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Função utilitária para formatar data com segurança
const formatDate = (date, formatString = 'dd/MM/yyyy') => {
  if (!date) return '—';
  
  try {
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    if (!isValid(dateObj)) return '—';
    return format(dateObj, formatString, { locale: ptBR });
  } catch (error) {
    console.warn('Erro ao formatar data:', error);
    return '—';
  }
};

// Função para formatar moeda
const formatarMoeda = (valor) => {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  } catch {
    return `R$ ${(valor || 0).toFixed(2)}`;
  }
};

// Componente de Card de Comissão Mobile
const ComissaoMobileCard = ({ comissao, isAdmin, onDetalhes }) => {
  const [expanded, setExpanded] = useState(false);

  const handleVerDetalhes = () => {
    onDetalhes({
      ...comissao,
      tipo: 'comissao'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card 
        sx={{ 
          mb: 1.5, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: comissao.status === 'pago' ? '#4caf50' : 
                         comissao.status === 'cancelado' ? '#f44336' : '#ff9800',
                width: 48,
                height: 48,
              }}
            >
              {comissao.status === 'pago' ? <CheckCircleIcon /> : 
               comissao.status === 'cancelado' ? <WarningIcon /> : <PendingIcon />}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {comissao.servicoNome || 'Serviço'}
                </Typography>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {isAdmin && comissao.profissionalNome && (
                  <Chip
                    size="small"
                    icon={<PersonIcon sx={{ fontSize: 12 }} />}
                    label={comissao.profissionalNome}
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
                
                <Chip
                  size="small"
                  label={`${comissao.percentual}%`}
                  sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#f3e5f5' }}
                />
                
                <Chip
                  size="small"
                  label={comissao.status}
                  color={comissao.status === 'pago' ? 'success' : 
                         comissao.status === 'cancelado' ? 'error' : 'warning'}
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(comissao.dataRegistro || comissao.createdAt || comissao.data)}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#4caf50', fontWeight: 600 }}>
                  {formatarMoeda(comissao.valor)}
                </Typography>
              </Box>

              <Collapse in={expanded}>
                <Box sx={{ 
                  mt: 2, 
                  pt: 2, 
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  gap: 1,
                  justifyContent: 'flex-end'
                }} onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Ver Detalhes">
                    <IconButton
                      size="small"
                      onClick={handleVerDetalhes}
                      sx={{ color: '#9c27b0' }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Collapse>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente de Card de Atendimento Mobile
const AtendimentoMobileCard = ({ atendimento, onDetalhes }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card 
        sx={{ 
          mb: 1.5, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
        }}
        onClick={() => onDetalhes(atendimento)}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={atendimento.cliente?.foto}
              sx={{ 
                bgcolor: '#9c27b0',
                width: 48,
                height: 48,
              }}
            >
              {!atendimento.cliente?.foto && (atendimento.cliente?.nome?.charAt(0) || 'C')}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {atendimento.cliente?.nome || 'Cliente não encontrado'}
                </Typography>
                <Chip
                  size="small"
                  label={atendimento.status || 'Pendente'}
                  color={atendimento.status === 'finalizado' ? 'success' : 
                         atendimento.status === 'cancelado' ? 'error' : 'warning'}
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EventIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(atendimento.data)} {atendimento.horaInicio ? `às ${atendimento.horaInicio}` : ''}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {atendimento.servicos?.map(s => s.nome).join(', ') || 
                   atendimento.itensServico?.map(s => s.nome).join(', ') || 
                   'Serviço'}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#4caf50', fontWeight: 600 }}>
                  {formatarMoeda(atendimento.valorTotal || 0)}
                </Typography>
              </Box>

              {atendimento.comissoes && atendimento.comissoes.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Chip
                    size="small"
                    icon={<PercentIcon sx={{ fontSize: 12 }} />}
                    label={`Comissão: ${formatarMoeda(atendimento.comissaoTotal || 0)}`}
                    color={atendimento.comissaoPaga ? 'success' : 'warning'}
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente para impressão - VERSÃO OTIMIZADA
const RelatorioComissoes = React.forwardRef(({ 
  dados, 
  profissional, 
  periodo, 
  filtros,
  configuracoes,
  isAdmin,
  tipo = 'completo' 
}, ref) => {
  const formatarMoeda = (valor) => {
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(valor || 0);
    } catch {
      return `R$ ${(valor || 0).toFixed(2)}`;
    }
  };

  const formatarData = (data) => {
    if (!data) return '—';
    try {
      const date = new Date(data);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return '—';
    }
  };

  const getNomeProfissional = () => {
    if (isAdmin && filtros?.profissionalNome) {
      return filtros.profissionalNome;
    }
    if (isAdmin && (!filtros?.profissionalId || filtros.profissionalId === 'todos')) {
      return 'Todos os Profissionais';
    }
    return profissional?.nome || 'Todos os Profissionais';
  };

  return (
    <Box ref={ref} sx={{ 
      p: 3, 
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      maxWidth: '1000px', 
      margin: '0 auto',
      backgroundColor: '#ffffff',
      color: '#1e293b',
      fontSize: '11px',
      lineHeight: 1.4
    }}>
      {/* HEADER COMPACTO */}
      <Box sx={{ 
        mb: 2, 
        pb: 1.5, 
        borderBottom: '2px solid #9c27b0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box>
          <Typography sx={{ 
            fontWeight: 700, 
            color: '#0f172a',
            fontSize: '16px',
            lineHeight: 1.2
          }}>
            {configuracoes?.salao?.nomeFantasia || 'Salão de Beleza'}
          </Typography>
          {configuracoes?.salao?.cnpj && (
            <Typography sx={{ color: '#475569', fontSize: '10px', mt: 0.25 }}>
              CNPJ: {configuracoes.salao.cnpj}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ 
            fontWeight: 600, 
            color: '#9c27b0',
            fontSize: '12px',
            textTransform: 'uppercase'
          }}>
            Relatório de Comissões
          </Typography>
          <Typography sx={{ color: '#475569', fontSize: '10px', mt: 0.25 }}>
            Emitido em: {new Date().toLocaleString('pt-BR')}
          </Typography>
        </Box>
      </Box>

      {/* INFO RÁPIDA */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2,
        mb: 2,
        flexWrap: 'wrap'
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 0.5,
          bgcolor: '#f1f5f9',
          px: 1.5,
          py: 0.5,
          borderRadius: 4
        }}>
          <Typography sx={{ fontSize: '10px', color: '#475569' }}>👤</Typography>
          <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
            <span style={{ color: '#64748b' }}>Profissional:</span>{' '}
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{getNomeProfissional()}</span>
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 0.5,
          bgcolor: '#f1f5f9',
          px: 1.5,
          py: 0.5,
          borderRadius: 4
        }}>
          <Typography sx={{ fontSize: '10px', color: '#475569' }}>📅</Typography>
          <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
            <span style={{ color: '#64748b' }}>Período:</span>{' '}
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{periodo}</span>
          </Typography>
        </Box>
      </Box>

      {/* CARDS DE RESUMO */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ 
          fontWeight: 600, 
          mb: 1, 
          color: '#0f172a',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}>
          <span style={{ 
            display: 'inline-block',
            width: 3,
            height: 14,
            backgroundColor: '#9c27b0',
            borderRadius: 2,
            marginRight: 4
          }} />
          Resumo do Período
        </Typography>
        
        <Grid container spacing={1}>
          <Grid item xs={4}>
            <Paper sx={{ 
              p: 1.5, 
              bgcolor: '#f8fafc',
              borderRadius: 2,
              border: '1px solid #e2e8f0'
            }}>
              <Typography sx={{ color: '#64748b', fontSize: '9px', textTransform: 'uppercase', mb: 0.5 }}>
                Total Comissões
              </Typography>
              <Typography sx={{ 
                color: '#059669', 
                fontWeight: 700,
                fontSize: '14px'
              }}>
                {formatarMoeda(dados.resumo.totalPeriodo)}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={4}>
            <Paper sx={{ 
              p: 1.5, 
              bgcolor: '#f8fafc',
              borderRadius: 2,
              border: '1px solid #e2e8f0'
            }}>
              <Typography sx={{ color: '#64748b', fontSize: '9px', textTransform: 'uppercase', mb: 0.5 }}>
                A Receber
              </Typography>
              <Typography sx={{ 
                color: '#d97706', 
                fontWeight: 700,
                fontSize: '14px'
              }}>
                {formatarMoeda(dados.resumo.aReceber)}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={4}>
            <Paper sx={{ 
              p: 1.5, 
              bgcolor: '#f8fafc',
              borderRadius: 2,
              border: '1px solid #e2e8f0'
            }}>
              <Typography sx={{ color: '#64748b', fontSize: '9px', textTransform: 'uppercase', mb: 0.5 }}>
                Recebido
              </Typography>
              <Typography sx={{ 
                color: '#059669', 
                fontWeight: 700,
                fontSize: '14px'
              }}>
                {formatarMoeda(dados.resumo.recebido)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* TABELA DE ATENDIMENTOS */}
      {dados.atendimentos.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ 
            fontWeight: 600, 
            mb: 1, 
            color: '#0f172a',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            <span style={{ 
              display: 'inline-block',
              width: 3,
              height: 14,
              backgroundColor: '#9c27b0',
              borderRadius: 2,
              marginRight: 4
            }} />
            Atendimentos no Período
          </Typography>
          
          <TableContainer component={Paper} sx={{ 
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <Table size="small" sx={{ fontSize: '10px' }}>
              <TableHead>
                <TableRow sx={{ 
                  bgcolor: '#f8fafc',
                  '& th': {
                    fontWeight: 600,
                    color: '#1e293b',
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid #e2e8f0',
                    py: 1,
                    px: 1
                  }
                }}>
                  <TableCell>Data</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Serviços</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell align="right">Comissão</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.atendimentos.map((atendimento, index) => (
                  <TableRow 
                    key={index}
                    sx={{ 
                      '&:nth-of-type(even)': { bgcolor: '#faf9ff' },
                      '& td': {
                        borderBottom: '1px solid #e2e8f0',
                        py: 0.75,
                        px: 1,
                        fontSize: '10px'
                      }
                    }}
                  >
                    <TableCell>{formatarData(atendimento.data)}</TableCell>
                    <TableCell>
                      <span style={{ 
                        display: 'inline-block',
                        maxWidth: '80px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {atendimento.cliente?.nome || 'Cliente não encontrado'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span style={{ 
                        display: 'inline-block',
                        maxWidth: '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {atendimento.servicos?.map(s => s.nome).join(', ') || '—'}
                      </span>
                    </TableCell>
                    <TableCell align="right">{formatarMoeda(atendimento.valorTotal)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#059669' }}>
                      {formatarMoeda(atendimento.comissaoTotal)}
                    </TableCell>
                    <TableCell>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 6px',
                        borderRadius: 10,
                        fontSize: '8px',
                        fontWeight: 600,
                        backgroundColor: atendimento.comissaoPaga ? '#ecfdf5' : '#fffbeb',
                        color: atendimento.comissaoPaga ? '#059669' : '#d97706',
                        border: '1px solid',
                        borderColor: atendimento.comissaoPaga ? '#a7f3d0' : '#fed7aa'
                      }}>
                        {atendimento.comissaoPaga ? 'Pago' : 'Pendente'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* TABELA DE COMISSÕES */}
      {dados.comissoes.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ 
            fontWeight: 600, 
            mb: 1, 
            color: '#0f172a',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            <span style={{ 
              display: 'inline-block',
              width: 3,
              height: 14,
              backgroundColor: '#9c27b0',
              borderRadius: 2,
              marginRight: 4
            }} />
            Detalhamento das Comissões
          </Typography>
          
          <TableContainer component={Paper} sx={{ 
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <Table size="small" sx={{ fontSize: '10px' }}>
              <TableHead>
                <TableRow sx={{ 
                  bgcolor: '#f8fafc',
                  '& th': {
                    fontWeight: 600,
                    color: '#1e293b',
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid #e2e8f0',
                    py: 1,
                    px: 1
                  }
                }}>
                  <TableCell>Data</TableCell>
                  <TableCell>Serviço</TableCell>
                  <TableCell align="right">%</TableCell>
                  <TableCell align="right">Valor Base</TableCell>
                  <TableCell align="right">Comissão</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Pagamento</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.comissoes.map((comissao, index) => (
                  <TableRow 
                    key={index}
                    sx={{ 
                      '&:nth-of-type(even)': { bgcolor: '#faf9ff' },
                      '& td': {
                        borderBottom: '1px solid #e2e8f0',
                        py: 0.75,
                        px: 1,
                        fontSize: '10px'
                      }
                    }}
                  >
                    <TableCell>{formatarData(comissao.data)}</TableCell>
                    <TableCell>
                      <span style={{ 
                        display: 'inline-block',
                        maxWidth: '80px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {comissao.servicoNome}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <span style={{
                        display: 'inline-block',
                        padding: '1px 4px',
                        borderRadius: 4,
                        backgroundColor: '#f3e5f5',
                        color: '#9c27b0',
                        fontWeight: 600,
                        fontSize: '9px'
                      }}>
                        {comissao.percentual}%
                      </span>
                    </TableCell>
                    <TableCell align="right">{formatarMoeda(comissao.valorAtendimento)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#059669' }}>
                      {formatarMoeda(comissao.valor)}
                    </TableCell>
                    <TableCell>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 6px',
                        borderRadius: 10,
                        fontSize: '8px',
                        fontWeight: 600,
                        backgroundColor: comissao.status === 'pago' ? '#ecfdf5' : 
                                       comissao.status === 'cancelado' ? '#fef2f2' : '#fffbeb',
                        color: comissao.status === 'pago' ? '#059669' : 
                               comissao.status === 'cancelado' ? '#dc2626' : '#d97706',
                        border: '1px solid',
                        borderColor: comissao.status === 'pago' ? '#a7f3d0' : 
                                    comissao.status === 'cancelado' ? '#fecaca' : '#fed7aa'
                      }}>
                        {comissao.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {comissao.dataPagamento ? formatarData(comissao.dataPagamento) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* RODAPÉ COMPACTO */}
      <Box sx={{ 
        mt: 2, 
        pt: 1.5, 
        borderTop: '1px dashed #cbd5e1',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#64748b',
        fontSize: '8px'
      }}>
        <Box>
          <Typography sx={{ fontSize: '8px', fontWeight: 500 }}>
            © {new Date().getFullYear()} - {configuracoes?.salao?.nomeFantasia || 'Sistema'}
          </Typography>
          <Typography sx={{ fontSize: '8px', mt: 0.25 }}>
            Documento não fiscal • Gerado automaticamente
          </Typography>
        </Box>
        
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontSize: '8px' }}>
            Período: {periodo}
          </Typography>
          {filtros.profissionalNome && filtros.profissionalNome !== 'todos' && (
            <Typography sx={{ fontSize: '8px', mt: 0.25 }}>
              Profissional: {filtros.profissionalNome}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
});

function MinhasComissoes() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(true);
  const [comissoes, setComissoes] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [configuracoes, setConfiguracoes] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [estatisticas, setEstatisticas] = useState(null);
  const [profissional, setProfissional] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Filtros
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroProfissional, setFiltroProfissional] = useState('todos');
  
  // Paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  
  // Dialogs
  const [openDetalhesDialog, setOpenDetalhesDialog] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [openRelatorioDialog, setOpenRelatorioDialog] = useState(false);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    tipo: 'completo',
    incluirResumo: true,
    incluirAtendimentos: true,
    incluirComissoes: true,
    incluirServicos: true,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [bottomNavValue, setBottomNavValue] = useState(0);

  // Refs para impressão
  const relatorioRef = useRef(null);

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const anos = [2024, 2025, 2026, 2027];

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (profissional) {
      carregarComissoes();
      carregarAtendimentos();
    }
  }, [profissional, filtroMes, filtroAno, filtroStatus, filtroProfissional]);

  useEffect(() => {
    if (comissoes.length > 0) {
      calcularResumo();
      calcularEstatisticas();
    }
  }, [comissoes]);

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Carregando dados de comissões...');

      // Carregar configurações primeiro
      const configuracoesData = await firebaseService.getAll('configuracoes');
      const configuracoesArray = Array.isArray(configuracoesData) ? configuracoesData : [];
      if (configuracoesArray.length > 0) {
        console.log('Configurações carregadas:', configuracoesArray[0].salao?.nomeFantasia);
        setConfiguracoes(configuracoesArray[0]);
      }
      
      // Carregar usuário logado
      let usuarioLogado = null;
      let profissionalId = null;
      let profissionalNome = '';
      let usuarioTipo = 'profissional';
      
      try {
        const usuarioStr = localStorage.getItem('usuario');
        if (usuarioStr) {
          usuarioLogado = JSON.parse(usuarioStr);
          usuarioTipo = usuarioLogado?.cargo || 'profissional';
          
          if (usuarioTipo === 'admin') {
            profissionalId = usuarioLogado?.profissionalId || null;
            profissionalNome = usuarioLogado?.nome || 'Administrador';
          } else {
            profissionalId = usuarioLogado?.profissionalId;
            profissionalNome = usuarioLogado?.nome;
          }
        }
      } catch (e) {
        console.warn('Erro ao parsear usuário:', e);
      }

      const isAdminUser = usuarioTipo === 'admin';
      setIsAdmin(isAdminUser);

      // Carregar profissionais
      const profissionaisData = await firebaseService.getAll('profissionais');
      const profissionaisArray = Array.isArray(profissionaisData) ? profissionaisData : [];
      console.log('Profissionais carregados:', profissionaisArray.length);
      setProfissionais(profissionaisArray);

      if (!isAdminUser && !profissionalId) {
        if (profissionaisArray.length > 0) {
          profissionalId = profissionaisArray[0].id;
          profissionalNome = profissionaisArray[0].nome;
        }
      }

      setProfissional({
        id: profissionalId,
        nome: profissionalNome,
        tipo: usuarioTipo
      });

      // Carregar clientes
      const clientesData = await firebaseService.getAll('clientes');
      const clientesArray = Array.isArray(clientesData) ? clientesData : [];
      console.log('Clientes carregados:', clientesArray.length);
      setClientes(clientesArray);

      // Carregar comissões
      await carregarComissoes(isAdminUser ? null : profissionalId);
      
      // Carregar atendimentos (depois de ter clientes e comissões)
      await carregarAtendimentos(isAdminUser ? null : profissionalId);

      // Registrar acesso na auditoria
      await auditoriaService.registrar('acesso_minhas_comissoes', {
        entidade: 'comissoes',
        detalhes: `Acesso à página de comissões - ${isAdminUser ? 'Admin' : 'Profissional'}`,
        dados: {
          profissionalId: profissionalId,
          isAdmin: isAdminUser
        }
      });

      console.log('✅ Dados carregados com sucesso');

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      mostrarSnackbar('Erro ao carregar dados', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'carregar_minhas_comissoes'
      });
    } finally {
      setLoading(false);
    }
  };

  const carregarComissoes = async (profissionalId) => {
    try {
      console.log('📊 Carregando comissões...');
      const comissoesData = await firebaseService.getAll('comissoes');
      const comissoesArray = Array.isArray(comissoesData) ? comissoesData : [];
      console.log('Comissões totais:', comissoesArray.length);
      
      let comissoesFiltradas = comissoesArray;
      
      if (profissionalId) {
        comissoesFiltradas = comissoesArray.filter(c => 
          c && c.profissionalId === profissionalId
        );
        console.log('Comissões filtradas pelo profissional:', comissoesFiltradas.length);
      } else if (isAdmin && filtroProfissional !== 'todos') {
        comissoesFiltradas = comissoesArray.filter(c => 
          c && c.profissionalId === filtroProfissional
        );
      }

      if (filtroMes && filtroAno) {
        comissoesFiltradas = comissoesFiltradas.filter(c => {
          if (!c) return false;
          const dataStr = c.dataRegistro || c.createdAt || c.data;
          if (!dataStr) return false;
          const data = new Date(dataStr);
          return data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno;
        });
        console.log('Comissões após filtro de data:', comissoesFiltradas.length);
      }

      if (filtroStatus !== 'todos') {
        comissoesFiltradas = comissoesFiltradas.filter(c => c && c.status === filtroStatus);
      }

      comissoesFiltradas.sort((a, b) => {
        const dataA = new Date(a?.dataRegistro || a?.createdAt || a?.data || 0);
        const dataB = new Date(b?.dataRegistro || b?.createdAt || b?.data || 0);
        return dataB - dataA;
      });

      comissoesFiltradas = comissoesFiltradas.map(c => ({
        ...c,
        id: c.id,
        data: c.dataRegistro || c.createdAt || c.data,
        dataFormatada: formatDate(c.dataRegistro || c.createdAt || c.data),
        valor: Number(c.valor) || 0,
        valorAtendimento: Number(c.valorAtendimento) || 0,
        percentual: Number(c.percentual) || 0,
        servicoNome: c.servicoNome || 'Serviço',
        status: c.status || 'pendente'
      }));

      console.log('Comissões processadas:', comissoesFiltradas.length);
      setComissoes(comissoesFiltradas);
    } catch (error) {
      console.error('Erro ao carregar comissões:', error);
      setComissoes([]);
    }
  };

  const carregarAtendimentos = async (profissionalId) => {
    try {
      console.log('📊 Carregando atendimentos...');
      const atendimentosData = await firebaseService.getAll('atendimentos');
      const atendimentosArray = Array.isArray(atendimentosData) ? atendimentosData : [];
      console.log('Atendimentos totais:', atendimentosArray.length);
      
      // Filtrar apenas atendimentos finalizados
      let atendimentosFiltrados = atendimentosArray.filter(a => a && a.status === 'finalizado');
      console.log('Atendimentos finalizados:', atendimentosFiltrados.length);
      
      if (profissionalId) {
        atendimentosFiltrados = atendimentosFiltrados.filter(a => {
          const temProfissional = 
            (a.itensServico && a.itensServico.some(item => item && item.profissionalId === profissionalId)) ||
            (a.servicos && a.servicos.some(s => s && s.profissionalId === profissionalId));
          
          return temProfissional;
        });
        console.log('Atendimentos filtrados pelo profissional:', atendimentosFiltrados.length);
      } else if (isAdmin && filtroProfissional !== 'todos') {
        atendimentosFiltrados = atendimentosFiltrados.filter(a => {
          const temProfissional = 
            (a.itensServico && a.itensServico.some(item => item && item.profissionalId === filtroProfissional)) ||
            (a.servicos && a.servicos.some(s => s && s.profissionalId === filtroProfissional));
          
          return temProfissional;
        });
      }

      if (filtroMes && filtroAno) {
        atendimentosFiltrados = atendimentosFiltrados.filter(a => {
          if (!a || !a.data) return false;
          const data = new Date(a.data);
          return data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno;
        });
        console.log('Atendimentos após filtro de data:', atendimentosFiltrados.length);
      }

      // Processar atendimentos com dados do cliente e comissões
      const atendimentosProcessados = atendimentosFiltrados.map(atendimento => {
        // Buscar cliente pelo ID
        const cliente = clientes.find(c => c && c.id === atendimento.clienteId);
        
        // Buscar todas as comissões deste atendimento
        const comissoesDoAtendimento = comissoes.filter(c => 
          c && c.atendimentoId === atendimento.id
        );
        
        // Se for profissional específico, filtrar as comissões dele
        const comissoesDoProfissional = profissionalId 
          ? comissoesDoAtendimento.filter(c => c.profissionalId === profissionalId)
          : comissoesDoAtendimento;
        
        // Calcular comissão total
        const comissaoTotal = comissoesDoProfissional.reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
        
        // Verificar se todas as comissões estão pagas
        const todasPagas = comissoesDoProfissional.length > 0 && 
                          comissoesDoProfissional.every(c => c.status === 'pago');
        
        return {
          ...atendimento,
          cliente: cliente || { nome: 'Cliente não encontrado', foto: null },
          valorTotal: Number(atendimento.valorTotal) || 0,
          comissaoTotal: comissaoTotal,
          comissaoPaga: todasPagas,
          comissoes: comissoesDoProfissional,
          servicos: atendimento.servicos || atendimento.itensServico || []
        };
      });

      // Ordenar por data (mais recentes primeiro)
      atendimentosProcessados.sort((a, b) => new Date(b.data) - new Date(a.data));

      console.log('Atendimentos processados:', atendimentosProcessados.length);
      setAtendimentos(atendimentosProcessados);
    } catch (error) {
      console.error('Erro ao carregar atendimentos:', error);
      setAtendimentos([]);
    }
  };

  const calcularResumo = () => {
    try {
      const totalPeriodo = comissoes
        .filter(c => c && c.status !== 'cancelado')
        .reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
      
      const aReceber = comissoes
        .filter(c => c && c.status === 'pendente')
        .reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
      
      const recebido = comissoes
        .filter(c => c && c.status === 'pago')
        .reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
      
      const cancelado = comissoes
        .filter(c => c && c.status === 'cancelado')
        .reduce((acc, c) => acc + (Number(c.valor) || 0), 0);

      const porServico = {};
      comissoes.forEach(c => {
        if (c && c.status !== 'cancelado' && c.servicoNome) {
          const nome = c.servicoNome;
          if (!porServico[nome]) {
            porServico[nome] = {
              nome,
              quantidade: 0,
              valor: 0
            };
          }
          porServico[nome].quantidade++;
          porServico[nome].valor += Number(c.valor) || 0;
        }
      });

      const porServicoArray = Object.values(porServico)
        .sort((a, b) => b.valor - a.valor);

      setResumo({
        totalPeriodo,
        aReceber,
        recebido,
        cancelado,
        porServico: porServicoArray,
        quantidade: comissoes.length,
        quantidadePendente: comissoes.filter(c => c && c.status === 'pendente').length,
        quantidadePaga: comissoes.filter(c => c && c.status === 'pago').length,
        quantidadeCancelada: comissoes.filter(c => c && c.status === 'cancelado').length,
      });

      console.log('Resumo calculado:', {
        totalPeriodo,
        aReceber,
        recebido,
        quantidade: comissoes.length
      });
    } catch (error) {
      console.error('Erro ao calcular resumo:', error);
    }
  };

  const calcularEstatisticas = () => {
    try {
      const comissoesPagas = comissoes.filter(c => c && c.status === 'pago');
      const mediaPorAtendimento = comissoesPagas.length > 0
        ? comissoesPagas.reduce((acc, c) => acc + (Number(c.valor) || 0), 0) / comissoesPagas.length
        : 0;

      const porMes = [];
      const mesesDados = {};

      comissoes.forEach(c => {
        if (!c) return;
        
        const data = new Date(c.dataRegistro || c.createdAt || c.data || 0);
        const mes = data.getMonth() + 1;
        const ano = data.getFullYear();
        const chave = `${ano}-${mes}`;
        
        if (!mesesDados[chave]) {
          mesesDados[chave] = {
            mes,
            ano,
            quantidade: 0,
            total: 0
          };
        }
        
        if (c.status !== 'cancelado') {
          mesesDados[chave].quantidade++;
          mesesDados[chave].total += Number(c.valor) || 0;
        }
      });

      Object.keys(mesesDados).sort().forEach(chave => {
        porMes.push(mesesDados[chave]);
      });

      setEstatisticas({
        mediaPorAtendimento,
        porMes: porMes.slice(-6)
      });
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
    }
  };

  const renderStatusChip = (status) => {
    switch(status) {
      case 'pago':
        return <Chip icon={<CheckCircleIcon />} label="Pago" size="small" color="success" variant="outlined" />;
      case 'cancelado':
        return <Chip icon={<WarningIcon />} label="Cancelado" size="small" color="error" variant="outlined" />;
      case 'pendente':
      default:
        return <Chip icon={<PendingIcon />} label="Pendente" size="small" color="warning" variant="outlined" />;
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleOpenDetalhes = (item) => {
    setItemSelecionado(item);
    setOpenDetalhesDialog(true);
  };

  const handleCloseDetalhes = () => {
    setOpenDetalhesDialog(false);
    setItemSelecionado(null);
  };

  const handleOpenRelatorio = () => {
    setOpenRelatorioDialog(true);
  };

  const handleCloseRelatorio = () => {
    setOpenRelatorioDialog(false);
  };

  const handleExportOptionChange = (event) => {
    const { name, value, checked, type } = event.target;
    setExportOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Função manual de impressão direta
  const handlePrint = () => {
    try {
      mostrarSnackbar('Preparando impressão...', 'info');
      
      // Criar uma nova janela para impressão
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        mostrarSnackbar('Pop-up bloqueado. Permita pop-ups para imprimir.', 'error');
        return;
      }
      
      // Obter o conteúdo do relatório
      const content = relatorioRef.current;
      if (!content) {
        mostrarSnackbar('Conteúdo não disponível para impressão', 'error');
        return;
      }
      
      // Clonar o conteúdo para não afetar o original
      const contentClone = content.cloneNode(true);
      
      // Coletar estilos da página
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
      let stylesHTML = '';
      styles.forEach(style => {
        if (style.tagName === 'STYLE') {
          stylesHTML += style.outerHTML;
        } else if (style.tagName === 'LINK') {
          stylesHTML += style.outerHTML;
        }
      });
      
      // Criar o HTML para impressão com formatação otimizada
      const printHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Relatório de Comissões - ${configuracoes?.salao?.nomeFantasia || 'Salão'}</title>
            ${stylesHTML}
            <style>
              @page {
                size: A4;
                margin: 2cm;
              }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0;
                padding: 20px;
                background: white;
              }
              @media print {
                body { 
                  margin: 0; 
                  padding: 0;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .MuiPaper-root {
                  box-shadow: none !important;
                }
                table {
                  page-break-inside: avoid;
                }
                tr {
                  page-break-inside: avoid;
                  page-break-after: auto;
                }
                thead {
                  display: table-header-group;
                }
                tfoot {
                  display: table-footer-group;
                }
              }
            </style>
          </head>
          <body>
            ${contentClone.outerHTML}
          </body>
        </html>
      `;
      
      // Escrever o conteúdo na nova janela
      printWindow.document.write(printHTML);
      printWindow.document.close();
      
      // Aguardar carregamento dos recursos e imprimir
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          mostrarSnackbar('Impressão enviada!', 'success');
        }, 500);
      };

      // Registrar na auditoria
      auditoriaService.registrar('imprimir_relatorio_comissoes', {
        entidade: 'comissoes',
        detalhes: 'Impressão de relatório de comissões',
        dados: {
          periodo: `${meses.find(m => m.value === filtroMes)?.label} / ${filtroAno}`,
          profissional: profissional?.nome || 'Todos',
          totalComissoes: comissoesFiltradas.length
        }
      });
      
    } catch (error) {
      console.error('Erro na impressão:', error);
      mostrarSnackbar('Erro ao imprimir', 'error');
      
      auditoriaService.registrarErro(error, { 
        acao: 'imprimir_relatorio_comissoes'
      });
    }
  };

  const handleExportPDF = async () => {
    try {
      mostrarSnackbar('Gerando PDF...', 'info');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Título com logo (simulado)
      doc.setFontSize(20);
      doc.setTextColor(156, 39, 176);
      doc.text(configuracoes?.salao?.nomeFantasia || 'Relatório de Comissões', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Relatório de Comissões', pageWidth / 2, 30, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      
      // Nome do profissional correto
      let nomeProfissional = profissional?.nome || 'Todos os Profissionais';
      if (isAdmin && filtroProfissional !== 'todos') {
        const profSelecionado = profissionais.find(p => p.id === filtroProfissional);
        if (profSelecionado) {
          nomeProfissional = profSelecionado.nome;
        }
      } else if (isAdmin && filtroProfissional === 'todos') {
        nomeProfissional = 'Todos os Profissionais';
      }
      
      doc.text(`Profissional: ${nomeProfissional}`, pageWidth / 2, 40, { align: 'center' });
      
      const periodo = `${meses.find(m => m.value === filtroMes)?.label} / ${filtroAno}`;
      doc.setFontSize(10);
      doc.text(`Período: ${periodo}`, pageWidth / 2, 48, { align: 'center' });
      doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 56, { align: 'center' });
      
      let yPos = 65;
      
      if (exportOptions.incluirResumo && resumo) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Resumo do Período', 14, yPos);
        yPos += 8;
        
        const resumoData = [
          ['Total de Comissões', formatarMoeda(resumo.totalPeriodo)],
          ['A Receber', formatarMoeda(resumo.aReceber)],
          ['Recebido', formatarMoeda(resumo.recebido)],
          ['Total de Comissões', resumo.quantidade.toString()],
          ['Comissões Pagas', resumo.quantidadePaga.toString()],
          ['Comissões Pendentes', resumo.quantidadePendente.toString()],
        ];
        
        autoTable(doc, {
          startY: yPos,
          head: [['Descrição', 'Valor']],
          body: resumoData,
          theme: 'striped',
          headStyles: { fillColor: [156, 39, 176] },
          margin: { left: 14, right: 14 },
        });
        
        yPos = doc.lastAutoTable.finalY + 10;
      }
      
      if (exportOptions.incluirAtendimentos && atendimentosFiltrados.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Atendimentos no Período', 14, yPos);
        yPos += 8;
        
        const atendimentosData = atendimentosFiltrados.slice(0, 20).map(a => [
          formatDate(a.data),
          a.cliente?.nome || '—',
          (a.servicos?.map(s => s.nome).join(', ') || '—').substring(0, 30),
          formatarMoeda(a.valorTotal),
          formatarMoeda(a.comissaoTotal),
          a.comissaoPaga ? 'Pago' : 'Pendente'
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['Data', 'Cliente', 'Serviços', 'Valor', 'Comissão', 'Status']],
          body: atendimentosData,
          theme: 'striped',
          headStyles: { fillColor: [156, 39, 176] },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 8 },
        });
        
        yPos = doc.lastAutoTable.finalY + 10;
      }
      
      if (exportOptions.incluirComissoes && comissoesFiltradas.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Detalhamento das Comissões', 14, yPos);
        yPos += 8;
        
        const comissoesData = comissoesFiltradas.slice(0, 20).map(c => [
          formatDate(c.data),
          c.servicoNome,
          `${c.percentual}%`,
          formatarMoeda(c.valorAtendimento),
          formatarMoeda(c.valor),
          c.status,
          c.dataPagamento ? formatDate(c.dataPagamento) : '—'
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['Data', 'Serviço', '%', 'Valor Base', 'Comissão', 'Status', 'Pagamento']],
          body: comissoesData,
          theme: 'striped',
          headStyles: { fillColor: [156, 39, 176] },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 8 },
        });
      }
      
      const fileName = `comissoes_${periodo.replace('/', '_')}_${new Date().getTime()}.pdf`;
      doc.save(fileName);

      await auditoriaService.registrar('exportar_pdf_comissoes', {
        entidade: 'comissoes',
        detalhes: 'Exportação de relatório de comissões em PDF',
        dados: {
          periodo,
          profissional: nomeProfissional,
          totalComissoes: comissoesFiltradas.length
        }
      });
      
      mostrarSnackbar('PDF gerado com sucesso!', 'success');
      handleCloseRelatorio();
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      mostrarSnackbar('Erro ao gerar PDF', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'exportar_pdf_comissoes'
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      mostrarSnackbar('Gerando planilha...', 'info');
      
      const wb = XLSX.utils.book_new();
      const periodo = `${meses.find(m => m.value === filtroMes)?.label} ${filtroAno}`;
      
      // Nome do profissional correto
      let nomeProfissional = profissional?.nome || 'Todos os Profissionais';
      if (isAdmin && filtroProfissional !== 'todos') {
        const profSelecionado = profissionais.find(p => p.id === filtroProfissional);
        if (profSelecionado) {
          nomeProfissional = profSelecionado.nome;
        }
      } else if (isAdmin && filtroProfissional === 'todos') {
        nomeProfissional = 'Todos os Profissionais';
      }
      
      if (exportOptions.incluirResumo && resumo) {
        const resumoData = [
          ['Resumo do Período'],
          [''],
          ['Descrição', 'Valor'],
          ['Total de Comissões', formatarMoeda(resumo.totalPeriodo)],
          ['A Receber', formatarMoeda(resumo.aReceber)],
          ['Recebido', formatarMoeda(resumo.recebido)],
          [''],
          ['Estatísticas'],
          ['Total de Comissões', resumo.quantidade],
          ['Comissões Pagas', resumo.quantidadePaga],
          ['Comissões Pendentes', resumo.quantidadePendente],
          ['Comissões Canceladas', resumo.quantidadeCancelada || 0],
          ['Total de Atendimentos', atendimentosFiltrados.length],
        ];
        
        const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
        XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');
      }
      
      if (exportOptions.incluirAtendimentos && atendimentosFiltrados.length > 0) {
        const atendimentosData = [
          ['Data', 'Hora', 'Cliente', 'Serviços', 'Valor Total', 'Comissão Total', 'Status'],
          ...atendimentosFiltrados.map(a => [
            formatDate(a.data),
            a.horaInicio || '--:--',
            a.cliente?.nome || '—',
            a.servicos?.map(s => s.nome).join(', ') || '—',
            a.valorTotal,
            a.comissaoTotal,
            a.comissaoPaga ? 'Pago' : 'Pendente'
          ])
        ];
        
        const wsAtendimentos = XLSX.utils.aoa_to_sheet(atendimentosData);
        XLSX.utils.book_append_sheet(wb, wsAtendimentos, 'Atendimentos');
      }
      
      if (exportOptions.incluirComissoes && comissoesFiltradas.length > 0) {
        const comissoesData = [
          ['Data', 'Serviço', 'Percentual', 'Valor Base', 'Comissão', 'Status', 'Data Pagamento'],
          ...comissoesFiltradas.map(c => [
            formatDate(c.data),
            c.servicoNome,
            c.percentual,
            c.valorAtendimento,
            c.valor,
            c.status,
            c.dataPagamento ? formatDate(c.dataPagamento) : ''
          ])
        ];
        
        const wsComissoes = XLSX.utils.aoa_to_sheet(comissoesData);
        XLSX.utils.book_append_sheet(wb, wsComissoes, 'Comissões');
      }
      
      if (exportOptions.incluirServicos && resumo?.porServico && resumo.porServico.length > 0) {
        const servicosData = [
          ['Serviço', 'Quantidade', 'Total', '% do Total'],
          ...resumo.porServico.map(item => [
            item.nome,
            item.quantidade,
            item.valor,
            ((item.valor / resumo.totalPeriodo) * 100).toFixed(1)
          ])
        ];
        
        const wsServicos = XLSX.utils.aoa_to_sheet(servicosData);
        XLSX.utils.book_append_sheet(wb, wsServicos, 'Resumo por Serviço');
      }
      
      const infoData = [
        ['Informações do Relatório'],
        [''],
        ['Profissional', nomeProfissional],
        ['Período', periodo],
        ['Data de Emissão', new Date().toLocaleString('pt-BR')],
        ['Status', filtroStatus !== 'todos' ? filtroStatus : 'Todos'],
      ];
      
      const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
      XLSX.utils.book_append_sheet(wb, wsInfo, 'Informações');
      
      const fileName = `comissoes_${periodo.replace('/', '_')}_${new Date().getTime()}.xlsx`;
      XLSX.writeFile(wb, fileName);

      await auditoriaService.registrar('exportar_excel_comissoes', {
        entidade: 'comissoes',
        detalhes: 'Exportação de relatório de comissões em Excel',
        dados: {
          periodo,
          profissional: nomeProfissional,
          totalComissoes: comissoesFiltradas.length
        }
      });
      
      mostrarSnackbar('Planilha gerada com sucesso!', 'success');
      handleCloseRelatorio();
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      mostrarSnackbar('Erro ao gerar planilha', 'error');
      
      await auditoriaService.registrarErro(error, { 
        acao: 'exportar_excel_comissoes'
      });
    }
  };

  const comissoesFiltradas = useMemo(() => {
    return comissoes.filter(c => {
      if (!filtroBusca || !c) return true;
      
      const termo = filtroBusca.toLowerCase();
      return (
        (c.servicoNome && c.servicoNome.toLowerCase().includes(termo)) ||
        (c.profissionalNome && c.profissionalNome.toLowerCase().includes(termo)) ||
        (c.atendimentoId && c.atendimentoId.toLowerCase().includes(termo))
      );
    });
  }, [comissoes, filtroBusca]);

  const atendimentosFiltrados = useMemo(() => {
    return atendimentos.filter(a => {
      if (!filtroBusca || !a) return true;
      
      const termo = filtroBusca.toLowerCase();
      return (
        (a.cliente?.nome && a.cliente.nome.toLowerCase().includes(termo)) ||
        (a.servicos && a.servicos.some(s => s && s.nome && s.nome.toLowerCase().includes(termo)))
      );
    });
  }, [atendimentos, filtroBusca]);

  // Paginação
  const paginatedComissoes = comissoesFiltradas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const paginatedAtendimentos = atendimentosFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
        
        <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>

        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2, mb: 2 }} />
        
        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2, mb: 2 }} />
        
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={isMobile ? 120 : 60} sx={{ borderRadius: 2, mb: 2 }} />
        ))}
      </Box>
    );
  }

  if (!profissional && !isAdmin) {
    return (
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Alert severity="warning">
          Você não está vinculado a um perfil de profissional.
          Entre em contato com o administrador.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 3,
      pb: isMobile ? 10 : 3,
      minHeight: '100vh',
      bgcolor: '#f5f5f5'
    }}>
      {/* Cabeçalho Mobile */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3
      }}>
        <Box>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            sx={{ 
              fontWeight: 700, 
              color: '#9c27b0',
              fontSize: isMobile ? '1.5rem' : '2.125rem'
            }}
          >
            {isAdmin ? 'Comissões' : 'Minhas Comissões'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {isAdmin && filtroProfissional !== 'todos' 
              ? profissionais.find(p => p.id === filtroProfissional)?.nome 
              : profissional?.nome || 'Carregando...'}
          </Typography>
        </Box>
        
        <Zoom in={true}>
          <Fab
            size="small"
            onClick={handleOpenRelatorio}
            sx={{ 
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#388e3c' },
            }}
          >
            <PrintIcon />
          </Fab>
        </Zoom>
      </Box>

      {/* Cards de Resumo Mobile */}
      {resumo && (
        <Grid container spacing={1.5} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: '#9c27b0', width: 32, height: 32 }}>
                      <AttachMoneyIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Total
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#4caf50', fontSize: '0.9rem' }}>
                        {formatarMoeda(resumo.totalPeriodo)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: '#ff9800', width: 32, height: 32 }}>
                      <PendingIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        A Receber
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ff9800', fontSize: '0.9rem' }}>
                        {formatarMoeda(resumo.aReceber)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: '#4caf50', width: 32, height: 32 }}>
                      <CheckCircleIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Recebido
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#4caf50', fontSize: '0.9rem' }}>
                        {formatarMoeda(resumo.recebido)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: '#2196f3', width: 32, height: 32 }}>
                      <TimelineIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Média
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2196f3', fontSize: '0.9rem' }}>
                        {formatarMoeda(estatisticas?.mediaPorAtendimento || 0)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      )}

      {/* Barra de Pesquisa e Filtros */}
      <Paper
        elevation={0}
        sx={{
          p: 0.5,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar..."
          value={filtroBusca}
          onChange={(e) => setFiltroBusca(e.target.value)}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', ml: 1 }} />
              </InputAdornment>
            ),
            endAdornment: filtroBusca && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setFiltroBusca('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ ml: 1 }}
        />
        
        <IconButton 
          onClick={() => setOpenFilterDrawer(true)}
          sx={{ 
            mx: 1,
            color: filtroMes !== new Date().getMonth() + 1 || 
                   filtroAno !== new Date().getFullYear() || 
                   filtroStatus !== 'todos' || 
                   (isAdmin && filtroProfissional !== 'todos') ? '#9c27b0' : 'text.secondary'
          }}
        >
          <Badge 
            variant="dot" 
            color="primary"
            invisible={filtroMes === new Date().getMonth() + 1 && 
                       filtroAno === new Date().getFullYear() && 
                       filtroStatus === 'todos' && 
                       (!isAdmin || filtroProfissional === 'todos')}
          >
            <FilterListIcon />
          </Badge>
        </IconButton>

        <IconButton onClick={() => {
          setFiltroBusca('');
          setFiltroMes(new Date().getMonth() + 1);
          setFiltroAno(new Date().getFullYear());
          setFiltroStatus('todos');
          if (isAdmin) setFiltroProfissional('todos');
          carregarDados();
        }} sx={{ color: 'text.secondary' }}>
          <RefreshIcon />
        </IconButton>
      </Paper>

      {/* Tabs Mobile */}
      <Paper sx={{ mb: 2, borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 48,
              fontSize: isMobile ? '0.7rem' : '0.875rem',
            }
          }}
        >
          <Tab 
            icon={<PercentIcon sx={{ fontSize: isMobile ? 18 : 24 }} />} 
            label="Comissões" 
            iconPosition="start"
          />
          <Tab 
            icon={
              <Badge badgeContent={atendimentos.length} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}>
                <EventIcon sx={{ fontSize: isMobile ? 18 : 24 }} />
              </Badge>
            } 
            label="Atendimentos" 
            iconPosition="start"
          />
          <Tab 
            icon={<PieChartIcon sx={{ fontSize: isMobile ? 18 : 24 }} />} 
            label="Serviços" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Conteúdo das Tabs */}
      <AnimatePresence mode="wait">
        {/* Tab Comissões */}
        {tabValue === 0 && (
          <motion.div
            key="comissoes"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {paginatedComissoes.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <ReceiptIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="body1" color="textSecondary">
                  Nenhuma comissão encontrada
                </Typography>
              </Paper>
            ) : (
              paginatedComissoes.map((comissao) => (
                <ComissaoMobileCard
                  key={comissao.id}
                  comissao={comissao}
                  isAdmin={isAdmin}
                  onDetalhes={handleOpenDetalhes}
                />
              ))
            )}
          </motion.div>
        )}

        {/* Tab Atendimentos */}
        {tabValue === 1 && (
          <motion.div
            key="atendimentos"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {paginatedAtendimentos.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <EventIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="body1" color="textSecondary">
                  Nenhum atendimento encontrado
                </Typography>
              </Paper>
            ) : (
              paginatedAtendimentos.map((atendimento) => (
                <AtendimentoMobileCard
                  key={atendimento.id}
                  atendimento={atendimento}
                  onDetalhes={handleOpenDetalhes}
                />
              ))
            )}
          </motion.div>
        )}

        {/* Tab Resumo por Serviço */}
        {tabValue === 2 && resumo?.porServico && (
          <motion.div
            key="servicos"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Comissões por Serviço
                </Typography>
                
                {resumo.porServico.map((item, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{item.nome}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                        {formatarMoeda(item.valor)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {item.quantidade} atendimento(s)
                      </Typography>
                      <Chip
                        label={`${((item.valor / resumo.totalPeriodo) * 100).toFixed(1)}%`}
                        size="small"
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(item.valor / resumo.totalPeriodo) * 100}
                      sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paginação */}
      {((tabValue === 0 && comissoesFiltradas.length > rowsPerPage) ||
        (tabValue === 1 && atendimentosFiltrados.length > rowsPerPage)) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(
                (tabValue === 0 ? comissoesFiltradas.length : atendimentosFiltrados.length) / rowsPerPage
              )}
              page={page + 1}
              onChange={(e, v) => setPage(v - 1)}
              color="primary"
              size={isMobile ? "small" : "large"}
            />
          </Stack>
        </Box>
      )}

      {/* Drawer de Filtros */}
      <SwipeableDrawer
        anchor="bottom"
        open={openFilterDrawer}
        onClose={() => setOpenFilterDrawer(false)}
        onOpen={() => setOpenFilterDrawer(true)}
        disableSwipeToOpen={false}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '80vh',
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filtros
            </Typography>
            <IconButton onClick={() => setOpenFilterDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
            Período
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Mês</InputLabel>
                <Select
                  value={filtroMes}
                  label="Mês"
                  onChange={(e) => setFiltroMes(e.target.value)}
                >
                  {meses.map(mes => (
                    <MenuItem key={mes.value} value={mes.value}>
                      {mes.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Ano</InputLabel>
                <Select
                  value={filtroAno}
                  label="Ano"
                  onChange={(e) => setFiltroAno(e.target.value)}
                >
                  {anos.map(ano => (
                    <MenuItem key={ano} value={ano}>
                      {ano}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
            Status
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
            <Button
              fullWidth
              variant={filtroStatus === 'todos' ? 'contained' : 'outlined'}
              onClick={() => setFiltroStatus('todos')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Todos
            </Button>
            <Button
              fullWidth
              variant={filtroStatus === 'pendente' ? 'contained' : 'outlined'}
              onClick={() => setFiltroStatus('pendente')}
              sx={{ 
                justifyContent: 'flex-start',
                color: filtroStatus === 'pendente' ? 'white' : '#ff9800',
                borderColor: '#ff9800',
                bgcolor: filtroStatus === 'pendente' ? '#ff9800' : 'transparent',
              }}
            >
              <PendingIcon sx={{ mr: 1, fontSize: 18 }} />
              Pendente
            </Button>
            <Button
              fullWidth
              variant={filtroStatus === 'pago' ? 'contained' : 'outlined'}
              onClick={() => setFiltroStatus('pago')}
              sx={{ 
                justifyContent: 'flex-start',
                color: filtroStatus === 'pago' ? 'white' : '#4caf50',
                borderColor: '#4caf50',
                bgcolor: filtroStatus === 'pago' ? '#4caf50' : 'transparent',
              }}
            >
              <CheckCircleIcon sx={{ mr: 1, fontSize: 18 }} />
              Pago
            </Button>
            <Button
              fullWidth
              variant={filtroStatus === 'cancelado' ? 'contained' : 'outlined'}
              onClick={() => setFiltroStatus('cancelado')}
              sx={{ 
                justifyContent: 'flex-start',
                color: filtroStatus === 'cancelado' ? 'white' : '#f44336',
                borderColor: '#f44336',
                bgcolor: filtroStatus === 'cancelado' ? '#f44336' : 'transparent',
              }}
            >
              <WarningIcon sx={{ mr: 1, fontSize: 18 }} />
              Cancelado
            </Button>
          </Box>

          {isAdmin && (
            <>
              <Typography variant="subtitle2" gutterBottom sx={{ color: '#9c27b0' }}>
                Profissional
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3, maxHeight: 150, overflow: 'auto' }}>
                <Button
                  fullWidth
                  variant={filtroProfissional === 'todos' ? 'contained' : 'outlined'}
                  onClick={() => setFiltroProfissional('todos')}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Todos os profissionais
                </Button>
                {profissionais.map(prof => (
                  <Button
                    key={prof.id}
                    fullWidth
                    variant={filtroProfissional === prof.id ? 'contained' : 'outlined'}
                    onClick={() => setFiltroProfissional(prof.id)}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    <PersonIcon sx={{ mr: 1, fontSize: 18 }} />
                    {prof.nome}
                  </Button>
                ))}
              </Box>
            </>
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={() => setOpenFilterDrawer(false)}
            sx={{ bgcolor: '#9c27b0', mt: 2 }}
          >
            Aplicar Filtros
          </Button>
        </Box>
      </SwipeableDrawer>

      {/* Dialog de Detalhes */}
      <Dialog 
        open={openDetalhesDialog} 
        onClose={handleCloseDetalhes}
        fullScreen={isMobile}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: '#9c27b0', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: isMobile ? 2 : 3,
        }}>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={handleCloseDetalhes}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant={isMobile ? "subtitle1" : "h6"}>
            {itemSelecionado?.tipo === 'comissao' ? 'Detalhes da Comissão' : 'Detalhes do Atendimento'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          {itemSelecionado && itemSelecionado.tipo === 'comissao' ? (
            // Detalhes da Comissão
            <Box>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" sx={{ color: '#9c27b0', mb: 2 }}>
                  {itemSelecionado.servicoNome}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Data</Typography>
                    <Typography variant="body2">{formatDate(itemSelecionado.data)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Profissional</Typography>
                    <Typography variant="body2">{itemSelecionado.profissionalNome || '—'}</Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Valor Base</Typography>
                    <Typography variant="body2">{formatarMoeda(itemSelecionado.valorAtendimento)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Percentual</Typography>
                    <Typography variant="body2">{itemSelecionado.percentual}%</Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Comissão</Typography>
                    <Typography variant="h5" sx={{ color: '#4caf50' }}>
                      {formatarMoeda(itemSelecionado.valor)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Status</Typography>
                    <Chip
                      label={itemSelecionado.status}
                      color={itemSelecionado.status === 'pago' ? 'success' : 'warning'}
                    />
                  </Grid>
                  
                  {itemSelecionado.dataPagamento && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary">Data de Pagamento</Typography>
                      <Typography variant="body2">{formatDate(itemSelecionado.dataPagamento)}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Box>
          ) : itemSelecionado ? (
            // Detalhes do Atendimento
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar 
                        src={itemSelecionado.cliente?.foto}
                        sx={{ width: 48, height: 48, bgcolor: '#9c27b0' }}
                      >
                        {!itemSelecionado.cliente?.foto && 
                         (itemSelecionado.cliente?.nome?.charAt(0) || 'C')}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{itemSelecionado.cliente?.nome || 'Cliente'}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(itemSelecionado.data)} {itemSelecionado.horaInicio ? `às ${itemSelecionado.horaInicio}` : ''}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" gutterBottom>
                      Serviços Realizados
                    </Typography>
                    
                    {(itemSelecionado.servicos || itemSelecionado.itensServico || []).map((servico, idx) => {
                      const comissaoServico = itemSelecionado.comissoes?.find(c => 
                        c.servicoId === (servico.servicoId || servico.id)
                      );
                      
                      return (
                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{servico.nome}</Typography>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                              {formatarMoeda(comissaoServico?.valor || 0)}
                            </Typography>
                            {comissaoServico && (
                              <Chip
                                size="small"
                                label={comissaoServico.status}
                                color={comissaoServico.status === 'pago' ? 'success' : 'warning'}
                                sx={{ height: 20, fontSize: '0.65rem' }}
                              />
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="textSecondary">Total</Typography>
                        <Typography variant="h6" color="primary">
                          {formatarMoeda(itemSelecionado.valorTotal)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="textSecondary">Sua Comissão</Typography>
                        <Typography variant="h6" color="#4caf50">
                          {formatarMoeda(itemSelecionado.comissaoTotal)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="textSecondary">Status</Typography>
                        <Chip
                          size="small"
                          label={itemSelecionado.comissaoPaga ? 'Pago' : 'Pendente'}
                          color={itemSelecionado.comissaoPaga ? 'success' : 'warning'}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button onClick={handleCloseDetalhes} fullWidth={isMobile}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Exportação */}
      <Dialog 
        open={openRelatorioDialog} 
        onClose={handleCloseRelatorio}
        fullScreen={isMobile}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DownloadIcon />
            <Typography variant="h6">Exportar Relatório</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Opções de Exportação
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PictureAsPdfIcon color="error" /> PDF
                  </Typography>
                  <Typography variant="caption" color="textSecondary" gutterBottom display="block">
                    Exportar como documento PDF
                  </Typography>
                  
                  <FormControl component="fieldset" sx={{ mt: 1 }}>
                    <FormLabel component="legend" sx={{ fontSize: '0.8rem' }}>Incluir:</FormLabel>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={exportOptions.incluirResumo}
                          onChange={handleExportOptionChange}
                          name="incluirResumo"
                          size="small"
                        />
                      }
                      label={<Typography variant="caption">Resumo</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={exportOptions.incluirAtendimentos}
                          onChange={handleExportOptionChange}
                          name="incluirAtendimentos"
                          size="small"
                        />
                      }
                      label={<Typography variant="caption">Atendimentos</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={exportOptions.incluirComissoes}
                          onChange={handleExportOptionChange}
                          name="incluirComissoes"
                          size="small"
                        />
                      }
                      label={<Typography variant="caption">Comissões</Typography>}
                    />
                  </FormControl>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={handleExportPDF}
                    sx={{ mt: 2 }}
                    disabled={!exportOptions.incluirResumo && !exportOptions.incluirAtendimentos && !exportOptions.incluirComissoes}
                  >
                    Gerar PDF
                  </Button>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TableChartIcon color="success" /> Excel
                  </Typography>
                  <Typography variant="caption" color="textSecondary" gutterBottom display="block">
                    Exportar como planilha Excel
                  </Typography>
                  
                  <FormControl component="fieldset" sx={{ mt: 1 }}>
                    <FormLabel component="legend" sx={{ fontSize: '0.8rem' }}>Incluir:</FormLabel>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={exportOptions.incluirResumo}
                          onChange={handleExportOptionChange}
                          name="incluirResumo"
                          size="small"
                        />
                      }
                      label={<Typography variant="caption">Resumo</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={exportOptions.incluirAtendimentos}
                          onChange={handleExportOptionChange}
                          name="incluirAtendimentos"
                          size="small"
                        />
                      }
                      label={<Typography variant="caption">Atendimentos</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={exportOptions.incluirComissoes}
                          onChange={handleExportOptionChange}
                          name="incluirComissoes"
                          size="small"
                        />
                      }
                      label={<Typography variant="caption">Comissões</Typography>}
                    />
                  </FormControl>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<TableChartIcon />}
                    onClick={handleExportExcel}
                    sx={{ mt: 2 }}
                    disabled={!exportOptions.incluirResumo && !exportOptions.incluirAtendimentos && !exportOptions.incluirComissoes}
                  >
                    Gerar Excel
                  </Button>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PrintIcon /> Impressão
                  </Typography>
                  <Typography variant="caption" color="textSecondary" gutterBottom display="block">
                    Imprimir relatório diretamente
                  </Typography>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<PrintIcon />}
                    onClick={() => {
                      handleCloseRelatorio();
                      handlePrint();
                    }}
                  >
                    Imprimir Agora
                  </Button>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Alert severity="info">
                <Typography variant="caption" display="block">
                  Período: {meses.find(m => m.value === filtroMes)?.label} / {filtroAno}
                </Typography>
                <Typography variant="caption" display="block">
                  Profissional: {isAdmin && filtroProfissional !== 'todos' 
                    ? profissionais.find(p => p.id === filtroProfissional)?.nome 
                    : (profissional?.nome || 'Todos')}
                </Typography>
                <Typography variant="caption" display="block">
                  Total de comissões: {comissoesFiltradas.length}
                </Typography>
                <Typography variant="caption" display="block">
                  Total de atendimentos: {atendimentosFiltrados.length}
                </Typography>
              </Alert>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRelatorio}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Componente oculto para impressão */}
      <Box sx={{ display: 'none' }}>
        <RelatorioComissoes
          ref={relatorioRef}
          dados={{
            resumo: resumo || { totalPeriodo: 0, aReceber: 0, recebido: 0, quantidade: 0, quantidadePaga: 0, quantidadePendente: 0, quantidadeCancelada: 0, porServico: [] },
            comissoes: comissoesFiltradas,
            atendimentos: atendimentosFiltrados
          }}
          profissional={profissional}
          periodo={`${meses.find(m => m.value === filtroMes)?.label} / ${filtroAno}`}
          filtros={{ 
            mes: filtroMes, 
            ano: filtroAno, 
            status: filtroStatus,
            profissionalId: filtroProfissional,
            profissionalNome: isAdmin && filtroProfissional !== 'todos' 
              ? profissionais.find(p => p.id === filtroProfissional)?.nome 
              : null
          }}
          configuracoes={configuracoes}
          isAdmin={isAdmin}
          tipo="completo"
        />
      </Box>

      {/* Bottom Navigation Mobile */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: 1000,
          }}
          elevation={3}
        >
          <BottomNavigation
            value={bottomNavValue}
            onChange={(event, newValue) => {
              setBottomNavValue(newValue);
              switch(newValue) {
                case 0:
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  break;
                case 1:
                  setOpenFilterDrawer(true);
                  break;
                case 2:
                  handleOpenRelatorio();
                  break;
                default:
                  break;
              }
            }}
            showLabels
            sx={{
              '& .MuiBottomNavigationAction-root.Mui-selected': {
                color: '#9c27b0',
              },
            }}
          >
            <BottomNavigationAction label="Início" icon={<AttachMoneyIcon />} />
            <BottomNavigationAction 
              label="Filtros" 
              icon={
                <Badge 
                  variant="dot" 
                  color="primary"
                  invisible={filtroMes === new Date().getMonth() + 1 && 
                             filtroAno === new Date().getFullYear() && 
                             filtroStatus === 'todos' && 
                             (!isAdmin || filtroProfissional === 'todos')}
                >
                  <FilterListIcon />
                </Badge>
              } 
            />
            <BottomNavigationAction label="Exportar" icon={<DownloadIcon />} />
          </BottomNavigation>
        </Paper>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ 
          vertical: isMobile ? 'top' : 'bottom', 
          horizontal: 'center' 
        }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default MinhasComissoes;
