var dataset = Analise.DataStructure([
    { nome: 'Sabado', quantidade: 10 },
    { nome: 'Domingo', quantidade: 10 },
    { nome: 'Segunda', quantidade: 40 },
    { nome: 'Terca', quantidade: 48 },
    { nome: 'Quarta', quantidade: 51 },
    { nome: 'Quinta', quantidade: 45 },
    { nome: 'Sexta', quantidade: 35 },
    { nome: 'Sabado', quantidade: 8 },
    { nome: 'Domingo', quantidade: 12 },
    { nome: 'Segunda', quantidade: 18 },
    { nome: 'Terca', quantidade: 22 },
    { nome: 'Quarta', quantidade: 30 },
    { nome: 'Quinta', quantidade: 25 },
    { nome: 'Sexta', quantidade: 40 },
    { nome: 'Sabado', quantidade: 12 },
    { nome: 'Domingo', quantidade: 15 },
    { nome: 'Segunda', quantidade: 19 },
    { nome: 'Terca', quantidade: 18 },
    { nome: 'Quarta', quantidade: 16 },
    { nome: 'Quinta', quantidade: 80 },
    { nome: 'Sexta', quantidade: 52 },
    { nome: 'Sabado', quantidade: 0 },
    { nome: 'Domingo', quantidade: 0 },
    { nome: 'Domingo', quantidade: 5 },
    { nome: 'Domingo', quantidade: 4 },
    { nome: 'Domingo', quantidade: 5 },
    { nome: 'Domingo', quantidade: 0 },
    { nome: 'Domingo', quantidade: 0 },

], {
    flexibilidade  : ['texto', 'numero']
});

const agruparPeloNomeDia = dataset.agrupar('nome');

console.log(agruparPeloNomeDia)