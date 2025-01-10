# 📊 Analise
![Logo do projeto](../../../../imagens/icon256x256.png)

# ➕ inserir
O método **Inserir** serve para inserir novas amostras ao DataStructure. 

Abaixo você verá exemplos de uso desse método **Inserir**. Mais para ficar mais fácil de entender, considere o seguinte objeto DataStructure:
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

Agora vejamos alguns exemplos de uso:

# EXEMPLOS DE USO

# ADICIONANDO UMA NOVA AMOSTRA INDIVIDUAL
```javascript

//Adicionando uma nova amostra
dataset.inserir({ nome: 'Pedro', idade: 30 });

```

Também é possivel adicionar várias amostras de uma só vez:

# ADICIONANDO VARIAS AMOSTRAS DE UMA VEZ
```javascript

//Adicionando uma nova amostra
dataset.inserir([
    { nome: 'Pedro',  idade: 30 },
    { nome: 'Luiz',   idade: 30 }
]);

```

**Também é possivel adicionar várias amostras de uma vez usando matrizes:**

```javascript

//Adicionando uma nova amostra
dataset.inserir([
    ['Pedro', 30]
    ['Luiz',  30]
]);

```

# Menu
[Voltar](../page.md)
