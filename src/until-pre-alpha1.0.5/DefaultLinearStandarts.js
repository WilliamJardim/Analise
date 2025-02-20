/**
* Author Name: William Alves Jardim
* Author Email: williamalvesjardim@gmail.com
* 
* LICENSE: MIT
*
* File Name: DefaultLinearStandarts.js
*
* Descrição: Implementa alguns padrões lineares para serem usados no método "AddLinearStandart" do DataStructure.
*/
Analise.DataStructure.LinearStandarts = {};

/**
* @padrao AlwaysUp
* Usado para criar um incremento que é sempre positivo.
* Esse padrão vai sempre subir o "valor atual" do campo, até que chegue na última amostra(ou na amostra definida pelo usuario em range.endIndex), quando a função para de inserir o padrão
*
* @example
* Exemplo de uso:
*
*   dataset.AddLinearStandart('idade', Analise.LinearStandarts.AlwaysUp({}) );
*/
Analise.DataStructure.LinearStandarts.AlwaysUp = function( detalhes={} ){

    const detalhesPadrao = {
        name: 'AlwaysUp',

        /** Configurações do padrão **/
        range: detalhes.range || { startIndex: 0, endIndex: null },

        /**
        * Configura os passos como quiser
        */
        steps: {
            /**
            * Controla se vai somar ou apenas definir o valor atual nas amostras 
            */
            insertionType: (detalhes.sense || {}).insertionType || 'sum',

            /**
            * Se vai ter ruidos aleatorios nos passos do valor atual
            */
            randomNoises:  (detalhes.steps || {}).randomNoises || false, //JSON ou falso

            /**
            * Se vai ter ruidos customizados nos passos do valor atual
            */
            customNoises:  (detalhes.steps || {}).customNoises || false, //Funcao ou falso

            /**
            * Valor inicial do "valor atual"
            */
            initialValue:  (detalhes.steps || {}).initialValue || 0,

            /**
            * Função que controla o valor do passo do "valor atual" quando ele estiver subindo
            */
            stepUp:   (detalhes.steps || {}).stepUp || 0.1, //Funcao ou valor

            /**
            * Função que controla o valor do passo do "valor atual" quando ele estiver descendo
            */
            stepDown: (detalhes.steps || {}).stepDown || 0.1, //Funcao ou valor,

            /**
            * Um valor que controla a taxa dos passos.
            * valores altos vão fazer passos bem longos,
            * e valores pequenos tipo 0.2 podem reduzir a intensidade dos passos, globalmente, tanto pra subida quanto pra descida 
            * 1 é neutro, ele dá passos conforme programado, sem afetar.
            */
            stepRate: 1,

            /**
            * Um valor que controla a taxa dos passos.
            * Só se aplica na subida do valor
            */
            stepUpRate: 1,

            /**
            * Um valor que controla a taxa dos passos.
            * Só se aplica na descida do valor
            */
            stepDownRate: 1,

            /**
            * Callback que vai rodar antes de cada passo do "valor atual"
            */
            beforeStep: (detalhes.steps || {}).beforeStep,

            /**
            * Callback que vai rodar depois de cada passo do "valor atual"
            */
            afterStep:  (detalhes.steps || {}).afterStep

        },

        /**
        * Sentido do padrão 
        */
        sense: {
            /**
            * Vai sempre subir o "valor atual" 
            */
            direction: 'up',

            /**
            * Não existe condição para se manter  
            */
            stayCondition: undefined,

            /**
            * Define a codição de subida 
            */
			upCondition: function( parametros ){
                return true; // Vai sempre subir
            }

        }

    };

    return detalhesPadrao;

}

Analise.LinearStandarts = Analise.DataStructure.LinearStandarts;