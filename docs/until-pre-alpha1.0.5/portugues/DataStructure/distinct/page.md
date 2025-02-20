# 📊 Analise
![Logo do projeto](../../../../imagens/icon256x256.png)

# distinct
O método **distinct** serve para remover amostras duplicadas do seu DataStructure. Ele retorna um novo DataStructure limpo, com essas amostras duplicadas removidas.

Abaixo você verá exemplos de uso desse método **distinct**. Mais para ficar mais fácil de entender, considere o seguinte objeto DataStructure:
```javascript
var dataset = Analise.DataStructure([
    { nome: 'William', idade: 21 },
    { nome: 'William', idade: 21 },
    { nome: 'William', idade: 21 },
    { nome: 'William', idade: 21 },
    { nome: 'Rafael',  idade: 25 },
    { nome: 'Daniel',  idade: 19 },
    { nome: 'Danilo',  idade: 20 }

], {
    flexibilidade  : ['texto', 'numero']
});
```

Nesse DataStructure de exemplo, temos 7 amostras, porém, dessas, 4 são exatamente iguais. As 4 primeiras amostras do William são amostras repetidas, e não queremos isso. Então precisamos remover essas amostras. 

# EXEMPLO DE USO
```javascript

var dataset_unico = dataset.distinct();

console.log( dataset_unico.raw() )

```

# RESULTADO:
```javascript
[
   [ 'William', 21 ],
   [ 'Rafael',  25 ],
   [ 'Daniel',  19 ],
   [ 'Danilo',  20 ],
]
```

Isso retorna os dados sem repetir amostras. Ou seja, ele removeu 3 amostras do William que estavam duplicadas. 

# Menu
[Voltar](../page.md)
