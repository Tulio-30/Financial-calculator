# Financial Calculator

Uma aplicação gratuita e sem fins lucrativos, desenvolvida com base na calculadora HP-12C . Criada para ser acessível a estudantes, professores, contabilistas, economistas e profissionais da área financeira.

## 🚀 Principais Funcionalidades

* **Lógica RPN e Pilha LIFO:** Cálculos encadeados precisos, utilizando a lógica de pilha de 4 níveis (X, Y, Z, T) sem necessidade de parênteses.
* **Matemática Financeira (TVM):** Cálculo exato do Valor no Tempo do Dinheiro (Time Value of Money) (n, i, PV, PMT, FV).
* **Gestão de Memória:** Registos de armazenamento (STO 0-9) e recuperação (RCL 0-9) perfeitamente funcionais.
* **Precisão Bancária:** Sem erros de arredondamento de ponto flutuante, graças à implementação de cálculos numéricos robustos.
* **Histórico de Operações:** Menu lateral interativo para consultar os últimos cálculos e valores guardados.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído para garantir a máxima performance, fiabilidade e portabilidade:

* **React Native & Expo:** Para uma interface de utilizador responsiva, rápida (latência < 100ms) e portabilidade cruzada.
* **TypeScript:** Tipagem forte para garantir uma arquitetura de dados à prova de falhas na gestão da pilha e dos registos financeiros.
* **big.js:** Biblioteca fundamental utilizada no núcleo matemático para garantir precisão absoluta e fiabilidade financeira até à 9ª casa decimal.

## ⚙️ Como Executar o Projeto

1. Certifique-se de que tem o Node.js instalado.
2. Clone este repositório.
3. Instale as dependências na pasta do projeto executando `npm install`.
4. Inicie o servidor com `npx expo start`.

---
*Desenvolvido por Túlio Vinícius Vieira Amorim Pedrosa como Projeto Final.*