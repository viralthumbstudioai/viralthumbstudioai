 # Guia de Configuração: Viral Thumb Studio IA

Este guia passo-a-passo ajudará você a configurar os serviços externos necessários (Supabase e Vercel) para colocar seu aplicativo no ar.

## 1. Configuração do Supabase (Banco de Dados e Auth)

1.  Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard) e faça login.
2.  Clique em **"New Project"**.
3.  Escolha sua organização, dê um nome (ex: `viral-thumb-studio`) e defina uma senha forte para o banco de dados.
4.  Selecione a região mais próxima (ex: `South America (São Paulo)`).
5.  Clique em **"Create new project"**.
6.  Aguarde a configuração do projeto (pode levar alguns minutos).

### Obter Credenciais
1.  No painel do seu projeto, vá em **Project Settings** (ícone de engrenagem) > **API**.
2.  Anote a **Project URL** (esta será sua `VITE_SUPABASE_URL`).
3.  Anote a chave **anon public** (esta será sua `VITE_SUPABASE_ANON_KEY`).

### Configuração do Storage (Opcional - Se usar upload de imagens)
1.  No menu lateral, clique em **Storage**.
2.  Crie um novo *Bucket* chamado `images`.
3.  Defina como **Public**.

## 2. Configuração Local

1.  Abra o arquivo `.env.local` na raiz do projeto.
2.  Substitua os valores pelos que você copiou do Supabase:

```env
VITE_SUPABASE_URL=sua_url_do_projeto_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_key_supabase
# A chave do Gemini será configurada apenas na Vercel para segurança, 
# mas se quiser testar localmente as funções da API, você precisará usar 
# 'vercel dev' (requer Vercel CLI) ou colocar aqui temporariamente.
```

## 3. Configuração da Vercel (Deploy)

1.  Acesse [https://vercel.com](https://vercel.com) e faça login (recomendo usar sua conta do GitHub).
2.  Clique em **"Add New..."** > **"Project"**.
3.  Importe o repositório do GitHub onde este código está hospedado.
4.  Configure o projeto:
    - **Framework Preset**: Vite (deve ser detectado automaticamente).
    - **Root Directory**: `./` (padrão).
5.  **Environment Variables** (IMPORTANTE):
    Adicione as seguintes variáveis:
    
    | Nome | Valor |
    |------|-------|
    | `VITE_SUPABASE_URL` | (Sua URL do Supabase) |
    | `VITE_SUPABASE_ANON_KEY` | (Sua chave Anon do Supabase) |
    | `GEMINI_API_KEY` | (Sua chave da API do Google Gemini) |

6.  Clique em **"Deploy"**.

## 4. Testando

Após o deploy, a Vercel fornecerá uma URL (ex: `https://viral-thumb-studio-ia.vercel.app`).
Acesse e teste:
1.  O carregamento da página.
2.  A geração de thumbnails (isso testará a API Serverless e a integração com Gemini).

---

**Nota sobre `api/` functions**:
Este projeto usa Serverless Functions na pasta `api/`. A Vercel detecta e faz o deploy automaticamente. O arquivo `vercel.json` garante que as rotas sejam tratadas corretamente.
