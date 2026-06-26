// src/pages/PromocaoVisualizar.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  Avatar,
  Paper,
  IconButton,
  Snackbar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  LocalOffer as LocalOfferIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  WhatsApp as WhatsAppIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  QrCode as QrCodeIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Email as EmailIcon, // <- ADICIONADO  
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { format, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

function PromocaoVisualizar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campanha, setCampanha] = useState(null);
  const [cupom, setCupom] = useState(null);
  const [configSalao, setConfigSalao] = useState({});
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [copiando, setCopiando] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [emailCliente, setEmailCliente] = useState('');
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [openQrDialog, setOpenQrDialog] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Buscar campanha
      const campanhaData = await firebaseService.getById('campanhas', id);
      
      if (!campanhaData) {
        toast.error('Promoção não encontrada');
        navigate('/');
        return;
      }
      
      setCampanha(campanhaData);
      
      // Buscar cupom associado se houver
      if (campanhaData.cuponsAssociados && campanhaData.cuponsAssociados.length > 0) {
        const cupomId = campanhaData.cuponsAssociados[0];
        const cupomData = await firebaseService.getById('cupons', cupomId);
        setCupom(cupomData);
      }
      
      // Buscar configurações do salão
      const configs = await firebaseService.getAll('configuracoes');
      if (configs && configs.length > 0) {
        setConfigSalao(configs[0].salao || {});
      }
      
    } catch (error) {
      console.error('Erro ao carregar promoção:', error);
      toast.error('Erro ao carregar promoção');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return '';
    return format(new Date(data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatarHora = (hora) => {
    if (!hora) return '';
    return hora.substring(0, 5);
  };

  const verificarValidade = () => {
    if (!campanha) return false;
    
    const hoje = new Date();
    const dataInicio = new Date(campanha.dataInicio);
    const dataFim = campanha.dataFim ? new Date(campanha.dataFim) : null;
    
    if (isBefore(hoje, dataInicio)) return false;
    if (dataFim && isAfter(hoje, dataFim)) return false;
    
    return true;
  };

  const handleCompartilhar = () => {
    setOpenShareDialog(true);
  };

  const copiarLink = async () => {
    setCopiando(true);
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast.error('Erro ao copiar link');
    } finally {
      setCopiando(false);
      setOpenShareDialog(false);
    }
  };

  const compartilharWhatsApp = () => {
    const texto = `🎉 ${campanha.nome} - ${campanha.descricao?.substring(0, 100)} Acesse: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
  };

  const compartilharFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const compartilharTwitter = () => {
    const texto = `🎉 ${campanha.nome}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const enviarPorEmail = async () => {
    if (!emailCliente) {
      setSnackbar({ open: true, message: 'Digite um e-mail válido', severity: 'error' });
      return;
    }
    
    setEnviandoEmail(true);
    try {
      // Aqui você pode implementar o envio de e-mail
      // Por enquanto, apenas simulamos
      setTimeout(() => {
        setSnackbar({ open: true, message: `Promoção enviada para ${emailCliente}!`, severity: 'success' });
        setOpenEmailDialog(false);
        setEmailCliente('');
      }, 1000);
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      setSnackbar({ open: true, message: 'Erro ao enviar e-mail', severity: 'error' });
    } finally {
      setEnviandoEmail(false);
    }
  };

  const gerarQrCode = () => {
    setOpenQrDialog(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#9c27b0' }} />
      </Box>
    );
  }

  if (!campanha) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">
          Promoção não encontrada
        </Alert>
      </Container>
    );
  }

  const valida = verificarValidade();
  const dataInicio = new Date(campanha.dataInicio);
  const dataFim = campanha.dataFim ? new Date(campanha.dataFim) : null;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header com logo */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        {configSalao.logo && (
          <Avatar
            src={configSalao.logo}
            sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
          />
        )}
        <Typography variant="h5" color="textSecondary">
          {configSalao.nome || 'Meu Salão'}
        </Typography>
      </Box>

      {/* Card da Promoção */}
      <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: 3 }}>
        {(campanha.capaImagem || campanha.imagemCapa) && (
          <Box
            component="img"
            src={campanha.capaImagem || campanha.imagemCapa}
            alt={campanha.nome || 'Capa da promoção'}
            sx={{ width: '100%', maxHeight: { xs: 220, sm: 320 }, objectFit: 'cover', display: 'block' }}
          />
        )}
        {/* Header colorido */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #9c27b0 0%, #ff4081 100%)',
            color: 'white',
            p: 4,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {campanha.nome}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {campanha.descricao}
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {/* Status da promoção */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            {!valida && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {isBefore(new Date(), dataInicio) 
                  ? `📅 Promoção começa em ${formatarData(dataInicio)}`
                  : `⏰ Promoção encerrada em ${formatarData(dataFim)}`}
              </Alert>
            )}
            
            {valida && (
              <Chip
                icon={<CheckIcon />}
                label="Válida"
                sx={{ bgcolor: '#4caf50', color: 'white', fontWeight: 600 }}
              />
            )}
          </Box>

          {/* Benefícios */}
          {campanha.beneficios && campanha.beneficios.length > 0 && (
            <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: '#faf5ff' }}>
              <Typography variant="h6" sx={{ color: '#9c27b0', mb: 2, fontWeight: 600 }}>
                🎁 Benefícios Exclusivos
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                {campanha.beneficios.map((beneficio, idx) => (
                  <Typography component="li" key={idx} sx={{ mb: 1 }}>
                    {beneficio}
                  </Typography>
                ))}
              </Box>
            </Paper>
          )}

          {/* Cupom */}
          {cupom && valida && (
            <Paper
              sx={{
                p: 3,
                mb: 3,
                background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
                color: 'white',
                textAlign: 'center',
                borderRadius: 3,
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                🎟️ USE SEU CUPOM EXCLUSIVO
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'monospace',
                  letterSpacing: 2,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  py: 1,
                  px: 2,
                  borderRadius: 2,
                  display: 'inline-block',
                  mb: 2,
                }}
              >
                {cupom.codigo}
              </Typography>
              <Typography variant="body2">
                {cupom.descontoTipo === 'percentual'
                  ? `${cupom.valor}% de desconto`
                  : `R$ ${cupom.valor.toFixed(2)} de desconto`}
                {cupom.valorMinimo && ` | Mínimo: R$ ${cupom.valorMinimo}`}
              </Typography>
              {cupom.validade && (
                <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.8 }}>
                  Válido até: {new Date(cupom.validade).toLocaleDateString('pt-BR')}
                </Typography>
              )}
            </Paper>
          )}

          {/* Período */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <CalendarIcon sx={{ color: '#9c27b0', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">Data de Início</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatarData(campanha.dataInicio)}
                </Typography>
              </Paper>
            </Grid>
            {campanha.dataFim && (
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <CalendarIcon sx={{ color: '#f44336', mb: 1 }} />
                  <Typography variant="body2" color="textSecondary">Data de Término</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatarData(campanha.dataFim)}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>

          {/* Horário */}
          {campanha.horarioInicio && campanha.horarioFim && (
            <Paper variant="outlined" sx={{ p: 2, mb: 3, textAlign: 'center' }}>
              <TimeIcon sx={{ color: '#ff9800', mb: 1 }} />
              <Typography variant="body2" color="textSecondary">Horário Especial</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatarHora(campanha.horarioInicio)} - {formatarHora(campanha.horarioFim)}
              </Typography>
            </Paper>
          )}

          {/* Botões de ação */}
          {valida && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<LocalOfferIcon />}
                sx={{
                  bgcolor: '#9c27b0',
                  '&:hover': { bgcolor: '#7b1fa2' },
                  px: 4,
                  py: 1.5,
                }}
                onClick={() => window.location.href = '/agendamentos'}
              >
                Agendar Agora
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<ShareIcon />}
                onClick={handleCompartilhar}
              >
                Compartilhar
              </Button>
            </Box>
          )}

          {!valida && !isBefore(new Date(), dataInicio) && (
            <Alert severity="info" sx={{ mt: 3 }}>
              Esta promoção já foi encerrada. Fique atento às próximas promoções!
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
        <Typography variant="body2">
          {configSalao.endereco?.logradouro && `${configSalao.endereco.logradouro} - `}
          {configSalao.endereco?.cidade && `${configSalao.endereco.cidade}/${configSalao.endereco.estado}`}
        </Typography>
        <Typography variant="body2">
          {configSalao.contato?.telefone && `📞 ${configSalao.contato.telefone} `}
          {configSalao.contato?.email && `✉️ ${configSalao.contato.email}`}
        </Typography>
      </Box>

      {/* Dialog de Compartilhamento */}
      <Dialog open={openShareDialog} onClose={() => setOpenShareDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Compartilhar</Typography>
            <IconButton size="small" onClick={() => setOpenShareDialog(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
            <IconButton onClick={compartilharWhatsApp} sx={{ bgcolor: '#25D366', color: 'white' }}>
              <WhatsAppIcon />
            </IconButton>
            <IconButton onClick={compartilharFacebook} sx={{ bgcolor: '#1877f2', color: 'white' }}>
              <FacebookIcon />
            </IconButton>
            <IconButton onClick={compartilharTwitter} sx={{ bgcolor: '#1DA1F2', color: 'white' }}>
              <TwitterIcon />
            </IconButton>
            <IconButton onClick={gerarQrCode} sx={{ bgcolor: '#9c27b0', color: 'white' }}>
              <QrCodeIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ my: 2 }}>ou</Divider>
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<CopyIcon />}
            onClick={copiarLink}
            disabled={copiando}
            sx={{ mb: 1 }}
          >
            Copiar Link
          </Button>
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={() => {
              setOpenShareDialog(false);
              setOpenEmailDialog(true);
            }}
          >
            Enviar por E-mail
          </Button>
        </DialogContent>
      </Dialog>

      {/* Dialog de E-mail */}
      <Dialog open={openEmailDialog} onClose={() => setOpenEmailDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Enviar por E-mail</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="E-mail do destinatário"
            type="email"
            value={emailCliente}
            onChange={(e) => setEmailCliente(e.target.value)}
            placeholder="amigo@email.com"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmailDialog(false)}>Cancelar</Button>
          <Button onClick={enviarPorEmail} variant="contained" disabled={enviandoEmail}>
            {enviandoEmail ? <CircularProgress size={24} /> : 'Enviar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de QR Code */}
      <Dialog open={openQrDialog} onClose={() => setOpenQrDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          QR Code da Promoção
          <IconButton
            onClick={() => setOpenQrDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Box
            sx={{
              width: 200,
              height: 200,
              mx: 'auto',
              bgcolor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
            }}
          >
            <QrCodeIcon sx={{ fontSize: 120, color: '#9c27b0' }} />
          </Box>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
            Escaneie o código com seu celular para acessar a promoção
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default PromocaoVisualizar;
