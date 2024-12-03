//var dataset = Analise.DataStructure( datasetExemplo );
/*
var dataset = Analise.DataStructure([
    ['William',  1, 2,  3,  4 ],
    ['William',  5, 6,  7,  8 ],
    ['William',  9, 10, 11, 12]

], {
    campos         : ['nome',  'campo1', 'campo2', 'campo3', 'campo4'],
    flexibilidade  : ['texto', 'numero', 'numero', 'numero', 'numero']
});*/

var dataset = Analise.DataStructure([
    { nome: 'William', idade: 42, numero1: 19, numero2: 40, numero3: 40, numero4: 40 },
    { nome: 'Rafael',  idade: 25, numero1: 19, numero2: 40, numero3: 40, numero4: 40 },
    { nome: 'Daniel',  idade: 19, numero1: 19, numero2: 40, numero3: 40, numero4: 40 },
    { nome: 'Danilo',  idade: 32, numero1: 19, numero2: 40, numero3: 40, numero4: 40 }

], {
    flexibilidade  : ['texto', 'numero', 'numero', 'numero', 'numero', 'numero']
});

var dataset2 = Analise.DataStructure([], {
    flexibilidade  : ['texto', 'numero', 'numero', 'numero', 'numero', 'numero']
});