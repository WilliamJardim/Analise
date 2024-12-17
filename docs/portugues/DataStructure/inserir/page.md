# Analise
![Logo do projeto](../../imagens/icon256x256.png)

# <DataStructure_instance>.inserir
O método **Inserir** serve para inserir novas amostras ao DataStructure. 

# EXEMPLOS DE USO

# ADICIONANDO UMA NOVA AMOSTRA INDIVIDUAL
```javascript

var dataset = Analise.DataStructure([
    { nome: 'William', idade: 21 },
    { nome: 'Rafael',  idade: 25 },
    { nome: 'Daniel',  idade: 19 },
    { nome: 'Danilo',  idade: 20 }

], {
    flexibilidade  : ['texto', 'numero']
});

//Adicionando uma nova amostra
dataset.inserir({ nome: 'Pedro', idade: 30 });

```

Também é possivel adicionar várias amostras de uma só vez:

# ADICIONANDO VARIAS AMOSTRAS DE UMA VEZ
```javascript

var dataset = Analise.DataStructure([
    { nome: 'William', idade: 21 },
    { nome: 'Rafael',  idade: 25 },
    { nome: 'Daniel',  idade: 19 },
    { nome: 'Danilo',  idade: 20 }

], {
    flexibilidade  : ['texto', 'numero']
});

//Adicionando uma nova amostra
dataset.inserir([
    { nome: 'Pedro',  idade: 30 },
    { nome: 'Luiz',   idade: 30 }
]);
```

# Menu
[Voltar](../page.md)
