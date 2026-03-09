import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  People,
  AttachMoney,
  CalendarToday,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useDados } from '../hooks/useDados';

const COLORS = ['#9c27b0', '#ff4081', '#7b1fa2', '#ba68c8', '#f44336', '#2196f3'];

const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const StatCard = ({ icon, title, value, trend, trendValue, color, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
  >
    <Card sx={{ height: '100%' }}>
      <CardContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
                {icon}
              </Avatar>
              {trend && (
                <Chip
                  icon={trend === 'up' ? <ArrowUpward /> : <ArrowDownward />}
                  label={`${trendValue}%`}
                  color={trend === 'up' ? 'success' : 'error'}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {title}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

function ModernDashboard() {
  const [stats, setStats] = useState({
    faturamentoMensal: 0,
    totalClientes: 0,
    taxaOcupacao: 0,
    agendamentosHoje: 0
  });
  const [trends, setTrends] = useState({
    faturamento: { value: 0, direction: 'up' },
    clientes: { value: 0, direction: 'up' },
    ocupacao: { value: 0, direction: 'down' },
    agendamentos: { value: 0, direction: 'up' }
  });
  const [revenueData, setRevenueData] = useState([]);
  const [servicesData, setServicesData] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const { dados: agendamentos, loading: loadingAgendamentos } = useDados('agendamentos');
  const { dados: atendimentos, loading: loadingAtendimentos } = useDados('atendimentos');
  const { dados: clientes, loading: loadingClientes } = useDados('clientes');
  const { dados: servicos, loading: loadingServicos } = useDados('servicos');
  const { dados: pagamentos, loading: loadingPagamentos } = useDados('pagamentos');

  useEffect(() => {
    if (!loadingAgendamentos && !loadingAtendimentos && !loadingClientes && !loadingServicos && !loadingPagamentos) {
      calcularDados();
      setLoading(false);
    }
  }, [loadingAgendamentos, loadingAtendimentos, loadingClientes, loadingServicos, loadingPagamentos]);

  const calcularDados = () => {
    // Calcular faturamento mensal (últimos 30 dias)
    const hoje = new Date();
    const trintaDiasAtras = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 30);
    
    const pagamentosMes = pagamentos.filter(p => new Date(p.data) >= trintaDiasAtras);
    const faturamento = pagamentosMes.reduce((acc, p) => acc + p.valor, 0);
    
    // Calcular faturamento do mês anterior para trend
    const sessentaDiasAtras = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 60);
    const trintaAQuarentaDiasAtras = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 30);
    
    const pagamentosMesAnterior = pagamentos.filter(p => {
      const data = new Date(p.data);
      return data >= sessentaDiasAtras && data < trintaAQuarentaDiasAtras;
    });
    const faturamentoAnterior = pagamentosMesAnterior.reduce((acc, p) => acc + p.valor, 0);
    
    const trendFaturamento = faturamentoAnterior > 0 
      ? ((faturamento - faturamentoAnterior) / faturamentoAnterior * 100).toFixed(1)
      : 0;

    // Total de clientes
    const totalClientes = clientes.length;
    
    // Calcular trend de clientes (últimos 30 dias vs anterior)
    const clientesNovos = clientes.filter(c => new Date(c.dataCadastro) >= trintaDiasAtras).length;
    const clientesNovosAnterior = clientes.filter(c => {
      const data = new Date(c.dataCadastro);
      return data >= sessentaDiasAtras && data < trintaAQuarentaDiasAtras;
    }).length;
    
    const trendClientes = clientesNovosAnterior > 0
      ? ((clientesNovos - clientesNovosAnterior) / clientesNovosAnterior * 100).toFixed(1)
      : clientesNovos > 0 ? 100 : 0;

    // Taxa de ocupação (agendamentos confirmados vs horários disponíveis)
    const hojeStr = hoje.toISOString().split('T')[0];
    const agendamentosHoje = agendamentos.filter(a => a.data === hojeStr && a.status !== 'cancelado');
    const totalHorarios = 12; // 12 horários por dia (9h-20h)
    const taxaOcupacao = Math.round((agendamentosHoje.length / totalHorarios) * 100);
    
    // Calcular trend da ocupação (comparar com ontem)
    const ontem = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 1);
    const ontemStr = ontem.toISOString().split('T')[0];
    const agendamentosOntem = agendamentos.filter(a => a.data === ontemStr && a.status !== 'cancelado');
    const taxaOcupacaoOntem = Math.round((agendamentosOntem.length / totalHorarios) * 100);
    
    const trendOcupacao = taxaOcupacaoOntem > 0
      ? ((taxaOcupacao - taxaOcupacaoOntem) / taxaOcupacaoOntem * 100).toFixed(1)
      : 0;

    // Total de agendamentos hoje
    const agendamentosHojeCount = agendamentosHoje.length;
    
    // Calcular trend de agendamentos
    const trendAgendamentos = agendamentosOntem.length > 0
      ? ((agendamentosHojeCount - agendamentosOntem.length) / agendamentosOntem.length * 100).toFixed(1)
      : agendamentosHojeCount > 0 ? 100 : 0;

    setStats({
      faturamentoMensal: faturamento,
      totalClientes,
      taxaOcupacao,
      agendamentosHoje: agendamentosHojeCount
    });

    setTrends({
      faturamento: { 
        value: Math.abs(parseFloat(trendFaturamento)), 
        direction: trendFaturamento >= 0 ? 'up' : 'down' 
      },
      clientes: { 
        value: Math.abs(parseFloat(trendClientes)), 
        direction: trendClientes >= 0 ? 'up' : 'down' 
      },
      ocupacao: { 
        value: Math.abs(parseFloat(trendOcupacao)), 
        direction: trendOcupacao >= 0 ? 'up' : 'down' 
      },
      agendamentos: { 
        value: Math.abs(parseFloat(trendAgendamentos)), 
        direction: trendAgendamentos >= 0 ? 'up' : 'down' 
      }
    });

    // Dados de receita mensal (últimos 6 meses)
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const dataMes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesIndex = dataMes.getMonth();
      const ano = dataMes.getFullYear();
      
      const pagamentosMes = pagamentos.filter(p => {
        const data = new Date(p.data);
        return data.getMonth() === mesIndex && data.getFullYear() === ano;
      });
      
      const total = pagamentosMes.reduce((acc, p) => acc + p.valor, 0);
      
      revenueByMonth.push({
        name: meses[mesIndex],
        valor: total
      });
    }
    setRevenueData(revenueByMonth);

    // Distribuição de serviços
    const servicosCount = {};
    atendimentos.forEach(a => {
      const servico = servicos.find(s => s.id === a.servicoId);
      if (servico) {
        servicosCount[servico.nome] = (servicosCount[servico.nome] || 0) + 1;
      }
    });
    
    const totalAtendimentos = atendimentos.length;
    const servicesDist = Object.entries(servicosCount).map(([name, count]) => ({
      name,
      value: Math.round((count / totalAtendimentos) * 100)
    })).slice(0, 4); // Pegar os 4 principais
    
    setServicesData(servicesDist);

    // Agenda de hoje
    const hojeAppointments = agendamentos
      .filter(a => a.data === hojeStr)
      .sort((a, b) => a.horario.localeCompare(b.horario))
      .slice(0, 4); // Mostrar apenas 4
      
    const appointmentsList = hojeAppointments.map(a => {
      const cliente = clientes.find(c => c.id === a.clienteId);
      const servico = servicos.find(s => s.id === a.servicoId);
      
      return {
        time: a.horario,
        client: cliente?.nome || 'Cliente',
        service: servico?.nome || 'Serviço',
        status: a.status
      };
    });
    setAppointments(appointmentsList);
  };

  const getStatusInfo = (status) => {
    switch(status) {
      case 'confirmado':
        return { label: 'Confirmado', color: 'success', borderColor: '#4caf50' };
      case 'pendente':
        return { label: 'Pendente', color: 'warning', borderColor: '#ff9800' };
      case 'cancelado':
        return { label: 'Cancelado', color: 'error', borderColor: '#f44336' };
      case 'finalizado':
        return { label: 'Concluído', color: 'default', borderColor: '#9e9e9e' };
      default:
        return { label: status, color: 'default', borderColor: '#9e9e9e' };
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
        Dashboard
      </Typography>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AttachMoney />}
            title="Faturamento Mensal"
            value={formatarMoeda(stats.faturamentoMensal)}
            trend={trends.faturamento.direction}
            trendValue={trends.faturamento.value}
            color="#9c27b0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<People />}
            title="Total Clientes"
            value={stats.totalClientes}
            trend={trends.clientes.direction}
            trendValue={trends.clientes.value}
            color="#ff4081"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUp />}
            title="Taxa de Ocupação"
            value={`${stats.taxaOcupacao}%`}
            trend={trends.ocupacao.direction}
            trendValue={trends.ocupacao.value}
            color="#7b1fa2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CalendarToday />}
            title="Agendamentos Hoje"
            value={stats.agendamentosHoje}
            trend={trends.agendamentos.direction}
            trendValue={trends.agendamentos.value}
            color="#ba68c8"
          />
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Receita Mensal
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9c27b0" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#9c27b0" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatarMoeda(value)} />
                    <Tooltip formatter={(value) => formatarMoeda(value)} />
                    <Area 
                      type="monotone" 
                      dataKey="valor" 
                      stroke="#9c27b0" 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Serviços Mais Procurados
                </Typography>
                {servicesData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={servicesData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {servicesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <Box sx={{ mt: 2 }}>
                      {servicesData.map((service, index) => (
                        <Box key={service.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: COLORS[index],
                              mr: 1,
                            }}
                          />
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {service.name}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {service.value}%
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                    Nenhum dado disponível
                  </Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Agenda do Dia */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Agenda de Hoje
                </Typography>
                {appointments.length > 0 ? (
                  <Grid container spacing={2}>
                    {appointments.map((apt, index) => {
                      const statusInfo = getStatusInfo(apt.status);
                      return (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card variant="outlined" sx={{ 
                              p: 2,
                              borderLeft: 4,
                              borderLeftColor: statusInfo.borderColor,
                            }}>
                              <Typography variant="subtitle2" color="textSecondary">
                                {apt.time}
                              </Typography>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, noWrap: true }}>
                                {apt.client}
                              </Typography>
                              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                {apt.service}
                              </Typography>
                              <Chip
                                label={statusInfo.label}
                                size="small"
                                color={statusInfo.color}
                                sx={{ mt: 1 }}
                              />
                            </Card>
                          </motion.div>
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                    Nenhum agendamento para hoje
                  </Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ModernDashboard;