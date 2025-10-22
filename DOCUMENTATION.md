# ISP CTO Manager - Documentação Completa

**Versão:** 1.0.0 (MVP)  
**Autor:** Manus AI  
**Data:** Outubro de 2025

---

## Sumário Executivo

O **ISP CTO Manager** é um sistema completo de gestão de Caixas de Terminação Óptica (CTOs) e clientes para provedores de internet (ISPs). A aplicação foi desenvolvida para atender três perfis de usuários distintos: equipes técnicas de campo, equipes de atendimento e suporte interno.

Este documento descreve a arquitetura, as funcionalidades implementadas, o modelo de dados e as instruções para executar, testar e implantar a aplicação em ambiente de produção.

---

## Arquitetura da Solução

A aplicação foi desenvolvida seguindo uma **arquitetura de três camadas** (three-tier architecture), separando claramente a lógica de apresentação, a lógica de negócio e a camada de dados.

### Componentes Principais

| Componente | Tecnologia | Responsabilidade |
|:-----------|:-----------|:-----------------|
| **Backend (API)** | NestJS (Node.js + TypeScript) | Lógica de negócio, validação, comunicação com banco de dados, exposição de endpoints REST |
| **Frontend Web** | React (Vite + TypeScript) | Interface web para equipes de escritório, visualização de mapas, dashboards |
| **Frontend Mobile** | React Native (Expo + TypeScript) | Aplicativo móvel para equipes de campo, cadastro in-loco, uso de GPS |
| **Banco de Dados** | PostgreSQL | Armazenamento persistente de CTOs, clientes e conexões |

### Diagrama de Arquitetura

```
┌──────────────────┐         ┌──────────────────┐
│   Frontend Web   │         │  Frontend Mobile │
│     (React)      │         │ (React Native)   │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         │   HTTP/REST API            │
         └────────────┬───────────────┘
                      │
            ┌─────────▼──────────┐
            │   Backend (API)    │
            │      (NestJS)      │
            └─────────┬──────────┘
                      │
                      │  TypeORM
                      │
            ┌─────────▼──────────┐
            │   PostgreSQL DB    │
            └────────────────────┘
```

---

## Modelo de Dados

O banco de dados foi projetado com três entidades principais que representam o domínio do problema.

### Entidade: `ctos`

Representa uma Caixa de Terminação Óptica física instalada na rede.

| Campo | Tipo | Descrição |
|:------|:-----|:----------|
| `id` | UUID | Identificador único (chave primária) |
| `name` | VARCHAR | Nome/ID da CTO (ex: "CTO-01-Centro") |
| `latitude` | DECIMAL | Latitude geográfica |
| `longitude` | DECIMAL | Longitude geográfica |
| `splitterType` | VARCHAR | Tipo do splitter (ex: "1x8", "1x16", "1x32") |
| `totalPorts` | INTEGER | Número total de portas disponíveis |
| `status` | ENUM | Status da CTO ("ATIVA", "PLANEJADA", "MANUTENCAO") |
| `installationDate` | DATE | Data de instalação (opcional) |
| `createdAt` | TIMESTAMP | Data de criação do registro |
| `updatedAt` | TIMESTAMP | Data da última atualização |

### Entidade: `client_connections`

Representa a conexão de um cliente a uma porta específica de uma CTO.

| Campo | Tipo | Descrição |
|:------|:-----|:----------|
| `id` | UUID | Identificador único (chave primária) |
| `ctoId` | UUID | Referência à CTO (chave estrangeira) |
| `portNumber` | INTEGER | Número da porta do splitter (1 a N) |
| `contractId` | VARCHAR | ID do contrato do cliente |
| `onuSerialNumber` | VARCHAR | Serial number da ONU do cliente |
| `connectionDate` | DATE | Data de conexão do cliente (opcional) |
| `createdAt` | TIMESTAMP | Data de criação do registro |
| `updatedAt` | TIMESTAMP | Data da última atualização |

### Relacionamentos

-   Uma **CTO** pode ter **muitas** conexões de clientes (1:N).
-   Uma **conexão de cliente** pertence a **uma** CTO (N:1).
-   Existe uma **constraint única** em `(ctoId, portNumber)` para garantir que uma porta não seja ocupada por mais de um cliente.

---

## Funcionalidades Implementadas (MVP)

### 1. Gestão de CTOs

-   **Cadastro de CTO:** Permite registrar uma nova caixa com nome, localização geográfica, tipo de splitter e status.
-   **Edição de CTO:** Permite atualizar informações de uma CTO existente.
-   **Visualização de Detalhes:** Exibe informações completas de uma CTO, incluindo a lista de portas e seus respectivos status (livre/ocupada).
-   **Exclusão de CTO:** Permite remover uma CTO do sistema (funcionalidade disponível via API, não exposta no MVP do frontend).

### 2. Gestão de Conexões de Clientes

-   **Conectar Cliente:** Permite vincular um cliente (ID do contrato + serial da ONU) a uma porta específica de uma CTO.
-   **Desconectar Cliente:** Permite remover a conexão de um cliente de uma porta.
-   **Busca de Cliente:** Ferramenta de busca que permite encontrar um cliente por ID de contrato ou serial da ONU, retornando sua localização na rede (CTO e porta).

### 3. Visualização em Mapa

-   **Mapa Interativo:** Exibe todas as CTOs cadastradas em um mapa (web e mobile).
-   **Marcadores Coloridos:** As CTOs são representadas por marcadores coloridos que indicam o nível de ocupação:
    -   **Verde:** Ocupação baixa (0-50%)
    -   **Amarelo:** Ocupação moderada (51-80%)
    -   **Vermelho:** Ocupação alta (81-100%)
-   **Pop-ups Informativos:** Ao clicar em um marcador, são exibidas informações rápidas sobre a CTO.

### 4. Aplicativo Mobile

-   **Uso de GPS:** O aplicativo mobile captura automaticamente a localização do dispositivo para preencher as coordenadas ao cadastrar uma nova CTO.
-   **Interface Otimizada:** Interface simplificada e otimizada para uso em campo, com foco em velocidade e praticidade.

---

## API REST - Endpoints Disponíveis

### CTOs

| Método | Endpoint | Descrição |
|:-------|:---------|:----------|
| `POST` | `/ctos` | Criar uma nova CTO |
| `GET` | `/ctos` | Listar todas as CTOs |
| `GET` | `/ctos/occupancy-stats` | Listar CTOs com estatísticas de ocupação |
| `GET` | `/ctos/:id` | Obter detalhes de uma CTO específica |
| `PATCH` | `/ctos/:id` | Atualizar uma CTO |
| `DELETE` | `/ctos/:id` | Excluir uma CTO |

### Conexões de Clientes

| Método | Endpoint | Descrição |
|:-------|:---------|:----------|
| `POST` | `/client-connections` | Conectar um cliente a uma porta |
| `GET` | `/client-connections` | Listar todas as conexões |
| `GET` | `/client-connections/search/contract/:contractId` | Buscar conexão por ID de contrato |
| `GET` | `/client-connections/search/onu/:onuSerial` | Buscar conexões por serial da ONU |
| `GET` | `/client-connections/ports-status/:ctoId` | Obter status de todas as portas de uma CTO |
| `GET` | `/client-connections/:id` | Obter detalhes de uma conexão |
| `PATCH` | `/client-connections/:id` | Atualizar uma conexão |
| `DELETE` | `/client-connections/:id` | Desconectar um cliente |

---

## Roadmap para Desenvolvimento Futuro

A arquitetura modular foi projetada para suportar as seguintes evoluções:

### 1. Integração com OLTs

**Objetivo:** Coletar dados em tempo real das OLTs (Optical Line Terminals) para enriquecer as informações dos clientes.

**Dados a serem coletados:**
-   Nível de sinal da ONU (RX Power)
-   Slot e PON de conexão
-   Distância da ONU até a OLT
-   Status operacional da ONU

**Abordagem Técnica:**
-   Criar um microsserviço dedicado para comunicação com OLTs (via SNMP, Telnet, SSH, ou APIs proprietárias).
-   Implementar um job agendado (cron) para coleta periódica de dados.
-   Armazenar os dados coletados em novas tabelas no banco de dados.
-   Expor novos endpoints na API para consumo pelos frontends.

### 2. Sincronização com ERP/CRM (MySQL)

**Objetivo:** Enriquecer os dados dos clientes com informações do sistema de gestão do provedor.

**Dados a serem sincronizados:**
-   Endereço completo do cliente
-   Status financeiro do contrato (ativo, inadimplente, cancelado)
-   Histórico de chamados e visitas técnicas
-   Plano contratado e velocidade

**Abordagem Técnica:**
-   Criar um serviço de ETL (Extract, Transform, Load) para sincronização de dados.
-   Implementar um job agendado para sincronização periódica ou usar triggers no banco de dados externo.
-   Criar novas tabelas ou campos para armazenar os dados sincronizados.
-   Implementar filtros e dashboards no frontend para visualização dos dados enriquecidos.

---

## Como Executar o Projeto

### Pré-requisitos

-   **Node.js** 20+
-   **pnpm** (gerenciador de pacotes)
-   **PostgreSQL** 15+
-   **Docker** e **Docker Compose** (para implantação containerizada)

### Execução Local (Desenvolvimento)

1.  **Clonar o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd isp-cto-manager
    ```

2.  **Configurar o banco de dados:**
    ```bash
    sudo -u postgres psql
    CREATE DATABASE isp_cto_manager;
    CREATE USER isp_admin WITH PASSWORD 'sua_senha';
    GRANT ALL PRIVILEGES ON DATABASE isp_cto_manager TO isp_admin;
    \q
    ```

3.  **Configurar variáveis de ambiente:**
    -   Editar o arquivo `/backend/.env` com as credenciais do banco de dados.

4.  **Instalar dependências e iniciar o backend:**
    ```bash
    cd backend
    pnpm install
    pnpm run start:dev
    ```

5.  **Instalar dependências e iniciar o frontend web:**
    ```bash
    cd frontend
    pnpm install
    pnpm run dev
    ```

6.  **Instalar dependências e iniciar o app mobile:**
    ```bash
    cd mobile
    pnpm install
    pnpm start
    ```

### Execução com Docker (Produção)

Consulte o arquivo `DEPLOYMENT.md` para instruções detalhadas sobre como implantar a aplicação usando Docker e Docker Compose.

---

## Considerações de Segurança

Para um ambiente de produção, recomenda-se:

-   **Alterar as senhas padrão** do banco de dados.
-   **Implementar autenticação e autorização** (JWT, OAuth2) na API.
-   **Usar HTTPS** para todas as comunicações (certificado SSL/TLS).
-   **Implementar rate limiting** para proteger a API contra abusos.
-   **Realizar backups regulares** do banco de dados.

---

## Conclusão

O **ISP CTO Manager** MVP foi desenvolvido com foco em escalabilidade, modularidade e usabilidade. A arquitetura permite a fácil adição de novas funcionalidades, como a integração com OLTs e sistemas de gestão, sem a necessidade de refatoração significativa do código existente.

Para dúvidas ou suporte, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.

