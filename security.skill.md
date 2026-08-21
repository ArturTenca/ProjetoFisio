# Security Skill — Healthcare Management App (React)

## Contexto
Aplicação de gerenciamento para clínica de fisioterapia. Lida com dados de
pacientes (nome, contato, histórico clínico, agenda) — dado sensível sob a
LGPD (Lei 13.709/2018, art. 5º, II). Toda decisão de arquitetura deve
priorizar confidencialidade e integridade desses dados antes de conveniência
de desenvolvimento.

Use esta skill para revisar código, sugerir mudanças e sinalizar riscos.

---

## 1. Autenticação e Sessão

- **Nunca** armazenar JWT ou tokens de sessão em `localStorage` ou
  `sessionStorage` — vulnerável a XSS (qualquer script injetado lê o token).
  Use cookies `httpOnly`, `Secure`, `SameSite=Strict` (ou `Lax` se precisar
  de navegação cross-site controlada).
- Access token de vida curta (5–15 min) + refresh token rotativo,
  invalidado no servidor a cada uso.
- Rate limit em endpoints de login (ex: 5 tentativas / 15 min por IP+usuário)
  para mitigar brute force.
- MFA obrigatório para perfis administrativos (secretaria, dono da clínica).
- Logout deve invalidar o token no backend, não só limpar o estado local.

## 2. Autorização (RBAC)

- Defina papéis explícitos: `admin`, `fisioterapeuta`, `recepcao`, `paciente`
  (se houver portal do paciente).
- Toda rota de API valida permissão no backend — **nunca** confie em
  esconder botões/rotas no frontend como controle de acesso.
- Um fisioterapeuta só deve acessar prontuários dos próprios pacientes,
  salvo exceção documentada (ex: cobertura de plantão).

## 3. Proteção contra XSS

- React escapa JSX por padrão — mas fique atento a:
  - `dangerouslySetInnerHTML` (evite; se inevitável, sanitize com `DOMPurify`).
  - Renderização de conteúdo vindo de PDF/upload/anotações de prontuário.
- Configure `Content-Security-Policy` restritiva no servidor/Vercel
  (`default-src 'self'`, sem `unsafe-inline` para scripts quando possível).

## 4. CSRF e Requisições

- Se usar cookies para auth, implemente token CSRF (double-submit cookie)
  em toda requisição que muda estado (POST/PUT/DELETE).
- Se usar Bearer token em header (não cookie), CSRF é mitigado naturalmente
  — mas volte à regra 1 sobre onde guardar o token.

## 5. Validação e Sanitização de Dados

- Validação **sempre no backend**, mesmo que já exista no formulário React
  (Zod, Yup ou similar no client é UX, não segurança).
- Sanitize campos de texto livre (observações clínicas) antes de persistir
  e antes de renderizar.
- Valide tipo, tamanho e conteúdo de uploads (ex: laudo em PDF) —
  nunca confie na extensão do arquivo, verifique o MIME real.

## 6. Dados Sensíveis (LGPD)

- Criptografia em repouso para campos de histórico clínico
  (não só TLS em trânsito).
- Log de acesso a prontuário: quem acessou, quando, qual paciente —
  auditoria é exigência prática de compliance em saúde.
- Minimização: não exponha campos sensíveis em respostas de API que não
  precisam deles (ex: listagem de agenda não precisa trazer histórico
  clínico completo).
- Defina política de retenção/exclusão de dados de paciente inativo.

## 7. Dependências e Build

- `npm audit` (ou `pnpm audit`) integrado ao CI, falhando build em
  vulnerabilidades `high`/`critical`.
- Dependabot ou Renovate ativo no repositório.
- Nunca commitar `.env` — confirme `.gitignore` cobre isso. Segredos via
  variáveis de ambiente do Vercel, nunca hardcoded.

## 8. Headers e Infraestrutura

- Force HTTPS (Vercel já faz isso por padrão — confirme redirect ativo).
- Headers de segurança: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY` (evita clickjacking no painel administrativo).
- CORS restrito ao domínio real da aplicação, nunca `*` em produção.

## 9. Checklist rápido para o Cursor aplicar em toda PR

- [ ] Token de auth não está em localStorage/sessionStorage
- [ ] Rota nova tem checagem de role no backend
- [ ] Input de usuário validado no servidor
- [ ] Nenhum segredo/API key hardcoded no código
- [ ] Campo sensível não vaza em resposta de API desnecessária
- [ ] Dependência nova não introduz CVE conhecida
