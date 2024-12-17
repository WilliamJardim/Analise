# Analise
![Logo do projeto](../../../imagens/icon256x256.png)

# 📊 DataStructure
O DataStructure é uma tabela, mais precisamente, ele é um objeto do tipo **[Vectorization.Matrix](https://github.com/WilliamJardim/VectorizationJS/blob/main/Docs/Portugues/Matrix/page.md)** aprimorado com mais métodos e atributos. Ele permite carregar e exportar arquivos em diversos formatos, bem como ler e manipular dados em forma de tabela. Criar e manipular campos especificos, adicionar ou remover amostras individuais ou em massa. Com o DataStructure, podemos fazer diversas operações de análise e manipulação de dados, como junção de outros DataStructures, pesquisas com critérios de busca avançados, criar e remover campos/colunas, e muito mais.

Para fazer essas análises e manipulações, nós temos alguns métodos:

# CRIAÇÂO DE UMA INSTANCIA:
Existem duas maneiras principais de criar um DataStructure. 

# CRIANDO UM NOVO DataStructure usando Array de JSONs
```javascript
var dataset = Analise.DataStructure([
    { nome: 'William', idade: 21 },
    { nome: 'Rafael',  idade: 25 },
    { nome: 'Daniel',  idade: 19 },
    { nome: 'Danilo',  idade: 20 }

], {
    flexibilidade  : ['texto', 'numero']
});
```

Mais existe outra forma de fazer isso também:

# CRIANDO UM NOVO DataStructure usando Array de Arrays
```javascript
var dataset = Analise.DataStructure([
    [ 'William',  21 ],
    [ 'Rafael',   25 ],
    [ 'Daniel',   19 ],
    [ 'Danilo',   20 ]

], {
    campos         : [ 'nome',  'idade' ],
    flexibilidade  : [ 'texto', 'numero']
});
```

Nessa segunda forma, precisamos passar o parametro **campos** para dizer quais são os campos que queremos criar.
E o parametro **flexibilidade** é usado para determinar os tipos dos dados.

**Existem vários métodos que podemos usar. Abaixo você encontrará uma lista:**

# 🛠️ MÈTODOS
- 🔗 [raw](./raw/page.md): Obter o contéudo de forma bruta/crua
- 🔗 [clonar](./clonar/page.md): Fazer uma cópia do objeto
- 🔗 [distinct](./distinct/page.md): Remover valores duplicados
- 🔗 [mergeWith](./mergeWith/page.md): Junção de dados
- ➕ [inserir](./inserir/page.md): Adicionar amostras
- ➕ [adicionarCampo](./adicionarCampo/page.md): Criar um novo campo
- ➕ [adicionarColuna](./adicionarColuna/page.md): Adicionar uma nova coluna
- ➕ [criarColunaCalculada](./criarColunaCalculada/page.md): Criar uma nova coluna calculada
- ❌ [deletarAmostras](./deletarAmostras/page.md): Deletar amostras
- ✂️ [extrairValoresColuna](./extrairValoresColuna/page.md): Extrair valores de uma coluna
- ✂️ [extrairValoresColunas](./extrairValoresColuna/page.md): Extrair valores de várias colunas
- ✂️ [lineRange](./lineRange/page.md): Recortar linhas
- ✂️ [slice](./slice/page.md): Recortar linhas
- 🔍 [findSamples](./findSamples/page.md): Fazer pesquisa de amostras
- 📂 [loadCSV](./loadCSV/page.md): Carregar um arquivo CSV
- 📂 [loadJSON](./loadCSV/page.md): Carregar um arquivo JSON
- 📂 [exportarCSV](./exportarCSV/page.md): Exportar para um arquivo CSV
- 📂 [exportarJSON](./exportarJSON/page.md): Exportar para um arquivo JSON
