// src/scripts/importarServicos.js
import { firebaseService } from '../services/firebase';

export const servicosParaImportar = [
  {
    id: 22,
    nome: 'Corte de Cabelo Feminino',
    preco: 65.00,
    dataCriacao: '2024-08-13T17:38:57.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 60,
    descricao: 'Corte de cabelo feminino com acabamento profissional'
  },
  {
    id: 28,
    nome: 'Escova Cabelo Curto',
    preco: 45.00,
    dataCriacao: '2024-08-13T17:38:57.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 45,
    descricao: 'Escova para cabelos curtos'
  },
  {
    id: 31,
    nome: 'Hidratação Capilar',
    preco: 65.00,
    dataCriacao: '2024-08-13T17:38:57.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 50,
    descricao: 'Hidratação profunda para cabelos'
  },
  {
    id: 32,
    nome: 'Sobrancelhas Limpeza',
    preco: 25.00,
    dataCriacao: '2024-08-13T17:38:57.000Z',
    status: 'ativo',
    categoria: 'Design',
    duracao: 20,
    descricao: 'Limpeza e design de sobrancelhas'
  },
  {
    id: 34,
    nome: 'Coloração retoque de raiz tintura do salão',
    preco: 85.00,
    dataCriacao: '2024-08-13T17:38:57.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 60,
    descricao: 'Retoque de raiz com tintura do salão'
  },
  {
    id: 35,
    nome: 'Progressiva Cabelo pouco volume',
    preco: 130.00,
    dataCriacao: '2024-08-13T17:38:57.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 120,
    descricao: 'Progressiva para cabelos com pouco volume'
  },
  {
    id: 36,
    nome: 'Massagem Relaxante',
    preco: 80.00,
    dataCriacao: '2024-08-13T17:38:57.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 60,
    descricao: 'Massagem relaxante corporal'
  },
  {
    id: 46,
    nome: 'Escova cabelo médio',
    preco: 55.00,
    dataCriacao: '2025-01-10T08:56:09.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 50,
    descricao: 'Escova para cabelos médios'
  },
  {
    id: 47,
    nome: 'Escova Cabelo Comprido',
    preco: 65.00,
    dataCriacao: '2025-01-10T08:56:40.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 60,
    descricao: 'Escova para cabelos compridos'
  },
  {
    id: 48,
    nome: 'Escova Cabelo Comprido com volume',
    preco: 75.00,
    dataCriacao: '2025-01-10T08:57:06.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 70,
    descricao: 'Escova com volume para cabelos compridos'
  },
  {
    id: 49,
    nome: 'Reconstrução Capilar',
    preco: 85.00,
    dataCriacao: '2025-01-10T08:57:59.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 60,
    descricao: 'Reconstrução capilar com queratina'
  },
  {
    id: 50,
    nome: 'Nutrição Capilar',
    preco: 70.00,
    dataCriacao: '2025-01-10T08:58:42.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 50,
    descricao: 'Nutrição para cabelos secos'
  },
  {
    id: 51,
    nome: 'Selagem apartir',
    preco: 100.00,
    dataCriacao: '2025-01-10T09:01:00.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 90,
    descricao: 'Selagem térmica para cabelos'
  },
  {
    id: 52,
    nome: 'Botox apartir',
    preco: 80.00,
    dataCriacao: '2025-01-10T09:01:27.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 80,
    descricao: 'Botox capilar'
  },
  {
    id: 53,
    nome: 'Pacote de mechas blond sem repasse',
    preco: 500.00,
    dataCriacao: '2025-01-10T09:02:28.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 180,
    descricao: 'Pacote completo de mechas blond (sem repasse)'
  },
  {
    id: 54,
    nome: 'Pacote de mechas blond com repasse',
    preco: 580.00,
    dataCriacao: '2025-01-10T09:02:55.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 210,
    descricao: 'Pacote completo de mechas blond (com repasse)'
  },
  {
    id: 55,
    nome: 'Pacote de mechas blond com correção de cor',
    preco: 600.00,
    dataCriacao: '2025-01-10T09:03:17.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 240,
    descricao: 'Pacote completo de mechas blond com correção de cor'
  },
  {
    id: 56,
    nome: 'Pacote de mechas iluminada sem repasse',
    preco: 380.00,
    dataCriacao: '2025-01-10T09:03:52.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 150,
    descricao: 'Pacote de mechas iluminadas (sem repasse)'
  },
  {
    id: 57,
    nome: 'Pacote de mechas iluminada com repasse',
    preco: 400.00,
    dataCriacao: '2025-01-10T09:04:28.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 180,
    descricao: 'Pacote de mechas iluminadas (com repasse)'
  },
  {
    id: 58,
    nome: 'Pacote de mechas iluminada com correção de cor',
    preco: 450.00,
    dataCriacao: '2025-01-10T09:04:53.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 210,
    descricao: 'Pacote de mechas iluminadas com correção de cor'
  },
  {
    id: 59,
    nome: 'Pacote cronograma capilar',
    preco: 320.00,
    dataCriacao: '2025-01-10T09:05:22.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 180,
    descricao: 'Pacote completo de cronograma capilar'
  },
  {
    id: 60,
    nome: 'Coloração retoque de raiz tintura da cliente',
    preco: 65.00,
    dataCriacao: '2025-01-10T09:11:06.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 50,
    descricao: 'Retoque de raiz com tintura da cliente'
  },
  {
    id: 61,
    nome: 'Depilação Buço',
    preco: 16.00,
    dataCriacao: '2025-01-10T09:32:12.000Z',
    status: 'ativo',
    categoria: 'Depilação',
    duracao: 15,
    descricao: 'Depilação de buço'
  },
  {
    id: 62,
    nome: 'Depilação meia perna',
    preco: 33.00,
    dataCriacao: '2025-01-10T09:32:29.000Z',
    status: 'ativo',
    categoria: 'Depilação',
    duracao: 30,
    descricao: 'Depilação de meia perna'
  },
  {
    id: 63,
    nome: 'Depilação perna inteira',
    preco: 50.00,
    dataCriacao: '2025-01-10T09:32:54.000Z',
    status: 'ativo',
    categoria: 'Depilação',
    duracao: 45,
    descricao: 'Depilação de perna inteira'
  },
  {
    id: 64,
    nome: 'Depilação axilas',
    preco: 20.00,
    dataCriacao: '2025-01-10T09:33:11.000Z',
    status: 'ativo',
    categoria: 'Depilação',
    duracao: 20,
    descricao: 'Depilação de axilas'
  },
  {
    id: 65,
    nome: 'Depilação perianal',
    preco: 30.00,
    dataCriacao: '2025-01-10T09:33:29.000Z',
    status: 'ativo',
    categoria: 'Depilação',
    duracao: 20,
    descricao: 'Depilação perianal'
  },
  {
    id: 66,
    nome: 'Depilação virilha completa',
    preco: 60.00,
    dataCriacao: '2025-01-10T09:33:58.000Z',
    status: 'ativo',
    categoria: 'Depilação',
    duracao: 40,
    descricao: 'Depilação de virilha completa'
  },
  {
    id: 67,
    nome: 'Depilação Nariz',
    preco: 12.00,
    dataCriacao: '2025-01-10T09:34:14.000Z',
    status: 'ativo',
    categoria: 'Depilação',
    duracao: 10,
    descricao: 'Depilação de nariz'
  },
  {
    id: 68,
    nome: 'Depilação Costas',
    preco: 45.00,
    dataCriacao: '2025-01-10T09:34:36.000Z',
    status: 'ativo',
    categoria: 'Depilação',
    duracao: 40,
    descricao: 'Depilação de costas'
  },
  {
    id: 69,
    nome: 'Depilação Abdomen e peito',
    preco: 55.00,
    dataCriacao: '2025-01-10T09:34:59.000Z',
    status: 'ativo',
    categoria: 'Depilação',
    duracao: 45,
    descricao: 'Depilação de abdomen e peito'
  },
  {
    id: 70,
    nome: 'Depilação completa',
    preco: 110.00,
    dataCriacao: '2025-01-10T09:35:18.000Z',
    status: 'ativo',
    categoria: 'Depilação',
    duracao: 90,
    descricao: 'Depilação completa'
  },
  {
    id: 71,
    nome: 'Bambuterapia',
    preco: 100.00,
    dataCriacao: '2025-01-10T09:35:49.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 60,
    descricao: 'Massagem com bambu'
  },
  {
    id: 72,
    nome: 'Pedras Quentes',
    preco: 120.00,
    dataCriacao: '2025-01-10T09:36:04.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 60,
    descricao: 'Massagem com pedras quentes'
  },
  {
    id: 73,
    nome: 'Argiloterapia e peeling',
    preco: 70.00,
    dataCriacao: '2025-01-10T09:36:31.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 50,
    descricao: 'Argiloterapia com peeling'
  },
  {
    id: 74,
    nome: 'Banho de Lua',
    preco: 50.00,
    dataCriacao: '2025-01-10T09:36:47.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 40,
    descricao: 'Banho de lua para clareamento'
  },
  {
    id: 75,
    nome: 'Progressiva Cabelo médio volume',
    preco: 160.00,
    dataCriacao: '2025-01-24T11:45:52.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 150,
    descricao: 'Progressiva para cabelo médio com volume'
  },
  {
    id: 76,
    nome: 'Progressiva Cabelo volumoso',
    preco: 200.00,
    dataCriacao: '2025-01-24T11:46:58.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 180,
    descricao: 'Progressiva para cabelo volumoso'
  },
  {
    id: 77,
    nome: 'Progressiva Cabelo Volumoso e comprido',
    preco: 230.00,
    dataCriacao: '2025-01-24T11:49:50.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 210,
    descricao: 'Progressiva para cabelo volumoso e comprido'
  },
  {
    id: 78,
    nome: 'Coloração aplicação cabelo todo tintura salão',
    preco: 115.00,
    dataCriacao: '2025-01-24T11:58:28.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 90,
    descricao: 'Coloração completa com tintura do salão'
  },
  {
    id: 79,
    nome: 'Coloração aplicação cabelo todo tintura cliente',
    preco: 90.00,
    dataCriacao: '2025-01-24T11:58:59.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 80,
    descricao: 'Coloração completa com tintura do cliente'
  },
  {
    id: 80,
    nome: 'Drenagem Linfática avulso',
    preco: 80.00,
    dataCriacao: '2025-10-07T13:20:36.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 60,
    descricao: 'Drenagem linfática avulsa'
  },
  {
    id: 81,
    nome: 'Drenagem linfatica pacote 5 sessões',
    preco: 400.00,
    dataCriacao: '2025-10-07T13:21:07.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 300,
    descricao: 'Pacote de 5 sessões de drenagem linfática'
  },
  {
    id: 82,
    nome: 'Drenagem Linfatica pacote 10 sessões',
    preco: 650.00,
    dataCriacao: '2025-10-07T13:21:43.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 600,
    descricao: 'Pacote de 10 sessões de drenagem linfática'
  },
  {
    id: 83,
    nome: 'Massagem Relaxante avulso',
    preco: 80.00,
    dataCriacao: '2025-10-07T13:22:08.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 60,
    descricao: 'Massagem relaxante avulsa'
  },
  {
    id: 84,
    nome: 'Massagem Relaxante pacote 5 sessões',
    preco: 375.00,
    dataCriacao: '2025-10-07T13:22:55.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 300,
    descricao: 'Pacote de 5 sessões de massagem relaxante'
  },
  {
    id: 85,
    nome: 'Massagem Relaxante pacote 10 sessões',
    preco: 500.00,
    dataCriacao: '2025-10-07T13:23:19.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 600,
    descricao: 'Pacote de 10 sessões de massagem relaxante'
  },
  {
    id: 86,
    nome: 'Pedras Quentes avulso',
    preco: 110.00,
    dataCriacao: '2025-10-07T13:23:48.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 60,
    descricao: 'Massagem com pedras quentes avulsa'
  },
  {
    id: 87,
    nome: 'Pedras Quentes pacote 5 sessões',
    preco: 300.00,
    dataCriacao: '2025-10-07T13:24:13.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 300,
    descricao: 'Pacote de 5 sessões de pedras quentes'
  },
  {
    id: 88,
    nome: 'Pedras Quentes pacote 10 sessões',
    preco: 500.00,
    dataCriacao: '2025-10-07T13:24:33.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 600,
    descricao: 'Pacote de 10 sessões de pedras quentes'
  },
  {
    id: 89,
    nome: 'Ventosaterapia avulso',
    preco: 100.00,
    dataCriacao: '2025-10-07T13:25:01.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 50,
    descricao: 'Ventosaterapia avulsa'
  },
  {
    id: 90,
    nome: 'Ventosaterapia pacote 5 sessões',
    preco: 400.00,
    dataCriacao: '2025-10-07T13:25:28.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 250,
    descricao: 'Pacote de 5 sessões de ventosaterapia'
  },
  {
    id: 91,
    nome: 'Ventosaterapia pacote 10 sessões',
    preco: 500.00,
    dataCriacao: '2025-10-07T13:25:56.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 500,
    descricao: 'Pacote de 10 sessões de ventosaterapia'
  },
  {
    id: 92,
    nome: 'Massagem bambu avulso',
    preco: 100.00,
    dataCriacao: '2025-10-07T13:26:18.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 60,
    descricao: 'Massagem com bambu avulsa'
  },
  {
    id: 93,
    nome: 'Massagem com bambu pacote 5 sessões',
    preco: 450.00,
    dataCriacao: '2025-10-07T13:26:43.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 300,
    descricao: 'Pacote de 5 sessões de massagem com bambu'
  },
  {
    id: 94,
    nome: 'Massagem com Bambu pacote 10 sessões',
    preco: 600.00,
    dataCriacao: '2025-10-07T13:27:05.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 600,
    descricao: 'Pacote de 10 sessões de massagem com bambu'
  },
  {
    id: 95,
    nome: 'Massagem Modeladora corporal avulso',
    preco: 85.00,
    dataCriacao: '2025-10-07T13:27:33.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 60,
    descricao: 'Massagem modeladora corporal avulsa'
  },
  {
    id: 96,
    nome: 'Massagem Modeladora Corporal pacote 5 sessões',
    preco: 400.00,
    dataCriacao: '2025-10-07T13:27:58.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 300,
    descricao: 'Pacote de 5 sessões de massagem modeladora'
  },
  {
    id: 97,
    nome: 'Massagem Modeladora Corporal pacote 10 sessões',
    preco: 650.00,
    dataCriacao: '2025-10-07T13:28:19.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 600,
    descricao: 'Pacote de 10 sessões de massagem modeladora'
  },
  {
    id: 98,
    nome: 'Limpeza de Pele avulso',
    preco: 70.00,
    dataCriacao: '2025-10-07T13:28:38.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 50,
    descricao: 'Limpeza de pele avulsa'
  },
  {
    id: 99,
    nome: 'Limpeza de Pele pacote 5 sessões',
    preco: 275.00,
    dataCriacao: '2025-10-07T13:28:58.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 250,
    descricao: 'Pacote de 5 sessões de limpeza de pele'
  },
  {
    id: 100,
    nome: 'Limpeza de Pele pacote 10 sessões',
    preco: 400.00,
    dataCriacao: '2025-10-07T13:29:21.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 500,
    descricao: 'Pacote de 10 sessões de limpeza de pele'
  },
  {
    id: 101,
    nome: 'Spa dos pés avulso',
    preco: 50.00,
    dataCriacao: '2025-10-07T13:29:38.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 40,
    descricao: 'Spa dos pés avulso'
  },
  {
    id: 102,
    nome: 'Spa dos pés pacote 5 sessões',
    preco: 225.00,
    dataCriacao: '2025-10-07T13:30:02.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 200,
    descricao: 'Pacote de 5 sessões de spa dos pés'
  },
  {
    id: 103,
    nome: 'Spa dos pés pacote 10 sessões',
    preco: 350.00,
    dataCriacao: '2025-10-07T13:30:25.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 400,
    descricao: 'Pacote de 10 sessões de spa dos pés'
  },
  {
    id: 104,
    nome: 'Consulta Nutricionista',
    preco: 200.00,
    dataCriacao: '2025-10-09T14:21:34.000Z',
    status: 'ativo',
    categoria: 'Saúde',
    duracao: 60,
    descricao: 'Consulta com nutricionista'
  },
  {
    id: 105,
    nome: 'Pacote escova cabelo',
    preco: 162.00,
    dataCriacao: '2025-10-09T16:30:16.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 150,
    descricao: 'Pacote de escovas para cabelo'
  },
  {
    id: 112,
    nome: 'Manicure',
    preco: 25.00,
    dataCriacao: '2026-01-06T15:45:11.000Z',
    status: 'ativo',
    categoria: 'Unhas',
    duracao: 40,
    descricao: 'Manicure completa'
  },
  {
    id: 113,
    nome: 'Pedicure',
    preco: 35.00,
    dataCriacao: '2026-01-06T15:45:31.000Z',
    status: 'ativo',
    categoria: 'Unhas',
    duracao: 50,
    descricao: 'Pedicure completa'
  },
  {
    id: 114,
    nome: 'Pacote Manicure e Pedicure',
    preco: 50.00,
    dataCriacao: '2026-01-06T15:46:06.000Z',
    status: 'ativo',
    categoria: 'Unhas',
    duracao: 80,
    descricao: 'Pacote de manicure e pedicure'
  },
  {
    id: 115,
    nome: 'Pacote Progressiva Contorno , tratamento e escova',
    preco: 140.00,
    dataCriacao: '2026-02-01T13:17:21.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 150,
    descricao: 'Pacote com progressiva contorno, tratamento e escova'
  },
  {
    id: 116,
    nome: 'Pacote coloração raiz,tratamento e escova',
    preco: 180.00,
    dataCriacao: '2026-02-01T13:26:21.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 150,
    descricao: 'Pacote com coloração raiz, tratamento e escova'
  },
  {
    id: 117,
    nome: 'Pacote corte e escova',
    preco: 115.00,
    dataCriacao: '2026-02-01T13:27:30.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 90,
    descricao: 'Pacote de corte e escova'
  },
  {
    id: 118,
    nome: 'Maquiagem',
    preco: 150.00,
    dataCriacao: '2026-02-01T15:57:26.000Z',
    status: 'ativo',
    categoria: 'Maquiagem',
    duracao: 60,
    descricao: 'Maquiagem profissional'
  },
  {
    id: 119,
    nome: 'Penteado',
    preco: 150.00,
    dataCriacao: '2026-02-01T15:58:56.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 60,
    descricao: 'Penteado para eventos'
  },
  {
    id: 120,
    nome: 'Pacote make e penteado',
    preco: 280.00,
    dataCriacao: '2026-02-01T15:59:42.000Z',
    status: 'ativo',
    categoria: 'Maquiagem',
    duracao: 120,
    descricao: 'Pacote de maquiagem e penteado'
  },
  {
    id: 121,
    nome: 'Spa dos pes avulso',
    preco: 50.00,
    dataCriacao: '2026-02-01T16:59:45.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 40,
    descricao: 'Spa dos pés avulso'
  },
  {
    id: 122,
    nome: 'Camuflagem fios brancos',
    preco: 100.00,
    dataCriacao: '2026-02-02T11:24:41.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 50,
    descricao: 'Camuflagem de fios brancos'
  },
  {
    id: 123,
    nome: 'Teste de mecha',
    preco: 0.00,
    dataCriacao: '2026-02-04T06:10:09.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 20,
    descricao: 'Teste de mecha para coloração'
  },
  {
    id: 124,
    nome: 'Pos mechas',
    preco: 0.00,
    dataCriacao: '2026-02-04T06:35:23.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 30,
    descricao: 'Finalização pós mechas'
  },
  {
    id: 125,
    nome: 'pacote escova sessões',
    preco: 0.00,
    dataCriacao: '2026-03-03T02:47:20.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 0,
    descricao: 'Pacote de sessões de escova'
  },
  {
    id: 126,
    nome: 'pacote drenagem linfática sessões',
    preco: 0.00,
    dataCriacao: '2026-03-03T02:47:45.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 0,
    descricao: 'Pacote de sessões de drenagem linfática'
  },
  {
    id: 127,
    nome: 'pacote massagem modeladora sessões',
    preco: 0.00,
    dataCriacao: '2026-03-03T02:48:14.000Z',
    status: 'ativo',
    categoria: 'Estética',
    duracao: 0,
    descricao: 'Pacote de sessões de massagem modeladora'
  },
  {
    id: 128,
    nome: 'pacote cronograma capilar sessão',
    preco: 0.00,
    dataCriacao: '2026-03-03T05:13:05.000Z',
    status: 'ativo',
    categoria: 'Cabelo',
    duracao: 0,
    descricao: 'Pacote de sessões de cronograma capilar'
  },
  {
    id: 129,
    nome: 'Make',
    preco: 50.00,
    dataCriacao: '2026-03-10T16:25:28.000Z',
    status: 'ativo',
    categoria: 'Maquiagem',
    duracao: 45,
    descricao: 'Maquiagem simples'
  }
];

export const importarServicos = async () => {
  console.log('🚀 Iniciando importação de serviços...');
  console.log(`📦 Total de serviços para importar: ${servicosParaImportar.length}`);

  let importados = 0;
  let erros = 0;

  for (const servico of servicosParaImportar) {
    try {
      // Verificar se já existe um serviço com este ID (opcional)
      const existente = await firebaseService.getById('servicos', servico.id.toString()).catch(() => null);
      
      if (existente) {
        console.log(`⚠️ Serviço ID ${servico.id} já existe. Pulando...`);
        continue;
      }

      // Preparar dados para o Firebase
      const servicoParaSalvar = {
        ...servico,
        id: servico.id.toString(), // Converter ID para string
        comissaoProfissional: 40, // Comissão padrão de 40%
        ativo: servico.status === 'ativo',
        createdAt: servico.dataCriacao,
        updatedAt: new Date().toISOString()
      };

      // Remover campos que não queremos no Firebase
      delete servicoParaSalvar.status;
      delete servicoParaSalvar.dataCriacao;

      // Adicionar ao Firebase
      await firebaseService.add('servicos', servicoParaSalvar);
      
      importados++;
      console.log(`✅ Importado: ${servico.nome} (ID: ${servico.id})`);
      
    } catch (error) {
      console.error(`❌ Erro ao importar serviço ID ${servico.id}:`, error);
      erros++;
    }
  }

  console.log('🎉 Importação concluída!');
  console.log(`📊 Resultado: ${importados} importados, ${erros} erros`);
  
  return { importados, erros };
};
