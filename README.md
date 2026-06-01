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
REACT_APP_SUPABASE_ANON_KEY=sua-chave-anon-public
```

A camada de dados usa a tabela documental `public.registros`, em que cada antiga coleção do Firebase é armazenada com os campos:

- `collection`: nome da antiga coleção;
- `document_id`: ID lógico do documento;
- `data`: JSONB com todos os dados do documento.

Execute a migration `supabase/migrations/20260601143000_create_registros_table.sql` no SQL Editor do Supabase ou pelo Supabase CLI antes de usar o sistema.

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
