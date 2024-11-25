Analise.DataStructure = function( dadosIniciais=[] , config={} ){
    const context = Analise.Base(dadosIniciais);

	context.dadosIniciais = dadosIniciais;
	context.nomesCampos = config.campos || [];
	context.mapaCampos  = {};

	/**
	* Transforma nomes dos campos em indices e isso pode ser usado pelo método getColunaCampo para obter o Vector que contém os dados da coluna cujo nome é TAL
	*/
	for( let i = 0 ; i < context.nomesCampos.length ; i++ )
	{
		const nomeCampo    = context.nomesCampos[i];
		const indiceCampo  = i;

		context.mapaCampos[ nomeCampo ] = indiceCampo;
	}

	/**
	* Obtém o indice de um campo nomeCampo
	*/
	context.getIndiceCampo = function( nomeCampo ){
		if( context.mapaCampos[ nomeCampo ] == undefined ){
			throw `O campo ${nomeCampo} não existe!`;
		}
		return context.mapaCampos[ nomeCampo ];
	}

	//Injeta uma função dentro de cada amostra
	context.forEach(function(indice, vetorAmostra, contextoDataStructure){
		vetorAmostra.getCampo = function( nomeCampo ){
			return vetorAmostra.getIndice( contextoDataStructure.getIndiceCampo(nomeCampo) );
		}
	});


	/**
	* Obtém um Vectorization.Vector que contém os dados da coluna cujo nome é nomeCampo
	*/
	context.getColunaCampo = function( nomeCampo ){
		return context.extrairValoresColuna( context.getIndiceCampo( nomeCampo ) );
	}

    /**
    * Extrai as linhas
    * @param {*} linhaInicial 
    * @param {*} linhaFinal 
    * @returns 
    */
    context.lineRange = function(linhaInicial, linhaFinal){
        return context.slice(linhaInicial, linhaFinal);
    }

    /*
	Pesquisa amostras usando criterios de busca, e retorna um novo DataStructure.
	
	ex: findSamples([
		{ field: 'Nome', op: 'notNull'},
		{ fieldA: 'Idade', op: 'less', fieldB: '22' },
		{ 
			fieldA: 'Idade', op: 'less', fieldB: '25',
			or: [
				{fieldA: 'Idade', op: 'less', fieldB: '22'},
				{fieldA: 'Idade', op: 'less', fieldB: '22'},
				{fieldA: 'Idade', op: 'less', fieldB: '22'},
				{ 
					fieldA: 'Idade', op: 'less', fieldB: '22',
					or: [
						{fieldA: 'Idade', op: 'less', fieldB: '22'}
					]
				}
			]
		},
		{
			customFn: function(amostra){
				if(amostra.isFake){ return false }else{ return true}
			}
		}

	])

	OU
	ex: findSamples([
		{fieldA: 'Idade', op: 'less', fieldB: '22'}

	]);
	
	*/
	context.findSamples = function(criterios, returnType='datastructure'){
		const newArray = [];
		const rawArray = [];

		/*
		Função interna que faz uma comparação logica SE
		*/
		function doComparation(fieldA, operation, valueB, amostra){
			let validationResult = false;
			switch(operation){
				case 'isEqual':
				case 'equ':
					validationResult = (amostra.getCampo(fieldA) == valueB) || (amostra.getCampo(fieldA) === valueB);
					break;

				case 'notEqual':
				case 'neq':
					validationResult = (amostra.getCampo(fieldA) != valueB) && (amostra.getCampo(fieldA) !== valueB);
					break;

				case 'less':
				case 'isLess':
					validationResult = (amostra.getCampo(fieldA) < valueB);
					break;
			}

			return validationResult;
		}

		/*
		Função interna que realiza uma validação simples em cima do amostra, com base em algum campo
		*/
		function basicValidation(validationType, field, amostra){
			let validationResult = false;
			switch(validationType){
				case 'isNull':
					validationResult = amostra.getCampo(field) == null || amostra.getCampo(field) == undefined;
					break;

				case 'notNull':
					validationResult = amostra.getCampo(field) != null && amostra.getCampo(field) != undefined;
					break;

				case 'isEmpty':
					validationResult = String(amostra.getCampo(field)).trim() == '';
					break;

				case 'notEmpty':
					validationResult = String(amostra.getCampo(field)).trim() != '';
					break;
			}

			return validationResult;
		}

		//Função interna que tem como finalidade processar uma condição e retornar true ou false de acordo com a validação efetuada
		//true se for verdade, false caso contrario
		//Um criterio é um bloco de condição
		function processCriterio(criterio, criterioKeys, amostra, datastructure){
			const customFunction    = criterio['customFn'] ? criterio['customFn'] : null;   //se a condiçao for uma função personalizada javascript
			const isNegation        = criterio['isNegate'] ? true : false;                  //Se é uma negação, ou seja, se toda a condição inclusive os ORs serão em sentido negativo
			const isDualKeys        = criterioKeys.length == 2;                             //Se é apenas um campo e uma validação simples
			const isTriKeys         = criterioKeys.length == 3;                             //Se são tres atributos, indicando A, B e operação de checagem
            const haveOr            = criterio['or'] ? true : false;                        //se ele tem o OR envolvido
			const haveNot           = criterio['not'] ? true : false;                       //se ele tem o NOT envolvido, para criar uma condição do tipo AND porém ela é em setido negativo
			const haveExcept        = criterio['except'] ? true : false;                    //se ele tem o criterio EXCEPT, que basicamente é que nem o OR, porém se alguma condição except for TRUE, ele NEGA O RESULTADO DO CRITERIO, INVALIDANDO O CRITERIO TODO

			const isBasicValidation = (criterio['field'] && criterio['op'] && !criterio['fieldA'] && !criterio['fieldB']) ? true : false;
			const isComparation     = (!isBasicValidation && criterio['fieldA'] && criterio['fieldB'] && criterio['op']) ? true : false;
			
			let resultadoCriterio = false;

			//Se for uma função personalizada, usa ela
			if(customFunction){
				return customFunction(amostra);
			}

			if(isBasicValidation){
				resultadoCriterio = basicValidation( criterio['op'], criterio['field'], amostra );
			
			//Uma validação que envolve dois lados A e B
			}else if(isComparation){
				resultadoCriterio = doComparation( criterio['fieldA'], criterio['op'], criterio['fieldB'], amostra)

				//O AND vem primeiro que o OR, então se o AND ja foi TRUE, se DER FALSE no OR NÂO TEM PROBLEMA
				if( resultadoCriterio == false ){
					if( haveOr ){
						const orResults = [];
						for( let c = 0 ; c < criterio['or'].length ; c++ ){
							const condicaoOr = criterio['or'][c];
							const condicaoOrKeys = Object.keys(condicaoOr);
							const resultadoOr = processCriterio( condicaoOr, condicaoOrKeys, amostra, datastructure );
							orResults.push( resultadoOr );
						}
						
						resultadoCriterio = orResults.some(function(orRes){ return orRes == true });
					}
				}

				//Sempre a exceção vem por ultimo
				if( haveExcept ){
					const exceptResults = [];
					for( let c = 0 ; c < criterio['except'].length ; c++ ){
						const condicaoEx = criterio['except'][c];
						const condicaoExKeys = Object.keys(condicaoEx);
						const resultadoEx = processCriterio( condicaoEx, condicaoExKeys, amostra, datastructure );
						exceptResults.push( resultadoEx );
					}
					
					//O except é uma excesão, ou seja, invalida o criterio, caso alguma exceção retorne TRUE
					if( exceptResults.some(function(exRes){ return exRes == true }) ){
						resultadoCriterio = false;
					}
				}
			}

			if( isNegation ){
				return !resultadoCriterio;
			}else{
				return resultadoCriterio;
			}
		}

		//Para cada amostra
		context.forEach(function(indice, amostra, datastructure){
			
			//Para cada criteio faz a validação
			let resultadosCriterios = [];
			for( let i = 0 ; i < criterios.length ; i++ ){
				const criterio = criterios[i];
				const criterioKeys = Object.keys(criterio);
				const isDualKeys       = criterioKeys.length == 2;                             //Se é apenas um campo e uma validação simples
				const isTriKeys        = criterioKeys.length == 3;     

				resultadosCriterios.push( processCriterio(criterio, criterioKeys, amostra, datastructure) );
			}

			if( resultadosCriterios.every(function(resultCriterio){return resultCriterio == true}) ){
				newArray.push( amostra );
				rawArray.push( amostra.toJson() );
			}
		});

		let returnObject;

		return returnObject;
	}

	/*
	Uma busca mais programatica, retorna um novo datastructure

		ex: filter(function(amostraSeries, rawamostra, datastructure){
			if( amostraSeries.getCampo(FIELDNAME) == VALUE ){
				return true;
			}
		})
	*/
	context.filter = function(fn){
		let newArray = [];

		this.forEach(function(amostra, indice, datastructure){
			const rawamostra = amostra.toJson();

			if( fn( amostra, rawamostra, datastructure ) == true ){
				newArray.push(amostra);
			}
		})

		return new JeyCell.prototype.datastructure({
			data: newArray,
			columns: this.columns
		});
	}

	//Metodos de matematica
	context.sumColumn = function(columnName){
		let acumulated = 0 ;
		this.forEach( function(amostra, indice, context){
			acumulated += Number( amostra.getCampo(columnName) );
		});

		return acumulated;
	}

    return context;
}