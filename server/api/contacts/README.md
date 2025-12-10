# Contacts

É uma tabela que organiza os contatos de determinado usuário. Para organizar, cada contato deve possuir um id, nome, e-mail, telefone, data de criação e o id do usuário que o cadastrou, que no caso será sempre o usuário logado.

Essa tabela em si é apenas para a gestão do usuário autenticado, são os contatos dele que serão listados no momento de adicionar um participante em uma reunião.

## Estrutura da tabela

create table contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  created_at timestamptz default now()
);

🔑 Cada contato pertence a um usuário (quem cadastrou).