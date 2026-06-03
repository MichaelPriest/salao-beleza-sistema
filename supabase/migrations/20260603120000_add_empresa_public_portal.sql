-- Link público e página inicial por empresa/tenant.
-- O frontend monta a URL final em /e/:slug quando o campo linkPublico ainda não existe.

update public.empresas
set data = data
  || jsonb_build_object(
    'slug', coalesce(nullif(data->>'slug', ''), lower(trim(both '-' from regexp_replace(coalesce(data->>'nome', document_id), '[^a-zA-Z0-9]+', '-', 'g')))),
    'linkPublico', coalesce(nullif(data->>'linkPublico', ''), '/e/' || lower(trim(both '-' from regexp_replace(coalesce(data->>'nome', document_id), '[^a-zA-Z0-9]+', '-', 'g')))),
    'sitePublico', coalesce(data->'sitePublico', jsonb_build_object(
      'ativo', true,
      'titulo', coalesce(data->>'nome', 'Beauty Pro'),
      'subtitulo', 'Agende seus serviços online com facilidade.',
      'corPrimaria', '#9c27b0',
      'mostrarServicos', true,
      'mostrarProfissionais', true,
      'mostrarContato', true
    ))
  ),
  updated_at = now()
where data ? 'nome'
  and (not data ? 'slug' or not data ? 'sitePublico' or not data ? 'linkPublico');
