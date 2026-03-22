// src/pages/PoliticaPrivacidade.js
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Breadcrumbs,
  Link,
  Alert,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  PrivacyTip as PrivacyTipIcon,
  Security as SecurityIcon,
  VerifiedUser as VerifiedUserIcon,
  Cookie as CookieIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function PoliticaPrivacidade() {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const dataAtualizacao = '01 de Janeiro de 2024';
  const versao = '1.0';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link color="inherit" href="/" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <HomeIcon fontSize="small" /> Início
          </Link>
          <Typography color="textPrimary">Política de Privacidade</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', display: 'flex', alignItems: 'center', gap: 1 }}>
              <PrivacyTipIcon sx={{ fontSize: 40 }} />
              Política de Privacidade
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Última atualização: {dataAtualizacao} | Versão {versao}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} size="small">
              Imprimir
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} size="small">
              Download PDF
            </Button>
            <Button variant="outlined" startIcon={<ShareIcon />} size="small">
              Compartilhar
            </Button>
            <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} size="small" sx={{ bgcolor: '#9c27b0' }}>
              Voltar
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Introdução */}
      <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Sua privacidade é importante para nós.</Typography>
        <Typography variant="body2">
          Esta Política de Privacidade explica como coletamos, usamos, compartilhamos e protegemos suas informações pessoais.
        </Typography>
      </Alert>

      {/* Sumário */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: '#faf5ff', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon /> Sumário
        </Typography>
        <Grid container spacing={1}>
          {[
            '1. Informações que Coletamos',
            '2. Como Utilizamos suas Informações',
            '3. Compartilhamento de Dados',
            '4. Seus Direitos',
            '5. Segurança dos Dados',
            '6. Cookies e Tecnologias',
            '7. Retenção de Dados',
            '8. Transferência Internacional',
            '9. Menores de Idade',
            '10. Alterações nesta Política',
            '11. Contato'
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Link href={`#section-${index + 1}`} underline="hover" sx={{ display: 'block', py: 0.5 }}>
                {item}
              </Link>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Conteúdo da Política */}
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        
        {/* Seção 1 */}
        <Box id="section-1" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            1. Informações que Coletamos
          </Typography>
          <Typography variant="body1" paragraph>
            Coletamos os seguintes tipos de informações:
          </Typography>
          
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, color: '#9c27b0' }}>
            📝 Informações Pessoais
          </Typography>
          <List>
            <ListItem><ListItemIcon><PersonIcon /></ListItemIcon><ListItemText primary="Nome completo, CPF, data de nascimento" /></ListItem>
            <ListItem><ListItemIcon><EmailIcon /></ListItemIcon><ListItemText primary="Endereço de e-mail" /></ListItem>
            <ListItem><ListItemIcon><PhoneIcon /></ListItemIcon><ListItemText primary="Telefone para contato" /></ListItem>
            <ListItem><ListItemIcon><LocationIcon /></ListItemIcon><ListItemText primary="Endereço residencial" /></ListItem>
          </List>

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, color: '#9c27b0' }}>
            💳 Informações de Pagamento
          </Typography>
          <List>
            <ListItem><ListItemIcon><CreditCardIcon /></ListItemIcon><ListItemText primary="Dados de cartão de crédito (processados por parceiros seguros)" /></ListItem>
            <ListItem><ListItemIcon><CreditCardIcon /></ListItemIcon><ListItemText primary="Histórico de transações" /></ListItem>
          </List>

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, color: '#9c27b0' }}>
            📊 Informações de Uso
          </Typography>
          <List>
            <ListItem><ListItemIcon><InfoIcon /></ListItemIcon><ListItemText primary="Dados de navegação e interação com o sistema" /></ListItem>
            <ListItem><ListItemIcon><InfoIcon /></ListItemIcon><ListItemText primary="Preferências e configurações" /></ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 2 */}
        <Box id="section-2" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            2. Como Utilizamos suas Informações
          </Typography>
          <Typography variant="body1" paragraph>
            Utilizamos suas informações para:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon color="success" /> Fornecer e gerenciar serviços
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Agendamentos, atendimentos e gestão de clientes.</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon color="success" /> Comunicação
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Envio de confirmações, lembretes e notificações.</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon color="success" /> Melhoria do Serviço
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Análise de uso para melhorar a experiência.</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon color="success" /> Segurança
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Proteção contra fraudes e uso não autorizado.</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 3 */}
        <Box id="section-3" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            3. Compartilhamento de Dados
          </Typography>
          <Typography variant="body1" paragraph>
            Não compartilhamos suas informações pessoais com terceiros, exceto:
          </Typography>
          <List>
            <ListItem><ListItemIcon><InfoIcon /></ListItemIcon><ListItemText primary="Com seu consentimento explícito" /></ListItem>
            <ListItem><ListItemIcon><InfoIcon /></ListItemIcon><ListItemText primary="Para cumprir obrigações legais" /></ListItem>
            <ListItem><ListItemIcon><InfoIcon /></ListItemIcon><ListItemText primary="Com prestadores de serviços essenciais (processamento de pagamentos)" /></ListItem>
          </List>
          <Alert severity="info" sx={{ mt: 2 }}>
            Todos os parceiros são contratualmente obrigados a proteger suas informações.
          </Alert>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 4 */}
        <Box id="section-4" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            4. Seus Direitos
          </Typography>
          <Typography variant="body1" paragraph>
            Você tem direito a:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                <DownloadIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
                <Typography variant="subtitle2" sx={{ mt: 1 }}>Acessar seus dados</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                <EditIcon sx={{ fontSize: 40, color: '#ff9800' }} />
                <Typography variant="subtitle2" sx={{ mt: 1 }}>Retificar dados incorretos</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                <DeleteIcon sx={{ fontSize: 40, color: '#f44336' }} />
                <Typography variant="subtitle2" sx={{ mt: 1 }}>Solicitar exclusão</Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 5 */}
        <Box id="section-5" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            5. Segurança dos Dados
          </Typography>
          <Typography variant="body1" paragraph>
            Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações, incluindo:
          </Typography>
          <List>
            <ListItem><ListItemIcon><SecurityIcon /></ListItemIcon><ListItemText primary="Criptografia de dados em trânsito (SSL/TLS)" /></ListItem>
            <ListItem><ListItemIcon><SecurityIcon /></ListItemIcon><ListItemText primary="Armazenamento seguro em servidores protegidos" /></ListItem>
            <ListItem><ListItemIcon><SecurityIcon /></ListItemIcon><ListItemText primary="Controles de acesso rigorosos" /></ListItem>
            <ListItem><ListItemIcon><SecurityIcon /></ListItemIcon><ListItemText primary="Monitoramento contínuo de vulnerabilidades" /></ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 6 */}
        <Box id="section-6" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            6. Cookies e Tecnologias
          </Typography>
          <Typography variant="body1" paragraph>
            Utilizamos cookies e tecnologias similares para:
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell><strong>Tipo de Cookie</strong></TableCell>
                  <TableCell><strong>Finalidade</strong></TableCell>
                  <TableCell><strong>Duração</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow><TableCell>Essenciais</TableCell><TableCell>Funcionamento básico do sistema</TableCell><TableCell>Sessão</TableCell></TableRow>
                <TableRow><TableCell>Preferências</TableCell><TableCell>Lembrar configurações</TableCell><TableCell>1 ano</TableCell></TableRow>
                <TableRow><TableCell>Análise</TableCell><TableCell>Melhorar experiência</TableCell><TableCell>Permanente</TableCell></TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 7 */}
        <Box id="section-7" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            7. Retenção de Dados
          </Typography>
          <Typography variant="body1" paragraph>
            Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para fornecer os serviços. 
            Após o encerramento da conta, podemos reter informações para cumprir obrigações legais, resolver disputas e fazer cumprir nossos acordos.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 8 */}
        <Box id="section-8" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            8. Transferência Internacional
          </Typography>
          <Typography variant="body1" paragraph>
            Seus dados podem ser transferidos e armazenados em servidores localizados fora do seu país de residência. 
            Tomamos todas as medidas necessárias para garantir que seus dados sejam tratados com o mesmo nível de proteção exigido pela legislação aplicável.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 9 */}
        <Box id="section-9" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            9. Menores de Idade
          </Typography>
          <Typography variant="body1" paragraph>
            O Sistema não é destinado a menores de 18 anos. Não coletamos intencionalmente dados de menores. 
            Se você é responsável por um menor e acredita que ele nos forneceu dados, entre em contato para que possamos removê-los.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 10 */}
        <Box id="section-10" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            10. Alterações nesta Política
          </Typography>
          <Typography variant="body1" paragraph>
            Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças significativas através do Sistema ou por e-mail. 
            Recomendamos revisar esta página regularmente.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 11 */}
        <Box id="section-11" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            11. Contato
          </Typography>
          <Typography variant="body1" paragraph>
            Para questões sobre esta Política de Privacidade ou sobre seus dados pessoais, entre em contato com nosso Encarregado de Proteção de Dados (DPO):
          </Typography>
          <Card variant="outlined" sx={{ mt: 2, bgcolor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="body2">
                <strong>E-mail:</strong> dpo@beautypro.com.br
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>WhatsApp:</strong> (11) 99999-9999
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Endereço:</strong> Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Horário de atendimento:</strong> Segunda a Sexta, das 9h às 18h
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Rodapé */}
        <Box sx={{ mt: 4, pt: 3, textAlign: 'center', borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="caption" color="textSecondary">
            © {new Date().getFullYear()} BeautyPro - Sistema para Salão. Todos os direitos reservados.
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
            BeautyPro Gestão de Salões Ltda. - CNPJ: 00.000.000/0001-00
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default PoliticaPrivacidade;
