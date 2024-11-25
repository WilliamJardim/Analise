class Base {
    constructor( config={} ){
        this.config = config;
        this.copyParametros(config);
    }

    /**
    * Copia parametros para dentro da instancia desse objeto 
    * @param {JSON} parametros 
    */
    copyParametros( parametros={} ){
        const chaves = Object.keys( parametros );

        for( let i = 0 ; i < chaves.length ; i++ )
        {
            const chaveAtual = chaves[i];
            const valorChave = parametros[ chaveAtual ];

            //Atribui o valor
            this[ chaveAtual ] = valorChave;
        }
    }
}