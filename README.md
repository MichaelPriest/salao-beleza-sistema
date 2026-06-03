# Sistema Salão de Beleza

Aplicação React para gestão de salão de beleza. O backend de dados e autenticação foi migrado para Supabase.

## Supabase

O projeto está configurado para usar o projeto Supabase:

```txt
https://kvjrerxqwtrxttiiqkgf.supabase.co
```

Antes de iniciar a aplicação, configure a chave pública anon do Supabase no ambiente:

```bash
REACT_APP_SUPABASE_URL=https://kvjrerxqwtrxttiiqkgf.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=sb_publishable_9mLVarTs_RJIO26978SX5Q_uMtcfYzW
REACT_APP_SUPABASE_CONFIRM_REDIRECT_PATH=/cliente/login
REACT_APP_SUPABASE_RESET_REDIRECT_PATH=/cliente/recuperar-senha
REACT_APP_SUPABASE_USE_COLLECTION_TABLES=true
```

A camada de dados usa tabelas documentais por coleção no Supabase. Cada tabela possui:

- `document_id`: ID lógico do documento;
- `data`: JSONB com todos os dados do documento;
- `created_at` e `updated_at`: auditoria técnica da linha.

Execute primeiro `supabase/migrations/20260601143000_create_registros_table.sql` se você já tiver dados no formato genérico antigo. Depois execute `supabase/migrations/20260601170000_create_collection_tables.sql`, que cria todas as tabelas necessárias (`clientes`, `agendamentos`, `servicos`, `usuarios`, etc.) e copia dados existentes de `registros` para as tabelas específicas.

Se quiser manter o modo legado em uma única tabela, configure `REACT_APP_SUPABASE_USE_COLLECTION_TABLES=false`; nesse caso a aplicação volta a usar `public.registros`. A chave `sb_secret_...` deve ficar somente em variáveis de ambiente de scripts/servidor, como `SUPABASE_SERVICE_ROLE_KEY`, e nunca deve ser adicionada ao bundle React.

### SQL das tabelas do sistema

O arquivo `supabase/migrations/20260601170000_create_collection_tables.sql` cria as 43 tabelas usadas pela aplicação:

`agendamentos`, `atendimentos`, `auditoria`, `ausencias`, `avaliacoes`, `backups`, `caixa`, `campanhas`, `categorias_produtos`, `clientes`, `cloud_config`, `comissoes`, `compras`, `conciliacoes`, `config_fidelidade`, `configuracoes`, `contas_pagar`, `contas_receber`, `cupons`, `disponibilidades`, `entradas`, `formularios_anamnese`, `fornecedores`, `indicacoes`, `itens_venda`, `logs`, `logs_anamnese`, `modelos_anamnese`, `movimentacoes_estoque`, `notificacoes`, `notificacoes_cliente`, `orcamentos`, `pagamentos`, `pontuacao`, `produtos`, `profissionais`, `recompensas`, `resgates_fidelidade`, `respostas_anamnese`, `servicos`, `transacoes`, `usos_cupons` e `usuarios`.

Cada tabela recebe índices, trigger de `updated_at`, grants para `anon`/`authenticated` e políticas RLS compatíveis com os fluxos atuais do frontend.

### Criar usuário administrador

Para criar o primeiro usuário da parte administrativa, execute o script abaixo depois de aplicar as migrations do Supabase:

```bash
SUPABASE_SERVICE_ROLE_KEY=sb_secret_sua_chave_servidor \
ADMIN_EMAIL=admin@seudominio.com \
ADMIN_PASSWORD='SenhaForte123!' \
ADMIN_NAME='Administrador' \
npm run criar-admin
```

O script cria ou atualiza o usuário no **Supabase Auth** com email confirmado e grava o documento correspondente em `usuarios` com `cargo: 'admin'`, `status: 'ativo'` e permissões administrativas. A variável `SUPABASE_SERVICE_ROLE_KEY` deve ser usada somente localmente ou em ambiente de servidor; nunca coloque a chave secret no frontend.

Depois disso, acesse a rota administrativa de login com `ADMIN_EMAIL` e `ADMIN_PASSWORD`.

#### Criar admin pelo SQL Editor

Se o usuário já existe no **Supabase Auth**, você também pode configurar o acesso administrativo diretamente pelo SQL Editor. Para o usuário `michael.rodrigoraimundo@gmail.com` (`a420ce6a-c852-48e2-ad49-7bd050f854d1`), copie e execute o arquivo:

```txt
supabase/sql/criar_admin_sql_editor.sql
```

Esse SQL cria/atualiza o documento em `public.usuarios`, mantém compatibilidade com `public.registros` quando existir e atualiza os metadados do usuário em `auth.users`. Ele **não grava senha**; a senha deve ser definida no painel do Supabase em **Authentication > Users** ou via Admin API/service role.

### Confirmação de email e reset de senha

No painel do Supabase, acesse **Authentication > URL Configuration** e configure:

- **Site URL**: URL pública da aplicação em produção.
- **Redirect URLs**:
  - `http://localhost:3000/cliente/login`
  - `http://localhost:3000/cliente/recuperar-senha`
  - `https://SEU-DOMINIO/cliente/login`
  - `https://SEU-DOMINIO/cliente/recuperar-senha`

Em **Authentication > Email Templates**, mantenha os templates de **Confirm signup** e **Reset password** usando o link de confirmação do Supabase (`{{ .ConfirmationURL }}`). O sistema já envia os redirects corretos: confirmação para `/cliente/login` e recuperação para `/cliente/recuperar-senha`.

Quando o cliente abre o link de recuperação, a página `/cliente/recuperar-senha` consome o token `type=recovery` do Supabase e exibe o formulário de nova senha. Quando abre o link de confirmação, `/cliente/login` reconhece `type=signup` e mostra a confirmação de email.


## Estrutura SaaS e cobrança

A base SaaS foi adicionada para atender empresas individuais e redes multiunidades. Execute também a migration:

```txt
supabase/migrations/20260602120000_create_saas_structure.sql
supabase/migrations/20260603100000_create_saas_billing_config.sql
supabase/migrations/20260603120000_add_empresa_public_portal.sql
```

Ela cria as coleções documentais `empresas`, `unidades`, `planos_saas`, `assinaturas`, `faturas_saas`, `pagamentos_saas`, `convites_saas`, `uso_saas` e `eventos_cobranca_saas`, `configuracoes_saas` e `webhooks_cobranca_saas`, além de campos `slug`, `linkPublico` e `sitePublico` em cada empresa, além de semear os planos `individual` e `multiunidades`.

O contexto atual de empresa/unidade fica em `localStorage` e a camada `firebaseService` adiciona/faz filtro automático por `empresaId` e, quando aplicável, por `unidadeId` nas coleções operacionais. Isso permite separar os dados de cada contratante sem reescrever todas as telas.

### Isolamento de tenants

A camada de compatibilidade força o isolamento antes de qualquer chamada REST ao Supabase:

- coleções operacionais (`clientes`, `usuarios`, `servicos`, `agendamentos`, financeiro, estoque e fidelidade) sempre recebem filtro do `empresaId` atual; filtros enviados pela tela com outro `empresaId` são substituídos pelo tenant logado;
- coleções por unidade também recebem `unidadeId`, evitando que uma filial veja agenda/caixa/estoque de outra unidade;
- gravações sem empresa selecionada ou com `empresaId`/`unidadeId` diferente do contexto atual são bloqueadas no frontend;
- a coleção `empresas` só retorna a empresa do tenant ativo para usuários comuns; somente o admin SaaS da plataforma enxerga todas as empresas;
- login/cadastro de clientes vindos de `/e/:slug` ou `?empresa=slug` carregam o tenant público antes de consultar ou criar clientes, vinculando CPF/email à empresa correta.

Para isolamento em profundidade, mantenha as políticas RLS do Supabase alinhadas com essa mesma regra de `empresaId`/`unidadeId` e use `SUPABASE_SERVICE_ROLE_KEY` apenas em scripts/servidor.


### Login e cadastro de clientes por tenant

Os clientes devem acessar login e cadastro pelo link público da empresa (`/e/:slug`) ou pelas rotas com `?empresa=slug`, por exemplo `/cliente/login?empresa=meu-salao`. O sistema grava esse contexto em sessão, filtra os clientes pelo `empresaId` atual e usa IDs compostos por `empresaId + uid` para permitir isolamento entre tenants e evitar sobrescrever clientes de outra empresa.

### Página pública por empresa

Cada empresa possui uma página própria em `/e/:slug`, configurada em **Minha Empresa > Página inicial** (`/empresa/site`). Essa página usa o componente `SiteSalao.js` em modo tenant, define o slug/link público, título, subtítulo, cor principal e se serviços/equipe serão exibidos. Os botões de login e cadastro carregam o contexto da empresa para vincular novos clientes ao `empresaId` correto.

### Cobrança

As telas foram separadas em duas áreas isoladas:

- **Admin SaaS da plataforma**: `/saas-admin`, protegido por `SaasAdminRoute`, para usuários `superadmin`, `admin_saas`, `saas_admin`, `admin_plataforma` ou com permissão `admin_saas`. Essa área é um dashboard central e as rotas específicas evitam repetição de telas: `/saas-admin/empresas` para tenants/unidades/status, `/saas-admin/assinaturas` para planos e uso, `/saas-admin/cobrancas` para faturas/pagamentos e `/saas-admin/pagamentos` para as configurações das APIs de pagamento.
- **Área da empresa cliente**: `/empresa`, `/empresa/unidades`, `/empresa/assinatura` e `/empresa/cobranca`. Essas telas usam somente o `empresaId`/`unidadeId` do contexto do usuário logado. Em `/empresa`, a empresa cadastra também razão social, responsável financeiro, email/telefone de cobrança, documento para nota, endereço de cobrança, dia padrão de vencimento e observações da mensalidade.
- A rota antiga `/saas` redireciona para `/empresa` para evitar misturar o painel da plataforma com o painel do cliente.

O endpoint server-side `/api/saas-checkout` inicia a cobrança com o provedor configurado:

- `BILLING_PROVIDER=manual`: retorna instruções de cobrança manual.
- `BILLING_PROVIDER=stripe`: cria uma sessão Stripe Checkout usando `STRIPE_SECRET_KEY`.
- `BILLING_PROVIDER=mercadopago`: cria uma preferência Mercado Pago usando `MERCADOPAGO_ACCESS_TOKEN`.
- `BILLING_PROVIDER=pagseguro` ou `pagbank`: cria um checkout PagSeguro/PagBank usando `PAGSEGURO_TOKEN` e `PAGSEGURO_ENVIRONMENT`.

Nunca exponha `STRIPE_SECRET_KEY`, `MERCADOPAGO_ACCESS_TOKEN`, `PAGSEGURO_TOKEN` ou `SUPABASE_SERVICE_ROLE_KEY` no frontend. Configure essas variáveis apenas no ambiente servidor/Vercel.

## Scripts disponíveis

No diretório do projeto, você pode executar:

### `npm start`

Inicia a aplicação em modo de desenvolvimento.
Abra [http://localhost:3000](http://localhost:3000) para visualizar no navegador.

### `npm test`

Executa a suíte de testes em modo watch.

### `npm run build`

Gera a build de produção na pasta `build`.

### `npm run dev`

Inicia o servidor local e o cliente React em paralelo.
