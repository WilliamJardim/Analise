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
    { nome: 'William', cf: 27, idade: 42, numero1: 19, numero2: 40, numero3: 40, numero4: 40 },
    { nome: 'Rafael',  cf: 28, idade: 25, numero1: 19, numero2: 40, numero3: 40, numero4: 40 },
    { nome: 'Daniel',  cf: 29, idade: 19, numero1: 19, numero2: 40, numero3: 40, numero4: 40 },
    { nome: 'Danilo',  cf: 30, idade: 32, numero1: 19, numero2: 40, numero3: 40, numero4: 40 }

], {
    flexibilidade  : ['texto', 'numero', 'numero', 'numero', 'numero', 'numero', 'numero']
});

var dataset2 = Analise.DataStructure([
    { nome: 'William', cf: 27, cargo: 'DEV', outro: 45 },
    { nome: 'Rafael',  cf: 28, cargo: 'APICULTOR', outro: 45 },
    { nome: 'NAO SEI', cf: 29, cargo: 'DEV', outro: 45 },
    { nome: 'Danilo',  cf: 30, cargo: 'DEV', outro: 45 },
    { nome: 'Lucas',   cf: 31, cargo: 'AGRICULTOR', outro: 48}
], {
    flexibilidade  : ['texto', 'numero',  'texto', 'numero']
});