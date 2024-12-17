# Analise
![Logo do projeto](../../../../imagens/icon256x256.png)

# raw
O método **raw** serve para converter os dados da Matrix do DataStructure para um formato de matriz em JavaScript nativo. 

Abaixo você verá exemplos de uso desse método **raw**. Mais para ficar mais fácil de entender, considere o seguinte objeto DataStructure:
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

# EXEMPLO DE USO
```javascript

var dadosBrutos = dataset.raw();

console.log( dadosBrutos );

```

# RESULTADO:
```javascript
[ 'William', 21 ]
[ 'Rafael',  25 ]
[ 'Daniel',  19 ]
[ 'Danilo',  20 ]
```

Isso retorna os dados como eles realmente são. 

# Menu
[Voltar](../page.md)
