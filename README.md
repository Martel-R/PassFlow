# PassFlow - Sistema de Gestão de Atendimento

PassFlow é um sistema moderno e completo para gerenciamento de filas e senhas de atendimento, construído com tecnologias de ponta para oferecer uma experiência fluida e personalizável.

## ✨ Funcionalidades

- **Emissão de Senhas:** Interface intuitiva para clientes retirarem senhas, com seleção de categoria e tipo de atendimento (normal/prioritário).
- **Impressão de Senha:** Suporte para impressão de senhas físicas no momento da emissão.
- **Painel do Atendente:** Uma interface focada para os atendentes chamarem a próxima senha, rechamarem e finalizarem atendimentos.
- **Tela de Chamada (Display):** Tela pública para exibição das senhas chamadas, com suporte a carrossel de mídias (imagens e vídeos do YouTube).
- **Painel de Administração Completo:**
    - **Dashboard com Métricas:** Visualize estatísticas de atendimento em tempo real.
    - **Gerenciamento de Usuários:** Crie, edite e remova administradores e atendentes.
    - **Configuração do Sistema:** Gerencie serviços, categorias, balcões e tipos de senha com prioridades.
    - **Branding Personalizado:** Altere o nome da organização, o logo e as cores do sistema.
    - **Configuração da Tela:** Personalize o carrossel de publicidade da tela de chamada.

## 🚀 Tecnologias Utilizadas

- **Framework:** Next.js (com App Router)
- **Linguagem:** TypeScript
- **UI:** React, ShadCN UI
- **Estilização:** Tailwind CSS
- **Banco de Dados:** SQLite (via `better-sqlite3`)
- **Estado Global:** Zustand
- **Containerização:** Docker & Docker Compose

## 🚀 Como Começar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 20 ou superior)
- [Docker](https://www.docker.com/products/docker-desktop/) e [Docker Compose](https://docs.docker.com/compose/)

### 1. Rodando com Docker (Recomendado)

A maneira mais simples de rodar o projeto é utilizando Docker.

1.  **Construa a imagem e inicie o container:**
    ```bash
    docker-compose up --build
    ```

2.  A aplicação estará disponível em [http://localhost:9002](http://localhost:9002).

O banco de dados (`passflow.db`) será persistido em um volume do Docker, então seus dados estarão seguros entre reinicializações do container.

### 2. Rodando Localmente (Desenvolvimento)

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
3.  A aplicação estará disponível em [http://localhost:9002](http://localhost:9002).

## 🔑 Acessos e Credenciais

- **Página de Login:** [http://localhost:9002](http://localhost:9002)
- **Retirar Senha:** [http://localhost:9002/get-ticket](http://localhost:9002/get-ticket)
- **Tela de Chamada:** [http://localhost:9002/display](http://localhost:9002/display)

### Credenciais Padrão

- **Administrador:**
  - **Usuário:** `admin`
  - **Senha:** `1234`
- **Atendente:**
  - **Usuário:** `ana`
  - **Senha:** `1234`

Você pode criar mais usuários e alterar senhas no painel de administração.
