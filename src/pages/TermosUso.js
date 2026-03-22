// src/pages/TermosUso.js
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Grid,  
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Gavel as GavelIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  PrivacyTip as PrivacyTipIcon,
  VerifiedUser as VerifiedUserIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function TermosUso() {
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
          <Typography color="textPrimary">Termos de Uso</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', display: 'flex', alignItems: 'center', gap: 1 }}>
              <GavelIcon sx={{ fontSize: 40 }} />
              Termos de Uso
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

      {/* Alerta de aceitação */}
      <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Ao utilizar nossos serviços, você concorda com estes termos.</Typography>
        <Typography variant="body2">Leia atentamente antes de prosseguir.</Typography>
      </Alert>

      {/* Sumário */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: '#faf5ff', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DescriptionIcon /> Sumário
        </Typography>
        <Grid container spacing={1}>
          {[
            '1. Aceitação dos Termos',
            '2. Descrição do Serviço',
            '3. Cadastro e Conta',
            '4. Responsabilidades do Usuário',
            '5. Agendamentos e Cancelamentos',
            '6. Pagamentos e Reembolsos',
            '7. Propriedade Intelectual',
            '8. Privacidade e Dados',
            '9. Limitação de Responsabilidade',
            '10. Modificações dos Termos',
            '11. Lei Aplicável',
            '12. Contato'
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Link href={`#section-${index + 1}`} underline="hover" sx={{ display: 'block', py: 0.5 }}>
                {item}
              </Link>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Conteúdo dos Termos */}
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        
        {/* Seção 1 */}
        <Box id="section-1" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            1. Aceitação dos Termos
          </Typography>
          <Typography variant="body1" paragraph>
            Ao acessar e utilizar o sistema BeautyPro ("Sistema"), você concorda em cumprir e estar vinculado a estes Termos de Uso. 
            Se você não concordar com qualquer parte destes termos, não poderá utilizar nossos serviços.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Importante:</strong> Estes termos constituem um contrato legal entre você e a BeautyPro.
          </Alert>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 2 */}
        <Box id="section-2" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            2. Descrição do Serviço
          </Typography>
          <Typography variant="body1" paragraph>
            O BeautyPro é uma plataforma de gestão para salões de beleza que oferece funcionalidades como:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
              <ListItemText primary="Agendamento de serviços online" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
              <ListItemText primary="Gerenciamento de clientes e profissionais" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
              <ListItemText primary="Controle financeiro e comissões" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
              <ListItemText primary="Programa de fidelidade e recompensas" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
              <ListItemText primary="Formulários de anamnese" />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 3 */}
        <Box id="section-3" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            3. Cadastro e Conta
          </Typography>
          <Typography variant="body1" paragraph>
            Para utilizar determinados recursos do Sistema, você pode precisar criar uma conta. Você é responsável por:
          </Typography>
          <List>
            <ListItem><ListItemIcon><InfoIcon /></ListItemIcon><ListItemText primary="Fornecer informações precisas, completas e atualizadas" /></ListItem>
            <ListItem><ListItemIcon><InfoIcon /></ListItemIcon><ListItemText primary="Manter a segurança de sua senha e dados de acesso" /></ListItem>
            <ListItem><ListItemIcon><InfoIcon /></ListItemIcon><ListItemText primary="Notificar imediatamente qualquer uso não autorizado de sua conta" /></ListItem>
          </List>
          <Alert severity="info" sx={{ mt: 2 }}>
            Você é o único responsável por todas as atividades realizadas em sua conta.
          </Alert>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 4 */}
        <Box id="section-4" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            4. Responsabilidades do Usuário
          </Typography>
          <Typography variant="body1" paragraph>
            Ao utilizar o Sistema, você concorda em:
          </Typography>
          <List>
            <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon><ListItemText primary="Utilizar o Sistema apenas para fins legítimos" /></ListItem>
            <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon><ListItemText primary="Não violar quaisquer leis aplicáveis" /></ListItem>
            <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon><ListItemText primary="Não interferir no funcionamento do Sistema" /></ListItem>
            <ListItem><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon><ListItemText primary="Não compartilhar informações de acesso com terceiros" /></ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 5 */}
        <Box id="section-5" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            5. Agendamentos e Cancelamentos
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Política de Cancelamento:</strong> Cancelamentos devem ser feitos com no mínimo 24 horas de antecedência. 
            Cancelamentos em cima da hora ou não comparecimento podem estar sujeitos a taxas.
          </Typography>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Como cancelar um agendamento?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                Acesse sua conta, vá em "Agendamentos", selecione o agendamento desejado e clique em "Cancelar". 
                Você também pode entrar em contato com o estabelecimento diretamente.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 6 */}
        <Box id="section-6" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            6. Pagamentos e Reembolsos
          </Typography>
          <Typography variant="body1" paragraph>
            Os pagamentos podem ser realizados através das formas disponíveis no sistema. Em caso de cancelamento conforme política estabelecida, 
            os valores pagos serão reembolsados integralmente. Para serviços já realizados, não haverá reembolso.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Em caso de problemas com pagamentos, entre em contato com o suporte.
          </Alert>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 7 */}
        <Box id="section-7" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            7. Propriedade Intelectual
          </Typography>
          <Typography variant="body1" paragraph>
            Todo o conteúdo do Sistema, incluindo textos, gráficos, logotipos, ícones, imagens, software e código-fonte, 
            é propriedade exclusiva da BeautyPro ou de seus licenciadores e está protegido por leis de direitos autorais e propriedade intelectual.
          </Typography>
          <Alert severity="warning">
            É proibida a reprodução, distribuição ou modificação não autorizada de qualquer conteúdo do Sistema.
          </Alert>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 8 */}
        <Box id="section-8" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            8. Privacidade e Dados
          </Typography>
          <Typography variant="body1" paragraph>
            A coleta e tratamento de dados pessoais são regidos pela nossa Política de Privacidade. 
            Ao utilizar o Sistema, você consente com a coleta e uso de suas informações conforme descrito na política.
          </Typography>
          <Button variant="outlined" href="/politica-privacidade" sx={{ mt: 1 }}>
            Ler Política de Privacidade
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 9 */}
        <Box id="section-9" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            9. Limitação de Responsabilidade
          </Typography>
          <Typography variant="body1" paragraph>
            O BeautyPro não se responsabiliza por:
          </Typography>
          <List>
            <ListItem><ListItemIcon><WarningIcon color="warning" /></ListItemIcon><ListItemText primary="Interrupções temporárias do serviço" /></ListItem>
            <ListItem><ListItemIcon><WarningIcon color="warning" /></ListItemIcon><ListItemText primary="Perda de dados decorrente de uso inadequado" /></ListItem>
            <ListItem><ListItemIcon><WarningIcon color="warning" /></ListItemIcon><ListItemText primary="Danos indiretos ou incidentais" /></ListItem>
            <ListItem><ListItemIcon><WarningIcon color="warning" /></ListItemIcon><ListItemText primary="Ações de terceiros no uso do Sistema" /></ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 10 */}
        <Box id="section-10" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            10. Modificações dos Termos
          </Typography>
          <Typography variant="body1" paragraph>
            Reservamo-nos o direito de modificar estes Termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação no Sistema. 
            O uso continuado do Sistema após tais modificações constitui sua aceitação dos novos termos.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 11 */}
        <Box id="section-11" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            11. Lei Aplicável
          </Typography>
          <Typography variant="body1" paragraph>
            Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será resolvida no foro da comarca do domicílio do usuário.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Seção 12 */}
        <Box id="section-12" sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0', mb: 2 }}>
            12. Contato
          </Typography>
          <Typography variant="body1" paragraph>
            Em caso de dúvidas sobre estes Termos de Uso, entre em contato conosco:
          </Typography>
          <Card variant="outlined" sx={{ mt: 2, bgcolor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="body2">
                <strong>E-mail:</strong> suporte@beautypro.com.br
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>WhatsApp:</strong> (11) 99999-9999
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

export default TermosUso;
