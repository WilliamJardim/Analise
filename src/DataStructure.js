Analise.DataStructure = function( dadosIniciais=[] , config={} ){
    const context = Analise.Base(dadosIniciais);
	context.objectName = 'DataStructure';
	context.extendedFrom = 'Matrix';

	context.dadosIniciais = dadosIniciais;
	context.nomesCampos = config.campos || [];
	context.mapaCampos  = {};

	context.mapearNomes = function(){
		/**
		* Transforma nomes dos campos em indices e isso pode ser usado pelo método getColunaCampo para obter o Vector que contém os dados da coluna cujo nome é TAL
		*/
		for( let i = 0 ; i < context.nomesCampos.length ; i++ )
		{
			const nomeCampo    = context.nomesCampos[i];
			const indiceCampo  = i;
	
			context.mapaCampos[ nomeCampo ] = indiceCampo;
		}
	}

	/**
	* Transforma nomes dos campos em indices e isso pode ser usado pelo método getColunaCampo para obter o Vector que contém os dados da coluna cujo nome é TAL
	*/
	context.mapearNomes();

	/**
	* Obtém o indice de um campo nomeCampo
	*/
	context.getIndiceCampo = function( nomeCampo ){
		if( context.mapaCampos[ nomeCampo ] == undefined ){
			throw `O campo ${nomeCampo} não existe!`;
		}
		return context.mapaCampos[ nomeCampo ];
	}

	context.getIndiceCampos = function(nomesCampos){
		const indicesCampos = [];
		nomesCampos.forEach(function( nomeCampo ){
			indicesCampos.push( context.getIndiceCampo(nomeCampo) );
		});

		return indicesCampos;
	}

	//Injeta uma função dentro de cada amostra
	context.forEach(function(indice, vetorAmostra, contextoDataStructure){
		vetorAmostra.getCampo = function( nomeCampo ){
			return vetorAmostra.getIndice( contextoDataStructure.getIndiceCampo(nomeCampo) );
		}
	});

	/**
	* Converte este DataStructure em um Vectorization.Matrix
	* @returns {Matrix} - Um novo objeto Matrix contendo os dados do DataStructure.
	* @returns 
	*/
	context.toMatrix = function(){
		return Vectorization.Matrix( context.raw() );
	}

	/**
	* Obtém um Vectorization.Vector que contém os dados da coluna cujo nome é nomeCampo
	*/
	context.getColunaCampo = function( nomeCampo ){
		return context.extrairValoresColuna( context.getIndiceCampo( nomeCampo ) );
	}

	/**
	* Apaga a coluna de um campo, e retorna um novo DataStructure
	*/
	context.removerColunaCampo = function( nomeCampo ){
		return Analise.DataStructure( context.removerColuna( context.getIndiceCampo( nomeCampo ) ) );
	}

	/**
	* Apaga varias colunas de campo, e retorna um novo DataStructure
	*/
	context.removerColunasCampos = function( nomesCampo ){
		return Analise.DataStructure( context.removerColunas( context.getIndiceCampos( nomesCampo ) ) );
	}

	/**
	* Permite renomear um campo
	* @param {*} nomeCampo 
	* @param {*} novoNomeCampo 
	*/
	context.renomearCampo = function( nomeCampo, novoNomeCampo ){
		const indiceCampo = context.getIndiceCampo( nomeCampo );
		context.nomesCampos[indiceCampo] = novoNomeCampo;
		context.mapearNomes();
		return context;
	}

	/**
	* Exclui um nome de campo 
	*/
	context.desnomearCampo = function( nomeCampo ){
		delete context.mapaCampos[ nomeCampo ];
		context.mapearNomes();
		return context;
	}	

	/**
	* Extrai todos os valores de um campo e retorna um Vectorization.Vector
	*/
	context.extrairValoresCampo = function( nomeCampo ){
		return context.extrairValoresColuna( context.getIndiceCampo(nomeCampo) );
	}

	/**
	* Extrai todos os valores de vários campos e retorna um novo DataStructure
	*/
	context.extrairValoresCampos = function( nomeCampos ){
		return Analise.DataStructure( 
			Vectorization.Matrix( 
				context.extrairValoresColunas( context.getIndiceCampos(nomeCampos) ) 
			).transposta().raw(), 
			{ campos: nomeCampos } 
		);
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

	//Cria uma nova coluna nesta Vectorization.Matrix
	//OVERRIDE
    context.adicionarColuna = function(valoresNovaColuna, nomeCampo=''){
        //Consulta se a gravação/modificação de dados está bloqueada neste Vectorization.Matrix
        if( context._isBloqueado() == true ){
            throw 'Este Vectorization.Matrix está bloqueado para novas gravações!';
        }

        let isVetorVectorization = (
            Vectorization.Vector.isVector(valoresNovaColuna || []) == true &&
            Vectorization.Vector.isVectorizationVector(valoresNovaColuna || []) 
        ) == true;
           
        let valoresNovaColuna_Vector = isVetorVectorization == true ? valoresNovaColuna : Vectorization.Vector(valoresNovaColuna || []);
        let tamanhoVetorNovo = valoresNovaColuna_Vector.tamanho();
        let quantidadeLinhasMatrix = context.getRows();

        if( typeof valoresNovaColuna_Vector == 'object' &&
            tamanhoVetorNovo == quantidadeLinhasMatrix
        ){
            //Para cada linha
            Vectorization.Vector({
                valorPreencher: 1,
                elementos: quantidadeLinhasMatrix

            }).paraCadaElemento(function(iLinha){
                let valoresDaLinhaObtidos = context.getLinha(iLinha);

                switch( Vectorization.Vector.isVectorizationVector(valoresDaLinhaObtidos) || 
                        Vectorization.BendableVector.isVectorizationBendableVector(valoresDaLinhaObtidos) 
                ){
                    case true:
                        valoresDaLinhaObtidos.adicionarElemento( valoresNovaColuna[iLinha] );
                        break;

                    case false:
                        let novoVetorVectorization = Vectorization.Vector(valoresDaLinhaObtidos).adicionarElemento( valoresNovaColuna[iLinha] )
                        context._definirValorLinha(iLinha, valoresDaLinhaObtidos.length, [... novoVetorVectorization.valores()] );
                        break;
                }
            });

            //Atualiza a quantidade das colunas
            context.columns = context.calcTamanhos().lerIndice(1);
            context.colunas = context.columns;

			//Cria um nome para o campo
			context.mapaCampos[nomeCampo] = context.colunas + 1;
			context.nomesCampos.push( nomeCampo );
			context.mapearNomes();

        }else{
            throw 'Não da pra adicionar uma nova coluna se a quantidade de elementos não bater com a quantidade de linhas!. Não permitido.';
        }

		return context;
    }

	//Cria uma nova coluna nesta Vectorization.Matrix
	context.adicionarCampo = context.adicionarColuna;

	/**
	* Aplica uma função a uma ou mais colunas e cria uma nova coluna com os resultados.
	* 
	* @param {string[]} camposEntrada - Os nomes das colunas de entrada.
	* @param {function} funcao - A função que será aplicada aos valores das colunas de entrada.
	* @param {string} novoCampo - O nome da nova coluna a ser criada.
    *
	* exemplo:
	*	dataset.criarColunaCalculadaExplicita(['campo1', 'campo2'], (campo1, campo2) => { return campo1 + campo2 }, 'soma' );
	*/
	context.criarColunaCalculadaExplicita = function(camposEntrada, funcao, novoCampo) {
		// Validar se os campos de entrada existem
		const indicesEntrada = context.getIndiceCampos(camposEntrada);

		// Iterar sobre as linhas e aplicar a função
		const novaColuna = context.map((indiceLinha, linha) => {
			const valoresEntrada = indicesEntrada.map(indice => linha[indice]);
			return funcao(...valoresEntrada);
		});


		// Adicionar a nova coluna aos dados
		context.adicionarColuna( novaColuna, novoCampo );

		// Atualizar metadados
		context.nomesCampos.push(novoCampo);
		context.mapearNomes();
	};

	/**
	* Aplica uma função a uma ou mais colunas e cria uma nova coluna com os resultados.
	* 
	* @param {function} funcao - A função que será aplicada aos valores das colunas de entrada.
	* @param {string} novoCampo - O nome da nova coluna a ser criada.
    *
	* exemplo:
	*	dataset.criarColunaCalculada( (indiceAmostra, amostra, contextoDataset) => { return amostra.getCampo('campo1') + amostra.getCampo('campo2') }, 'soma' );
	*/
	context.criarColunaCalculada = function(funcao, novoCampo) {
		// Iterar sobre as linhas e aplicar a função
		const novaColuna = context.map((indiceLinha, linha) => {
			return funcao(indiceLinha, linha);
		});

		// Adicionar a nova coluna aos dados
		context.adicionarColuna( novaColuna, novoCampo );

		// Atualizar metadados
		context.nomesCampos.push(novoCampo);
		context.mapearNomes();
	};

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
			}
		});

		let returnObject = newArray;

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

		context.forEach(function(indice, amostra, datastructure){
			const rawamostra = amostra.raw();

			if( fn( amostra, rawamostra, datastructure ) == true ){
				newArray.push(amostra);
			}
		})

		return newArray;
	}

	//Metodos de matematica
	context.sumColumn = function(columnName){
		let acumulated = 0;
		context.forEach( function(indice, amostra, context){
			acumulated += Number( amostra.getCampo(columnName) );
		});

		return acumulated;
	}

	context.meanColumn = function(columnName){
		const somaColuna = context.sumColumn( columnName );
		return somaColuna / context.getLinhas();
	}

    return context;
}