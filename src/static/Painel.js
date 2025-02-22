/**
* Author Name: William Alves Jardim
* Author Email: williamalvesjardim@gmail.com
* 
* LICENSE: MIT
*
* File Name: Base.js
*
* File Creation Date: 19/02/2025 21:37 PM
*
* Description: Um Painel para armazenar todas as instancias dos DataStructures criados pelo Analise, para monitorar e controlar os DataStructures.
*              Essa ideia surgiu ano passado, dia 17 de novembro de 2024, onde eu pensei em criar algum tipo de gerenciador de DataStructures criados. 
*/

/**
* MINHA IDEIA: Ter um gerenciador de DataStructures criados na memoria
* usando o comando Analise.painel(), que retorna um objeto que contém varias informações e metodos de debuggig de datastructs
*
* @example
* Retonar esse painel:
*
*   Analise.Painel();
*
*
* @example
* Listar no console do navegador os IDs de todos os DataStructures criados:
*
*   Analise.Painel().listar_console();
*
*
* @example
* Ver todos os DataStructures criados:
*   
*   Analise.Painel().getMemoria();
*
*
* @example
* Pegar um DataStructure pelo ID dele:
*
*   Analise.Painel().get('ID_DATASTRUCTURE');
*/
Analise.Painel = function(){
    const context = {};

    /**
    * Obtém a memória completa
    */
    context.getMemoria = function()
    {
        return Analise.Painel.memoria;
    }

    /**
    * Adiciona um DataStructure na memória para ele ser controlado 
    * @param {Analise.DataStructure} instanciaDataStructure
    */
    context.pushMemoria = function( instanciaDataStructure ){
        Analise.Painel.memoria.push(instanciaDataStructure);
    }

    /**
    * Exibe no console(CLI) todos os DataStructures criados 
    */
    context.listar_console = function(){
        const memoria               = context.getMemoria();
        const idsMemoria            = Object.keys( memoria );
        const tabelaDataStructures  = [];

        for( let i = 0 ; i < idsMemoria.length ; i++ )
        {
            const idInstancia             = idsMemoria[i];
            const instanciaDataStructure  = memoria[ idInstancia ];
            const nomeInstancia           = instanciaDataStructure.nome;

            //Se ele é um objeto do Analise
            if( instanciaDataStructure.objectName )
            {
                tabelaDataStructures.push( 
                    nomeInstancia ? [idInstancia, nomeInstancia] 
                                  : [idInstancia]
                );
            }
        }

        console.table(tabelaDataStructures);
    }

    /**
    * Obtém um DataStructure salvo na memória pelo id dele
    */
    context.get = function(idStr)
    {
        return Analise.Painel.memoria.getDataStructureById(idStr);
    }

    return context;
}

/**
* Memória que vai armazenar todas as intancias de DataStructure criadas.
*/
Analise.Painel.memoria = {};

/**
* Permite obter uma instancia de DataStructure pelo ID dele na memória interna
* @param {String} idStr 
*/
Analise.Painel.memoria.getDataStructureById = function(idStr)
{
    return Analise.Painel.memoria[ idStr ];
}

/**
* Adiciona um DataStructure na memória para ele ser controlado 
* @param {Analise.DataStructure} instanciaDataStructure
*/
Analise.Painel.memoria.push = function(instanciaDataStructure)
{
    Analise.Painel.memoria[ instanciaDataStructure._criado ] = instanciaDataStructure;
}