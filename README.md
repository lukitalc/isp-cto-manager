# ISP CTO Manager - Sistema de Gestão de CTOs e Clientes

Este repositório contém o código-fonte completo para o MVP (Produto Mínimo Viável) do **ISP CTO Manager**, uma aplicação desenvolvida para provedores de internet (ISPs) gerenciarem de forma eficiente suas Caixas de Terminação Óptica (CTOs) e os clientes conectados a elas.

O sistema foi desenvolvido seguindo as melhores práticas de arquitetura de software, com uma abordagem modular que facilita a manutenção e a adição de novas funcionalidades no futuro.

---

## Arquitetura e Tecnologias

A aplicação é composta por três partes principais:

1.  **Backend (API RESTful):** Desenvolvido em **Node.js** com o framework **NestJS**, responsável por toda a lógica de negócio, comunicação com o banco de dados e por servir os dados para os frontends. A escolha pelo NestJS se deu por sua arquitetura robusta e modular baseada em TypeScript.
2.  **Frontend (Web):** Uma aplicação web rica e interativa, desenvolvida em **React** com **Vite**, para uso das equipes de escritório (atendimento, suporte, administrativo). O foco é a visualização de dados em dashboards e mapas.
3.  **Frontend (Mobile):** Um aplicativo móvel para **Android** e **iOS**, desenvolvido em **React Native** com **Expo**, focado na usabilidade em campo para as equipes técnicas. Permite o cadastro e gerenciamento de CTOs e clientes diretamente do local de instalação.

### Tecnologias Utilizadas

| Componente      | Tecnologia Principal | Banco de Dados      | Bibliotecas Chave                                        |
| :-------------- | :------------------- | :------------------ | :------------------------------------------------------- |
| **Backend**     | NestJS (Node.js)     | PostgreSQL          | `TypeORM`, `class-validator`, `pg`                       |
| **Frontend Web**| React (Vite)         | N/A                 | `React Leaflet`, `Axios`, `React Router DOM`             |
| **App Mobile**  | React Native (Expo)  | N/A                 | `React Native Maps`, `Expo Location`, `Axios`            |

---

## Estrutura do Repositório

O projeto está organizado nos seguintes diretórios:

-   `/backend`: Contém toda a aplicação da API NestJS.
-   `/frontend`: Contém a aplicação web em React.
-   `/mobile`: Contém o aplicativo móvel em React Native.

Cada diretório possui seu próprio `README.md` com instruções detalhadas sobre como configurar e executar cada parte da aplicação.

---

## Funcionalidades do MVP

-   **Cadastro e Edição de CTOs:**
    -   Informações: Nome/ID, localização geográfica (latitude/longitude), tipo de splitter (1x8, 1x16), status.
    -   Uso do GPS do celular para captura de coordenadas no app mobile.
-   **Gestão de Conexões de Clientes:**
    -   Vinculação de um cliente (ID do Contrato e Serial da ONU) a uma porta específica de uma CTO.
    -   Desconexão de clientes.
-   **Visualização em Mapa:**
    -   Mapa interativo (web e mobile) exibindo todas as CTOs.
    -   Marcadores coloridos indicam a taxa de ocupação de cada caixa (Verde: baixa, Amarelo: moderada, Vermelho: alta).
    -   Pop-ups com detalhes rápidos ao clicar em uma CTO.
-   **Busca Rápida:**
    -   Ferramenta de busca na aplicação web para encontrar um cliente por ID de contrato ou serial da ONU, mostrando sua localização física na rede.

---

## Roadmap para o Futuro

A arquitetura modular foi planejada para suportar as seguintes evoluções:

1.  **Integração com OLTs:**
    -   Um microsserviço dedicado será criado para se comunicar com as OLTs (via SNMP, Telnet, etc.).
    -   **Objetivo:** Coletar dados em tempo real, como nível de sinal da ONU, slot/PON de conexão e distância, enriquecendo a visão do cliente na aplicação.

2.  **Sincronização com Banco de Dados Externo (MySQL):**
    -   Um serviço de ETL (Extração, Transformação e Carga) será desenvolvido para sincronizar dados do ERP/CRM do provedor.
    -   **Objetivo:** Trazer informações como endereço completo do cliente, status financeiro do contrato e histórico de chamados para dentro da plataforma, centralizando a visão 360º do cliente.

---

## Como Começar

Para executar o projeto, siga as instruções contidas nos arquivos `README.md` de cada subdiretório (`/backend`, `/frontend`, `/mobile`).

É necessário ter **Node.js**, **pnpm** e **PostgreSQL** instalados no ambiente de desenvolvimento.

