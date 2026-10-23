# Organização de arquivos e padrões de código

API REST de barbearia/agendamentos: Node + Express 4 + TypeScript (strict, CommonJS) + Prisma 7 (PostgreSQL via `@prisma/adapter-pg`) + JWT. Textos de erro e mensagens ao usuário em **português**.

## Estrutura de pastas

```
src/
  index.ts                 # bootstrap do app, cors, json, router e error handler global
  routes.ts                # TODAS as rotas (único arquivo de rotas)
  controllers/<dominio>/   # camada HTTP (req/res)
  services/<dominio>/      # regra de negócio + queries Prisma
  middleware/              # middlewares Express (ex.: isAuthenticated)
  prisma/index.ts          # único PrismaClient; importar sempre daqui
  @types/express/index.d.ts# extensão de Request (user_id)
prisma/
  schema.prisma            # modelos
  migrations/              # geradas pelo Prisma; nunca editar as já aplicadas
generated/prisma/          # client gerado (gitignored); nunca editar à mão
```

Domínios atuais: `user`, `cortes` (model `Haircut`), `agendamento` (model `Service`). Pastas de domínio em minúsculas. Domínio novo = uma pasta em `controllers/` e outra em `services/` com o mesmo nome.

## Fluxo obrigatório

`route → (isAuthenticated) → controller → service → prisma`

- **Controller**: lê `req.body/query/user_id`, instancia o service, chama `execute`, devolve `res.json(...)`. Sem regra de negócio, sem Prisma, sem `try/catch` (o handler global em `src/index.ts` responde).
- **Service**: validações, regras de negócio e queries. Não conhece `req`/`res`. Erros de negócio: `throw new Error("mensagem em português")` → o handler devolve `400 { error: message }`.
- Rota nova: registrar em `src/routes.ts`, agrupada por método (post/get/put/delete), uma linha por rota. Públicas só `POST /users` e `POST /session`; o resto com `isAuthenticated`.
- Feature nova entrega junto: model/migration (se houver) + service + controller + rota.

## Nomenclatura e padrão de arquivo

- Uma classe por arquivo, `PascalCase`, exportada no fim: `export { Nome };`.
- Controller: `<Acao><Dominio>Controllers.ts` → classe de mesmo nome, método `handle`.
- Service: `<Acao><Dominio>Services.ts` → classe de mesmo nome, método `execute`.
- Entrada do service tipada por `interface <Acao>Request` no topo do arquivo, desestruturada em `execute({ ... }: XxxRequest)`.
- Imports relativos (`../../services/...`, `../../prisma`).
- Código novo: `camelCase` (`userId`, não `user_id`), paths em minúsculas e sem typos. Não replicar typos existentes (`isAuthentecated`, `agendaemnto`, `handele`, `Servivices`, `/Count`); se renomear algo existente, atualizar arquivo, imports e rotas juntos.

```ts
// controller
class XxxControllers {
  async handle(req: Request, res: Response) {
    const userId = req.user_id;
    const { campo } = req.body;
    const result = await new XxxServices().execute({ userId, campo });
    return res.json(result);
  }
}
export { XxxControllers };

// service
interface XxxRequest { userId: string; campo: string }
class XxxServices {
  async execute({ userId, campo }: XxxRequest) {
    if (!userId || !campo) throw new Error("Preencha todos os campos");
    return prisma.modelo.create({ data: { userId, campo } });
  }
}
export { XxxServices };
```

## Prisma e dados

- `import { prisma } from '../../prisma'`; nunca instanciar outro `PrismaClient`.
- Model novo: `@id @default(uuid())`, `created_at DateTime @default(now())`, `updated_at DateTime? @updatedAt`, `@@map("snake_case_plural")`.
- Schema mudou → `npm run prisma:migrate` (`prisma migrate dev --name <descricao>`) e `npm run prisma:generate`.
- Toda query de dado de usuário filtra por `userId` vindo de `req.user_id` (nunca do body/query); validar que `haircutId`/`serviceId` recebidos pertencem a esse usuário.
- Usar `select` explícito em respostas de `User` (nunca expor `password`); `include` só se a relação for usada.
- Mais de uma tabela alterada → `prisma.$transaction`. Sem `$queryRaw` com input concatenado.
- Regra de negócio existente: usuário free tem no máximo 3 `Haircut`; acima disso exige `subscription.status === "active"`. Fica no service.

## Segurança

- Senha sempre com `bcryptjs`; JWT com `subject = user.id`, segredo em `JWT_SECRET`. Login responde com mensagem genérica ("Email ou senha incorretos!").
- Segredos só via `.env` (`DATABASE_URL`, `JWT_SECRET`); nunca hardcode, log ou commit.
- Validar entrada no service (obrigatórios, tipos, `trim()`); cuidado com `!price` que rejeita `0`.

## Qualidade

- TypeScript estrito: sem `any` (usar `unknown` + narrowing), sem `!` desnecessário; `async/await`.
- Sem `console.log` de debug nem código comentado. Comentários só para o "porquê", curtos, em português.
- Mudanças pequenas e focadas; não refatorar arquivos não relacionados.
- Dependências: preferir as já instaladas (`express`, `cors`, `bcryptjs`, `jsonwebtoken`, `dotenv`, `express-async-errors`, `@prisma/*`).
- Antes de concluir: `npm run typecheck` e, se possível, `npm run dev` para confirmar que compila e a rota responde.

## Scripts

`npm run dev` (tsx watch) · `build` (tsc → `dist/`) · `start` (`node dist/src/index.js`) · `typecheck` · `prisma:generate` · `prisma:migrate` · `prisma:deploy`.
