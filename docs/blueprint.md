# **App Name**: PassFlow

## Core Features:

- Configuração Administrativa: Configuração administrativa de tipos de serviço, balcões (guichês), categorias de serviço e a capacidade de vincular balcões a categorias de serviço específicas.
- Seleção de Senha: Página principal para selecionar senhas para cada tipo de serviço, com lógica de prioridade e ponderação aplicada.
- Chamada e Exibição de Senha: Tela para chamar senhas com histórico e uma área de publicidade configurável (imagens, vídeos, links de vídeo do YouTube ou canais abertos de TV).
- Painel do Atendente: Visão do atendente de todas as senhas atuais na fila com a capacidade de iniciar e finalizar o atendimento para cada senha. A UI atua como uma tool, porque pode incluir ou excluir campos menos importantes com base no tempo restante estimado.
- Tela de Chamada de Atenção: Exibição chamativa quando uma senha é chamada para garantir a visibilidade.
- Branding Personalizado: Permitir que o administrador configure as cores e o logotipo para corresponder à sua marca.
- Zerar Senhas: Funcionalidade de zerar as senhas se necessário, vinculadas apenas ao gerente e admin.
- Suporte Offline: Funcionalidade para rodar localmente e sincronizar quando a internet voltar. As telas de senha, chamada e atendimento conseguem se comunicar localmente, mesmo sem internet.
- Gestão por organização e unidades: Fazer a gestão por organização e unidades também, para que cada unidade dentro de uma organização possa gerir seus atendimentos
- Tags e Observações no Atendimento: No atendimento, deixar um espaço para o atendente incluir tags de atendimento e observações
- Docker Support: Permitir rodar toda aplicação em Docker.
- Configuração Flexível do Sistema: Deixar a configuração do sistema flexivel, podendo configurar um banco de dados postgres, credenciais do firebase ou definir o armazenamento local com o sqlite

## Style Guidelines:

- Cor primária: HSL 210, 70%, 50% (Hex: #3399CC), um azul vibrante para inspirar confiança e eficiência.
- Cor de fundo: HSL 210, 20%, 95% (Hex: #F0F8FF), um tom muito claro de azul para uma aparência limpa e moderna.
- Cor de destaque: HSL 180, 60%, 40% (Hex: #33CCCC), um ciano contrastante para destacar ações e informações importantes.
- Emparelhamento de fontes: 'Inter' (sans-serif) para títulos e corpo do texto, para uma aparência moderna e objetiva.
- Use ícones simples e claros para representar tipos e categorias de serviço.
- Layout limpo e eficiente otimizado para seleção rápida de senhas e exibição de informações.
- Animações sutis para chamar a atenção para as senhas chamadas e indicar mudanças de status.