# 📊 Analise
![Logo do projeto](../../../../imagens/icon256x256.png)

# clonar
O método **clonar** serve para fazer uma cópia exata do DataStructure. Isso é muito útil caso você queria fazer alterações nessa cópia sem precisar mexer no original. 

Abaixo você verá exemplos de uso desse método **clonar**. Mais para ficar mais fácil de entender, considere o seguinte objeto DataStructure:
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

var dataset_clonado = dataset.clonar();

console.log( dataset_clonado.raw() )

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

Como você pode ver, os dados do "dataset_clonado" continuaram exatamente os mesmos do "dataset" original.
Isso significa que qualquer alteração que você fizer no "dataset_clonado" nunca irá afetar o "dataset" original.

# Menu
[Voltar](../page.md)
