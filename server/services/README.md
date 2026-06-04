# Services (regras de negócio)

Decide a permissão de acesso e fluxos.

## Responsabilidade

- Regra de negócio pura
- Decide **o que fazer e o que não fazer**
- Fluxos como:
  - Iniciar reunião
  - Finalizar reunião
  - Gerar PDF
  - Criar encaminhamentos
  - Trocar status

## O que NÃO fazer

- Não acessar **event**
- Não saber nada de HTTP - isso é responsabilidade do Controller gerenciar
- Não acessar diretamente o supabase client global - a ideia é que ele não saiba qual serviço está usando, só executar.



# Services Auxiliares (PDF, Storage, Notificação)

São alguns processos demorados que são feitos no servidor e não no frontend.

## Responsabilidade

- Fazer **uma coisa bem feita**