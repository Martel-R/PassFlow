# Manual de Uso do Sistema PassFlow

Bem-vindo ao PassFlow! Este manual é o seu guia completo para utilizar todas as funcionalidades do nosso sistema de gerenciamento de atendimento.

## Índice

1.  [Para o Cliente: Retirando uma Senha](#1-para-o-cliente-retirando-uma-senha)
2.  [Para o Público: A Tela de Chamada](#2-para-o-público-a-tela-de-chamada)
3.  [Para o Atendente: Operando o Painel](#3-para-o-atendente-operando-o-painel)
4.  [Para o Administrador: Gerenciando o Sistema](#4-para-o-administrador-gerenciando-o-sistema)
    - [Acesso e Visão Geral](#acesso-e-visão-geral)
    - [Dashboard](#dashboard)
    - [Gerenciar Usuários](#gerenciar-usuários)
    - [Gerenciar Serviços](#gerenciar-serviços)
    - [Gerenciar Balcões](#gerenciar-balcões)
    - [Gerenciar Categorias](#gerenciar-categorias)
    - [Gerenciar Tipos de Senha](#gerenciar-tipos-de-senha)
    - [Branding Personalizado](#branding-personalizado)
    - [Configurar Tela de Chamada](#configurar-tela-de-chamada)
    - [Zerar Senhas](#zerar-senhas)

---

## 1. Para o Cliente: Retirando uma Senha

A interface de emissão de senhas é projetada para ser simples e rápida.

**Como acessar:**
-   Acesse a URL principal (ex: `http://localhost:9002`) e clique no botão **"Retirar Senha"**.
-   Ou navegue diretamente para a URL (ex: `http://localhost:9002/get-ticket`).

**Passos para retirar uma senha:**

1.  **Passo 1: Selecione a Categoria**
    -   Na primeira tela, você verá as categorias de atendimento disponíveis (ex: "Atendimento Geral", "Serviços de Caixa").
    -   Clique na categoria desejada.

2.  **Passo 2: Selecione o Serviço**
    -   Após escolher a categoria, os serviços específicos relacionados a ela serão exibidos (ex: "Abertura de Conta", "Pagamento de Contas").
    -   Clique no serviço que você precisa.

3.  **Passo 3: Selecione o Tipo de Senha**
    -   Escolha o seu tipo de atendimento, geralmente entre "Normal" e "Prioritário". A opção "Prioritário" garante que sua senha seja chamada com preferência na fila.

4.  **Confirmação e Impressão**
    -   Uma tela de confirmação aparecerá com o número da sua senha (ex: `P-001` para prioritário, `G-001` para geral).
    -   Você pode clicar em **"Imprimir Senha"** para obter uma versão física ou em **"Fechar"** se não precisar da impressão.
    -   Aguarde sua senha ser chamada na Tela de Chamada.

## 2. Para o Público: A Tela de Chamada

A tela de chamada (`display`) é o painel público que exibe as senhas chamadas em tempo real.

-   **Chamada Atual:** Quando um atendente chama uma senha, uma janela grande e chamativa aparece na tela com um **alerta sonoro**, mostrando o número da senha e o balcão para onde o cliente deve se dirigir.
-   **Histórico de Chamadas:** Na lateral, uma lista exibe as últimas senhas chamadas, para que ninguém perca sua vez.
-   **Carrossel de Mídia:** A área principal da tela é usada para exibir publicidade, que pode ser uma sequência de imagens com tempo de exibição definido ou vídeos do YouTube.

## 3. Para o Atendente: Operando o Painel

O atendente tem um painel focado em gerenciar a fila e os atendimentos.

**Como acessar:**
-   Faça login com seu usuário e senha de atendente na página inicial.
-   Você será redirecionado para o painel do atendente (`/clerk`).

**Funcionalidades:**

-   **Fila de Espera:** Um painel exibe todas as senhas aguardando atendimento, ordenadas por prioridade e ordem de chegada. Você pode ver a senha, o serviço solicitado e há quanto tempo o cliente está esperando.
-   **Chamar Próximo:** Ao clicar no botão **"Chamar Próximo"**, o sistema automaticamente seleciona a próxima senha da fila (respeitando as prioridades) e a exibe na Tela de Chamada. A senha chamada aparece no seu painel de "Atendimento Atual".
-   **Rechamada:** Se um cliente não aparecer, você pode clicar no botão **"Rechamada"** para exibir novamente a senha na tela de chamada com o alerta sonoro.
-   **Iniciar Atendimento:** Ao clicar em **"Iniciar"**, um cronômetro começa a contar o tempo de serviço.
-   **Finalizar Atendimento:** Ao concluir o serviço, clique em **"Finalizar"**. Uma janela se abrirá para que você possa adicionar:
    -   **Observações:** Notas sobre o atendimento.
    -   **Tags:** Palavras-chave separadas por vírgula (ex: `problema_resolvido`, `venda_efetuada`).
    -   Após confirmar, o atendimento é finalizado e você está livre para chamar a próxima senha.

## 4. Para o Administrador: Gerenciando o Sistema

O administrador tem controle total sobre as configurações e o funcionamento do PassFlow.

### Acesso e Visão Geral
-   Faça login com seu usuário e senha de administrador. Você será redirecionado para o painel de administração (`/admin`).
-   O painel apresenta um menu com todas as opções de gerenciamento.

### Dashboard
-   A primeira tela é um dashboard com métricas em tempo real:
    -   Total de senhas emitidas no dia.
    -   Tempo médio de espera e de atendimento.
    -   Número de senhas aguardando na fila.
    -   Gráficos com atendimentos da semana e serviços mais utilizados.
    -   Tabela com os atendimentos mais recentes.

### Gerenciar Usuários
-   Crie, edite e remova usuários (atendentes e outros administradores).
-   Ao criar ou editar um usuário, você pode associá-lo a um balcão de atendimento específico. Um administrador também pode ser associado a um balcão para realizar atendimentos.

### Gerenciar Serviços
-   Defina os serviços que os clientes podem selecionar (ex: "Abertura de Conta").
-   Cada serviço deve ser associado a uma **Categoria** e pode ter um **ícone** (da biblioteca [Lucide](https://lucide.dev/icons/)).

### Gerenciar Balcões
-   Cadastre os balcões físicos de atendimento (ex: "Balcão 01", "Caixa Rápido").
-   Para cada balcão, defina quais **Categorias de Serviço** ele está apto a atender. Isso garante que um atendente em um balcão específico só chame senhas dos serviços que ele pode realizar.

### Gerenciar Categorias
-   Crie categorias para agrupar serviços (ex: "Atendimento Geral", "Serviços de Caixa").
-   Defina um nome e um **ícone** para cada categoria.

### Gerenciar Tipos de Senha
-   Configure os tipos de senha disponíveis (ex: "Normal", "Prioritário").
-   Para cada tipo, você pode definir:
    -   **Nome e Descrição:** Para identificação.
    -   **Prefixo:** Uma letra única que aparecerá na senha (ex: `P` para Prioritário).
    -   **Peso da Prioridade:** Um número que define a ordem na fila. **Quanto maior o número, maior a prioridade**.
    -   **Ícone:** Um ícone para a tela de seleção.

### Branding Personalizado
-   Personalize a aparência do sistema para alinhá-lo à sua marca:
    -   **Nome da Organização:** Aparece no topo das páginas e no título do navegador.
    -   **Logo:** Faça o upload da sua logo.
    -   **Cores do Tema:** Altere as cores primária, de destaque e de fundo para combinar com sua identidade visual.

### Configurar Tela de Chamada
-   Gerencie o carrossel de mídias exibido na tela de chamada.
-   Você pode adicionar múltiplos itens à lista de reprodução:
    -   **Imagem:** Faça o upload de uma imagem e defina por quantos segundos ela deve ser exibida.
    -   **Vídeo do YouTube:** Insira a URL de um vídeo. O sistema esperará o vídeo terminar para passar para a próxima mídia.
    -   Você pode reordenar ou remover itens da lista a qualquer momento.

### Zerar Senhas
-   Na página principal de administração, há uma opção para **"Zerar Todas as Senhas"**.
-   **Atenção:** Esta ação é irreversível e cancela todas as senhas que estão na fila ou em atendimento. Use com cuidado, geralmente no início de um novo dia de trabalho.
