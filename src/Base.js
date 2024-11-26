Analise = {};

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

    return context;
}