1. Migrar validação para o domínio;
   Lógica de validação de campos passou a ficar dentro dos objetos de domínio.
   Única responsabilidade: cada objeto valida seus dados

   isNotNumberField, isNotStringField> funções usadas em várias validações. DRY.  Melhora de testabilidade.
   JsonPrintOrder, ConsolePrintOrder> logica de print separada. Composição.  Melhora de testabilidade.
   Serviço de notificação faltante criado

2. Separar operações de print para pedidos.
   classe Order separada em Order, OrderInput e OrderSummary.

   OrderSummary> classe filha de OrderSummary. Gera o objeto final de pedido processado.
   Retem a lógica de transformação de OrderInput e OrderPricing para OrderSummary que
   antes ficava em OrderService (proteção de regra de negócio)

   Order ◄─┬──── OrderSummary
           └──── OrderInput

   Herança permite que campos e métodos comuns sejam compartilhados.

3. Descontos, frete e taxas separados em classes de precificação:
   Lógica de cálculo de valor final do pedido separada e protegida.

   Separações baseadas na lógica atual:
   OrderTypeDiscountPricingItem> isola desconto baseado no tipo de consumidor
   CouponCodeDiscountPricingItem> isola desconto baseado em cupons
   HighTicketDiscountPricingItem> isola desconto com base no valor do subtotal
   FreightPricingItem> isola cálculo de adicional do frete
   PaymentMethodPricingItem> isola o cálculo do adicional ou desconto por meio de pagamento

   Classe que calcula total, subtotal e subtotais por item:
   OrderPricing> utiliza as classes que heardam de PricingItem para calcular o total
   subtotal e subtotais por item. Torna o cálculo 100% extensível, pois recebe classes
   que calculam valores adicionais ou descontos por categoria/tipo.

   Porquê? Separa em responsabilidades únicas e torna o cáculo dos valores extensível.
   Composição. Melhora de testabilidade.

4. Repositórios e Serviço de notificação separados e substituíveis
   Checagem de status como confirmado movido para dentro da classe Order
   Composição. Melhora de testabilidade

5. Testes unitários adicionados
   Repositório: https://github.com/gabrielttrevisan/refatoracao-solid
   Código principal adicionado em uma função para melhorar testabilidade.
