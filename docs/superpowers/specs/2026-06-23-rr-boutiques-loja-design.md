# RR Boutiques — Loja Online + Painel de Gestão
**Documento de Especificação (Design)**
Data: 2026-06-23

---

## 1. Visão geral

Site para a loja de roupas **RR Boutiques** (revenda de peças compradas no Brás para o
consumidor final). O sistema tem três partes que se conectam:

1. **Vitrine** — a loja pública, onde o cliente final vê as peças.
2. **Painel** — área interna, onde a dona da loja gerencia produtos, estoque, cupons e finanças.
3. **Banco de dados + fotos** — a "memória" da loja (produtos, vendas, finanças, configurações).

**Modelo de venda (decisão-chave):** Caminho **C** — começa como **vitrine + WhatsApp**
(catálogo, sem checkout/pagamento online no site), com a estrutura **já preparada** para plugar
pagamento online (Pix automático + cartão) no futuro, sem refazer o sistema.

**Quem opera:** apenas a esposa do solicitante, **sem familiaridade técnica**. O painel precisa
ser simples e à prova de erro.

**Custo:** R$0/mês de hospedagem e infraestrutura (camadas gratuitas). Único custo opcional
futuro: domínio próprio (~R$40/ano).

---

## 2. Stack tecnológica (tudo em camada gratuita)

| Parte | Ferramenta | Função | Custo |
|------|-----------|--------|-------|
| Site (vitrine + painel) | Next.js (App Router) na Vercel | Aplicação web | R$0 |
| Banco de dados | Supabase (Postgres) | Produtos, vendas, finanças | R$0 |
| Fotos | Supabase Storage | Imagens das peças | R$0 |
| Login do painel | Supabase Auth | Acesso restrito da dona | R$0 |
| Compra | Link direto para WhatsApp | Fechamento da venda | R$0 |

Decisões alinhadas com o ecossistema Vercel: Next.js App Router, hospedagem Vercel,
banco/armazenamento/auth via Supabase (Marketplace).

---

## 3. Vitrine (área pública)

Mobile-first (a maioria acessa pelo celular). Telas:

1. **Home** — banner principal editável; vitrine de destaques; atalhos de categorias; busca.
2. **Listagem / categoria** — grade de produtos (foto, nome, preço, preço riscado se houver
   desconto); filtros por categoria, tamanho, cor e faixa de preço; ordenação (mais recentes,
   menor/maior preço); selos de "Promoção" e "Esgotado".
3. **Página do produto** — galeria de fotos com zoom; nome, descrição, preço (desconto
   destacado); seleção de tamanho/cor quando a peça tiver grade (mostrando disponibilidade);
   aviso de estoque baixo; botão **"Comprar pelo WhatsApp"** que abre o zap com a peça
   pré-preenchida na mensagem.
4. **Carrinho de orçamento** (Fase 2) — juntar várias peças e enviar tudo numa única mensagem
   de WhatsApp. Não é checkout com pagamento.
5. **Páginas de apoio** — Sobre, Política de troca, Contato/WhatsApp, redes sociais; rodapé com
   chave Pix e formas de pagamento (informativo).

**Regras de comportamento:**
- Só aparece o que a dona liberar: cada produto tem interruptor "visível na loja". Peça oculta
  ou sem foto não aparece.
- **Preço de custo e dados financeiros nunca aparecem na vitrine.**
- Cupom pode ser divulgado em banner; na fase WhatsApp o desconto é confirmado no atendimento.

---

## 4. Painel de gestão (área interna)

Acesso por login/senha. Simples, em linguagem do dia a dia, com confirmações antes de ações
destrutivas. Módulos:

1. **Início** — resumo do dia: produtos ativos, estoque baixo, lucro do mês, vendas da semana;
   atalhos para "Cadastrar peça" e "Registrar venda".
2. **Produtos** — lista com foto/preço/estoque e interruptor "Visível na loja"; cadastro/edição
   com: fotos (várias, arrastar e soltar), nome, descrição, categoria, **preço de custo**
   (privado), **preço de venda**, **desconto** (% ou valor), tipo (simples ou com grade),
   estoque (total ou por tamanho/cor), marcação de **destaque**.
3. **Categorias** — criar/editar categorias e subcategorias.
4. **Cupons** — criar/editar cupom (código, % ou valor, validade, limite de uso); ligar/desligar.
5. **Financeiro** (completo): registrar venda (baixa estoque automático), registrar despesa
   (Brás, sacolas, embalagem etc.), painel de lucro por mês (entrou × custo × despesas × lucro
   líquido), "investido em estoque" (custo das peças não vendidas), relatórios por período.
6. **Configurações** — WhatsApp, chave Pix, redes sociais, banner da home, textos das páginas
   (Sobre, Trocas), nome e logo da loja.

**Cuidados:** dados de custo/financeiro são privados (vivem só no painel); ações destrutivas
pedem confirmação clara.

---

## 5. Modelo de dados (gavetas e relações)

```
CATEGORIA (1) ──< PRODUTO (N)
PRODUTO  (1) ──< FOTO (N)
PRODUTO  (1) ──< VARIAÇÃO (N)        # só para peças com grade (tamanho/cor + estoque)
VENDA    (1) ──< ITEM_DA_VENDA (N) >── PRODUTO/VARIAÇÃO
```

| Entidade | Campos principais | Observações |
|----------|-------------------|-------------|
| **Produto** | nome, descrição, preço_custo 🔒, preço_venda, desconto, visível, destaque, categoria | base do catálogo |
| **Variação** | tamanho, cor, estoque | só em peças "com grade"; peça simples usa estoque no próprio produto |
| **Foto** | url, ordem | galeria; primeira = principal |
| **Categoria** | nome, categoria_pai (opcional) | suporta subcategorias |
| **Cupom** | código, tipo (%/valor), valor, validade, limite_uso, ativo | promoções |
| **Venda** | data, total, cupom_usado | base do lucro |
| **Item da venda** | produto/variação, quantidade, valor_unitário | compõe a venda; baixa estoque |
| **Despesa** | descrição, valor, data, tipo (Brás/embalagem/outro) | fluxo de caixa |
| **Config da loja** | whatsapp, pix, banner, textos, logo, redes | identidade e contatos |
| **Usuário** | e-mail, senha (via Supabase Auth) | acesso da dona |

**Preparado para o futuro (Caminho C):** a entrada de pagamento online (Fase 3) entra como uma
nova entidade **Pagamento** ligada à Venda, sem alterar as demais gavetas.

**Cálculos derivados:** lucro = vendas − custo das peças vendidas − despesas; investido em
estoque = soma do custo das peças não vendidas; estoque baixo = abaixo de um limite configurável.

---

## 6. Fases de lançamento

### Fase 1 — Loja no ar (MVP)
- Login do painel.
- Produtos (simples e com grade), fotos, categorias, preços, desconto, estoque, visível/destaque.
- Vitrine: home, listagem com filtros, página do produto, botão "Comprar pelo WhatsApp".
- Configurações básicas (WhatsApp, Pix informativo, banner, logo).
- **Resultado:** loja real no ar, vendendo pelo WhatsApp.

### Fase 2 — Controle do negócio
- Financeiro completo (vendas, despesas, painel de lucro, investido em estoque, relatórios).
- Cupons de desconto.
- Carrinho de orçamento (várias peças num único WhatsApp).
- Refinos de painel (estoque baixo, busca, relatórios).

### Fase 3 — Evoluções (quando o negócio pedir)
- Pagamento online (Pix automático + cartão via gateway — ex.: Mercado Pago).
- Domínio próprio.
- Cadastro/login de clientes, lista de desejos.
- Cálculo de frete / integração com transportadora.
- Instagram shopping, e-mail marketing.

Nada construído nas fases anteriores é descartado: tudo se encaixa no modelo da Seção 5.

---

## 7. Visual / identidade

O visual da vitrine será definido depois, a partir de referências fornecidas pelo solicitante
(logo, cores da marca, prints de sites de referência — ex.: Lojas Renner). A estrutura é
independente do visual, então o tema pode ser ajustado sem alterar a lógica do sistema.

---

## 8. Decisões registradas

- Modelo de venda: **C** (vitrine + WhatsApp agora; pagamento online preparado para depois).
- Produtos: **mistos** (simples e com grade de tamanho/cor).
- Financeiro: **completo** (custo, vendas, despesas, fluxo de caixa).
- Operação: somente a dona, sem perfil técnico → painel à prova de erro.
- Custo: **R$0/mês** (camadas gratuitas); domínio próprio opcional no futuro.
- Construção: **sob medida** (Caminho 2), entregue em **3 fases**.

---

## 9. Fora de escopo (por enquanto)

- Checkout com pagamento no site (vai para a Fase 3).
- Cálculo de frete automático (Fase 3).
- Multi-usuário / múltiplas lojas.
- App nativo (o site será responsivo, acessível pelo navegador do celular).
