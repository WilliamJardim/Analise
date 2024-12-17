Analise = {};

//Constantes
Analise.IGNORE = '$#_IGNORE_CAMPO'; //Usado para ignorar um campo quando vai usar o método mergeWith com o parametro sobrescrever=true. Caso o valor do campo seja Analise.IGNORE, o valor deste campo não será sobrescrito

Analise.libs = {
    Vectorization: window.Vectorization
};

Analise.Base = function( config, parametrosAdicionais={} ){
    const context = Vectorization.Matrix(config, parametrosAdicionais);

    /**
    * Copia parametros para dentro da instancia desse objeto 
    * @param {JSON} parametros 
    */
    context.copyParametros = function( parametros={} ){
        const chaves = Object.keys( parametros );

        for( let i = 0 ; i < chaves.length ; i++ )
        {
            const chaveAtual = chaves[i];
            const valorChave = parametros[ chaveAtual ];

            //Atribui o valor
            this[ chaveAtual ] = valorChave;
        }
    }

    context.downloadArquivo = function(data, filename='dados.json'){
        // Verifica se o data é um objeto; se não for, assume que já é JSON válido.
        const jsonData = typeof data === "object" ? JSON.stringify(data, null, 2) : data;

        // Cria um blob com os dados JSON.
        const blob = new Blob([jsonData], { type: "application/json" });

        // Cria uma URL temporária para o blob.
        const url = URL.createObjectURL(blob);

        // Cria um elemento <a> para disparar o download.
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;

        // Adiciona o elemento <a> ao DOM e simula um clique.
        document.body.appendChild(a);
        a.click();

        // Remove o elemento <a> do DOM.
        document.body.removeChild(a);

        // Revoga a URL temporária.
        URL.revokeObjectURL(url);
    }

    return context;
}

//Alias
window.A = window.Analise;