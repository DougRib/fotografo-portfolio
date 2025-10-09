# 🎯 GUIA COMPLETO DE SETUP - Portfolio Fotógrafo

## 📂 Estrutura Completa de Pastas e Arquivos

Crie a seguinte estrutura de pastas no seu projeto:

```
fotografo-portfolio/
│
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── leads/
│   │   │   └── route.ts
│   │   ├── projects/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── galleries/
│   │   │   └── route.ts
│   │   ├── images/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── services/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── testimonials/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── uploadthing/
│   │   │   ├── core.ts
│   │   │   └── route.ts
│   │   └── og/
│   │       └── route.tsx
│   │
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── gallery/
│   │   │           └── page.tsx
│   │   ├── leads/
│   │   │   └── page.tsx
│   │   ├── services/
│   │   │   └── page.tsx
│   │   └── testimonials/
│   │       └── page.tsx
│   │
│   ├── portfolio/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── sobre/
│   │   └── page.tsx
│   │
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── alert.tsx
│   │   ├── skeleton.tsx
│   │   └── sonner.tsx
│   │
│   ├── contact-form.tsx
│   ├── project-form.tsx
│   ├── project-gallery.tsx
│   ├── project-actions.tsx
│   ├── gallery-manager.tsx
│   ├── dashboard-nav.tsx
│   ├── user-nav.tsx
│   ├── theme-toggle.tsx
│   └── theme-provider.tsx
│
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   └── utils.ts
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
│   ├── favicon.ico
│   ├── og-image.jpg
│   └── grid.svg
│
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env.example
├── .env (criar localmente - NÃO commitar)
├── .gitignore
└── README.md
```

---

## 🚀 Passo a Passo para Criar o Projeto

### Passo 1: Criar Projeto Next.js

```bash
# Criar novo projeto
npx create-next-app@latest fotografo-portfolio --typescript --tailwind --app --no-src-dir

# Entrar na pasta
cd fotografo-portfolio
```

### Passo 2: Copiar Todos os Arquivos

Todos os arquivos foram criados nos artefatos anteriores. Copie o conteúdo de cada artefato para o arquivo correspondente na estrutura acima.

**ORDEM RECOMENDADA:**

1. **Configuração Base**
   - `package.json`
   - `tsconfig.json`
   - `next.config.ts`
   - `tailwind.config.ts`
   - `.env.example`
   - `.gitignore`

2. **Banco de Dados**
   - `prisma/schema.prisma`
   - `prisma/seed.ts`
   - `lib/prisma.ts`

3. **Estilos**
   - `app/globals.css`
   - `lib/utils.ts`

4. **Componentes UI (shadcn/ui)**
   - Todos os arquivos em `components/ui/`

5. **Autenticação**
   - `lib/auth.ts`
   - `app/api/auth/[...nextauth]/route.ts`
   - `app/login/page.tsx`
   - `middleware.ts`

6. **APIs**
   - Todas as rotas em `app/api/`

7. **Landing Page**
   - `app/layout.tsx`
   - `app/page.tsx`
   - `app/portfolio/page.tsx`
   - `app/portfolio/[slug]/page.tsx`
   - `app/sobre/page.tsx`
   - `components/contact-form.tsx`
   - `components/project-gallery.tsx`
   - `components/theme-provider.tsx`

8. **Dashboard**
   - `app/dashboard/layout.tsx`
   - `app/dashboard/page.tsx`
   - Todas as páginas em `app/dashboard/`
   - Todos os componentes do dashboard em `components/`

### Passo 3: Instalar Dependências

```bash
npm install
```

### Passo 4: Configurar Variáveis de Ambiente

```bash
# Copiar exemplo
cp .env.example .env

# Editar .env e preencher todas as variáveis
nano .env  # ou use seu editor preferido
```

**Variáveis OBRIGATÓRIAS:**

1. **DATABASE_URL**
   - Criar banco no Supabase ou Neon
   - Copiar connection string

2. **UPLOADTHING_TOKEN**
   - Criar conta em https://uploadthing.com
   - Criar app e copiar token

3. **RESEND_API_KEY**
   - Criar conta em https://resend.com
   - Gerar API key

4. **NEXTAUTH_SECRET**
   ```bash
   # Gerar secret
   openssl rand -base64 32
   ```

5. **Variáveis NEXT_PUBLIC_***
   - Preencher com suas informações pessoais

### Passo 5: Configurar Banco de Dados

```bash
# Gerar cliente Prisma
npx prisma generate

# Criar banco e executar migrações
npx prisma migrate dev --name init

# Popular com dados de exemplo
npm run seed
```

### Passo 6: Rodar Projeto

```bash
npm run dev
```

Acesse:
- Site: http://localhost:3000
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard

**Credenciais:**
- Email: o email que você configurou no .env
- Senha: `admin123`

---

## 📋 Checklist de Verificação

Antes de fazer deploy, verifique:

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Banco de dados conectado e migrado
- [ ] Seed executado com sucesso
- [ ] Login funcionando
- [ ] Upload de imagens funcionando
- [ ] Formulário de contato enviando emails
- [ ] Dark mode funcionando
- [ ] Todas as páginas abrindo sem erro
- [ ] CRUD de projetos funcionando
- [ ] CRUD de serviços funcionando
- [ ] CRUD de depoimentos funcionando

---

## 🔧 Configuração de Serviços Externos

### Supabase (Banco de Dados) - RECOMENDADO

1. Acesse https://supabase.com
2. Crie novo projeto
3. Aguarde provisionamento
4. Vá em Settings > Database
5. Copie "Connection string" (modo Connection pooling)
6. Cole em `DATABASE_URL` no .env

### Neon (Alternativa)

1. Acesse https://neon.tech
2. Crie novo projeto
3. Copie connection string
4. Cole em `DATABASE_URL` no .env

### UploadThing (Upload de Imagens)

1. Acesse https://uploadthing.com
2. Faça login com GitHub
3. Crie novo app
4. Copie o token (APP_ID)
5. Cole em `UPLOADTHING_TOKEN` no .env

### Resend (Envio de Emails)

1. Acesse https://resend.com
2. Crie conta
3. Verifique email
4. Vá em API Keys
5. Crie nova API key
6. Cole em `RESEND_API_KEY` no .env
7. Configure domínio (ou use onboarding.resend.dev para testes)

---

## 🌐 Deploy na Vercel

### Passo 1: Preparar Repositório

```bash
# Inicializar git
git init

# Criar .gitignore
echo "node_modules/
.next/
.env
.env.local
.vercel
*.log" > .gitignore

# Fazer commit
git add .
git commit -m "Initial commit: Portfolio completo"

# Criar repo no GitHub e fazer push
git remote add origin <sua-url-do-github>
git branch -M main
git push -u origin main
```

### Passo 2: Importar na Vercel

1. Acesse https://vercel.com
2. Clique "Add New Project"
3. Importe seu repositório do GitHub
4. Configure variáveis de ambiente:
   - Copie TODAS as variáveis do seu .env
   - Cole na seção "Environment Variables"
   - **IMPORTANTE**: Use valores de produção (URLs diferentes)

### Passo 3: Configurar Build

- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Passo 4: Deploy

- Clique "Deploy"
- Aguarde build (~2-3 minutos)
- Projeto estará live!

### Passo 5: Configurar Domínio (Opcional)

1. Vá em Settings > Domains
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. Atualize variáveis:
   - `NEXTAUTH_URL`
   - `NEXT_PUBLIC_SITE_URL`

---

## 🎨 Arquivos Públicos Necessários

Crie estes arquivos na pasta `public/`:

### favicon.ico
Seu ícone do site (16x16 ou 32x32 pixels)

### og-image.jpg
Imagem para compartilhamento social (1200x630 pixels)

### grid.svg (opcional - para background do hero)
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  <defs>
    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/>
    </pattern>
  </defs>
  <rect width="100" height="100" fill="url(#grid)"/>
</svg>
```

---

## 🔐 Segurança - IMPORTANTE!

### Produção - Checklist de Segurança

- [ ] `NEXTAUTH_SECRET` é diferente de dev
- [ ] Database tem SSL habilitado
- [ ] Rate limiting configurado
- [ ] Domínio verificado no Resend
- [ ] 2FA habilitado na Vercel
- [ ] Backups automáticos do banco configurados
- [ ] `.env` NÃO está commitado
- [ ] Passwords hashadas (bcrypt já implementado)
- [ ] CORS configurado corretamente
- [ ] Headers de segurança ativos

### Primeira Senha de Produção

```bash
# Em produção, criar primeiro usuário admin manualmente:
npx prisma studio

# Ou executar seed em produção:
npm run seed
```

**DEPOIS mude a senha através do sistema!**

---

## 🐛 Resolução de Problemas Comuns

### Erro: "Prisma Client not generated"
```bash
npx prisma generate
```

### Erro: "Cannot find module bcryptjs"
```bash
npm install bcryptjs @types/bcryptjs
```

### Erro: "NextAuth session not working"
- Verifique `NEXTAUTH_SECRET` está definido
- Verifique `NEXTAUTH_URL` está correto
- Limpe cookies do navegador

### Erro: "UploadThing upload failed"
- Verifique `UPLOADTHING_TOKEN` está correto
- Teste em https://uploadthing.com/dashboard

### Erro: "Email not sending"
- Verifique `RESEND_API_KEY` está correto
- Verifique domínio verificado no Resend
- Confira `RESEND_FROM_EMAIL` está configurado

### Build Error na Vercel
- Verifique TODAS as variáveis de ambiente estão configuradas
- Rode `npm run build` localmente para testar
- Verifique logs de erro na Vercel

---

## 📚 Recursos e Documentação

- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **NextAuth.js**: https://next-auth.js.org
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **UploadThing**: https://docs.uploadthing.com
- **Resend**: https://resend.com/docs

---

## 🎓 Próximos Passos

1. ✅ **Setup Completo** - FEITO!
2. ✅ **Desenvolvimento** - COMPLETO!
3. 🎯 **Customização**
   - Trocar placeholders
   - Adicionar imagens reais
   - Configurar cores do tema
4. 🚀 **Deploy**
   - Push para GitHub
   - Deploy na Vercel
   - Configurar domínio
5. 📈 **Otimização**
   - Adicionar Analytics
   - Configurar SEO
   - Melhorar Performance

---

## ✨ Resultado Final

Você terá um sistema PROFISSIONAL e COMPLETO com:

✅ Landing page moderna e responsiva
✅ Dashboard administrativo completo
✅ Sistema de autenticação seguro
✅ Upload de imagens com drag-and-drop
✅ Gerenciamento de portfólio
✅ Formulário de contato funcional
✅ Email automático
✅ Dark mode
✅ SEO otimizado
✅ Performance otimizada
✅ 100% TypeScript
✅ Acessível (WCAG AA)

**Pronto para conquistar clientes! 🎉📸**

---

## 💡 Dicas Finais

1. **Faça backups regulares** do banco de dados
2. **Monitore erros** com Sentry ou similar
3. **Teste em diferentes dispositivos**
4. **Otimize imagens** antes do upload
5. **Atualize dependências** regularmente
6. **Documente customizações** que fizer
7. **Use Git** para versionar mudanças

**Boa sorte com seu novo portfolio! 🚀**