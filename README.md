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
```

A camada de dados usa a tabela documental `public.registros`, em que cada antiga coleção do Firebase é armazenada com os campos:

- `collection`: nome da antiga coleção;
- `document_id`: ID lógico do documento;
- `data`: JSONB com todos os dados do documento.

Execute a migration `supabase/migrations/20260601143000_create_registros_table.sql` no SQL Editor do Supabase ou pelo Supabase CLI antes de usar o sistema. A chave `sb_secret_...` deve ficar somente em variáveis de ambiente de scripts/servidor, como `SUPABASE_SERVICE_ROLE_KEY`, e nunca deve ser adicionada ao bundle React.

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
