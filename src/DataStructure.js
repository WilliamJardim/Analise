Analise.DataStructure = function( dadosIniciais=[] , config={} ){
	let parametrosAdicionais = {
		flexibilidade: config.flexibilidade || null
	};

	let map_keysIdentificadas = {};

	let dadosIniciais_tratados  = [];

	let tipoDadosIniciais       = undefined;

	//Tratar os dados iniciais
	//Se for um array de JSON
	if( typeof dadosIniciais == 'object' && !(dadosIniciais[0] instanceof Array) )
	{
		tipoDadosIniciais = 'JSON_ARRAY';

		//Para cada amostra
		for( let i = 0 ; i < dadosIniciais.length ; i++ )
		{
			//Extrai as informações
			const amostraJSON     = dadosIniciais[i];
			const keysAmostra     = Object.keys(amostraJSON);

			//Vai salvando as chaves no mapa de chaves identificadas
			keysAmostra.forEach(function(chave){
				map_keysIdentificadas[chave] = true;
			});

			const valoresAmostra  = Object.values(amostraJSON);

			//Joga os dados da amostra no Array
			dadosIniciais_tratados.push(valoresAmostra);
		}

	//Se for uma Matrix
	}else if( dadosIniciais[0] instanceof Array ){
		tipoDadosIniciais = 'Matrix';

		//Atribui os dados ao dadosIniciais_tratados
		dadosIniciais_tratados = JSON.parse(JSON.stringify(dadosIniciais));
	}

    const context = Analise.Base(dadosIniciais_tratados, parametrosAdicionais);
	
	context.idObjeto = new Date().getTime();

	context.tipoDadosIniciais = tipoDadosIniciais;
	context.keysIdentificadas = [];

	context.parametrosAdicionais = parametrosAdicionais || {};
	context.objectName = 'DataStructure';
	context.extendedFrom = 'Matrix';

	context.dadosIniciais = dadosIniciais;

	context.mapaCampos  = {};

	//Pega o nome dos campos
	switch(tipoDadosIniciais)
	{
		//Se for Matrix, os keysIdentificadas vai ser o mesmo que config.campos
		case 'Matrix':
			context.keysIdentificadas = config.campos || [];
			context.nomesCampos       = config.campos || [];
			break;

		case 'JSON_ARRAY':
			context.keysIdentificadas = config.campos || Object.keys( map_keysIdentificadas );
			context.nomesCampos       = config.campos || context.keysIdentificadas;
			break;
	}

	/**
	* Exporta os dados deste DataStructure para um formato JSON
	*/
	context.exportarJSON = function( downloadArquivo=null ){
		const dadosConvertidos = [];

		//Percorre cada amostra
		context.forEach(function( indiceElemento, amostraVector, contexto ){
			const estruturaCamposAmostra = {};
			
			//Obtem os valores dos campos para a amostra atual
			context.nomesCampos.forEach(function(nomeCampo){

				estruturaCamposAmostra[nomeCampo] = amostraVector.getCampo( nomeCampo )
				                                                 .raw();

			});

			//Adiciona os dados JSON da amostra atual na lista
			dadosConvertidos.push(estruturaCamposAmostra);
		});

		if(downloadArquivo && downloadArquivo.endsWith('.json') ){
			context.downloadArquivo( dadosConvertidos , downloadArquivo );
		}

		return dadosConvertidos;
	}

	/**
	* Carrega um arquivo JSON do computador via upload e depois injeta dentro deste DataStructure
	* @param {Function} callback 
	*/
	context.loadJSON = function(callback) {
		// Cria dinamicamente o elemento <input> do tipo "file"
		const inputFile = document.createElement("input");
		inputFile.type = "file";
		inputFile.accept = ".json"; // Aceita apenas arquivos JSON
	
		// Adiciona o evento "change" para capturar o arquivo selecionado
		inputFile.addEventListener("change", function (event) {
			const file = event.target.files[0]; // Obtém o primeiro arquivo selecionado
	
			if (!file) return; // Caso nenhum arquivo seja selecionado, não faz nada
	
			const reader = new FileReader();
	
			// Lê o conteúdo do arquivo como texto
			reader.onload = function () {
				try {
					// Parseia o conteúdo do arquivo para JSON
					const jsonData = JSON.parse(reader.result);
					
					//Para cada amostra
					const dados_tratados = [];
					const map_keysIdentificadas_tratado = {};

					for( let i = 0 ; i < jsonData.length ; i++ )
					{
						//Extrai as informações
						const amostraJSON     = jsonData[i];
						const keysAmostra     = Object.keys(amostraJSON);
			
						//Vai salvando as chaves no mapa de chaves identificadas
						keysAmostra.forEach(function(chave){
							map_keysIdentificadas_tratado[chave] = true;
						});
			
						const valoresAmostra  = Object.values(amostraJSON);
			
						//Joga os dados da amostra no Array
						dados_tratados.push(valoresAmostra);
					}

					//Se os campos não existem neste DataStructure, cria
					context.keysIdentificadas = Object.keys( map_keysIdentificadas_tratado );
					context.nomesCampos       = context.keysIdentificadas;

					context.content = dados_tratados;
					context._matrix2Advanced();
					context.mapearNomes();
					context.atualizarQuantidadeColunasLinhas();

					//Atualiza a quantidade das colunas
					//Como é um JSON, vai precisar calcular de forma diferente as colunas
					context.columns = context.content[0].length;
					context.colunas = context.columns;

					context.injetarFuncoesAmostras();

					if(callback)
					{
						// Chama o callback com os dados JSON
						callback(jsonData, context);
					}

				} catch (error) {
					console.error("Erro ao carregar o arquivo JSON:", error);
					alert("O arquivo selecionado não é um JSON válido.");
				}
			};
	
			// Lê o arquivo
			reader.readAsText(file);
	
			// Remove o elemento de input do DOM após a leitura
			document.body.removeChild(inputFile);
		});
	
		// Adiciona o elemento de input ao DOM para que possa ser utilizado
		document.body.appendChild(inputFile);
	
		// Simula um clique no input para abrir a janela de seleção de arquivo
		inputFile.click();
	}

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
	* Obtem uma determinada amostra 
	*/
	context.getAmostra = context.getLinha;

	/**
	* Obtem o nome dos campos
	* @param {*} nomeCampo 
	* @returns 
	*/
	context.getNomeCampos = function(){
		return context.nomesCampos;
	}

	/**
	* Verifica se um campo existe ou não 
	*/
	context.existeCampo = function( nomeCampo ){
		return context.mapaCampos[ nomeCampo ] != undefined;
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

	context.getIndiceCampos = function(nomesCampos){
		const indicesCampos = [];
		nomesCampos.forEach(function( nomeCampo ){
			indicesCampos.push( context.getIndiceCampo(nomeCampo) );
		});

		return indicesCampos;
	}

	/**
	* @override
    * Obtem um novo DataStructure exatamente igual a este
    * Ou seja, faz um copia do propio objeto, identico, porém sem manter as referencias. 
    * @returns {Analise.DataStructure}
    */
    context.duplicar = function(){
    
		return Analise.DataStructure( context.toMatrix().duplicar().raw(), 
									{
			                          campos: context.nomesCampos, 
									  flexibilidade: context.flexibilidade 
									});
    }

	/**
	* @override
    * Obtem um novo DataStructure exatamente igual a este
    * Ou seja, faz um copia do propio objeto, identico, porém sem manter as referencias. 
    * @returns {Analise.DataStructure}
    */
	context.clonar = context.duplicar;

	//Injeta uma função dentro de cada amostra
	context.injetarFuncoesAmostras = function(){
		
		context.forEach(function(indice, vetorAmostra, contextoDataStructure){
			vetorAmostra.getCampo = function( nomeCampo ){
				return vetorAmostra.getIndice( contextoDataStructure.getIndiceCampo(nomeCampo) );
			}

			vetorAmostra.setCampo = function( nomeCampo, valorDefinir ){
				vetorAmostra.definirElementoNoIndice( contextoDataStructure.getIndiceCampo(nomeCampo), valorDefinir ) ;
			}

			//Cria um novo campo dentro da amostra atual
			vetorAmostra.adicionarCampo = function( nomeCampo, valorDefinir ){
				context.criarCampoEmBranco( nomeCampo );
				vetorAmostra.setCampo( nomeCampo, valorDefinir );
			}
		});
	}

	context.injetarFuncoesAmostras();

	/** 
	* @override
    * Remove amostras duplicadas deste Vectorization.Matrix com base em colunas específicas.
	* @param {String[]} nomeCampos - Os campos especificos que serão usados nessa verificação. Se não passar nada, ele ignora e usa todos
    */
    context.distinct = function( nomeCampos=null ){
        const valoresJaVistos = {};
        const valoresUnicos = Vectorization.Matrix([], context.parametrosAdicionais);

        context.forEach(function(indice, linhaVector){
            const identificador = (
				                   nomeCampos != null ? nomeCampos.map(function( nomeCampo ){ return linhaVector.getCampo( nomeCampo ) }) 
			                                          : linhaVector.raw()
								  ).join('|');

            if( valoresJaVistos[identificador] == undefined ){
                valoresJaVistos[identificador] = true;
                valoresUnicos.push( linhaVector );
            }
        });

        return Analise.DataStructure(valoresUnicos.raw(), context.parametrosAdicionais);
    }

	/**
	* Cria uma nova coluna EM TODAS AS AMOSTRAS e preenche elas com null
	*/
	context.criarCampoEmBranco = function( nomeNovoCampo ){

		if( !context.existeCampo(nomeNovoCampo) ){

			//Adiciona o nome do campo na lista de campos
			context.nomesCampos.push( nomeNovoCampo );

			//Mapear o indice desse novo campo
			context.mapearNomes();

			//Para todas as amostras, preencher esse campo com null
			context.forEach(function(indiceAmostra, amostra){
				amostra.setCampo( nomeNovoCampo, Vectorization.Scalar(0) );
			});

			context.flexibilidade.push( 'numero' );

		}
	}

	/**
	* Criar varios campos em branco
	* Para cada um: Cria uma nova coluna EM TODAS AS AMOSTRAS e preenche elas com null
	*/
	context.criarCamposEmBranco = function( camposCriar=[] ){

		//Cria os campos que NÂO EXISTEM NO DataStructure atual
		camposCriar.forEach(function( campoCriar ){
			context.criarCampoEmBranco( campoCriar );
		});	

	}

	/**
	* MERGE:
	*	mesclar duas DataStructure(es)
    *
	*	Se o ID(o campo chave) existir, todos os dados da segunda DataStructure serão acrescentados nele, e os novos campos que não existiam na DataStructure A serão criados, e em todas as outras amostras vão ficar como null.
    *
	*	Se o ID não existir, ele adiciona uma nova amostra com  todos os dados da segunda DataStructure, e e os novos campos que não existiam na DataStructure A serão criados, todas as outras amostras vão ficar como null.
	*
	* Retorna um novo DataStructure com essa junção feita
	*/
	context.mergeWith = function( outraDataStructure, campoChave='nome' ){
		const resultadoMerge   = Analise.DataStructure( context.duplicar().toMatrix().raw(), {
			campos: context.getNomeCampos(),
			flexibilidade: context.parametrosAdicionais.flexibilidade
		} );

		//const resultadoMerge = context.duplicar();

		const camposEste  = context.getNomeCampos();

		//Pegar os campos que tem no OUTRO DataStructure  QUE NÂO EXISTEM NO DataStructure Atual
		const camposOutro = outraDataStructure.getNomeCampos().filter(function( nomeCampo ){ return !camposEste.includes(nomeCampo) });

		//Percorrer cada amostra do outro DataStructure
		outraDataStructure.forEach(function( indiceAmostra, amostraOutroVector, contextOutro ){

			//Verifica se o campo NOME da amostra atual deste DataStructure tem exatamente o mesmo valor que o campo NOME do OUTRO DataStructure 
			let seCorresponde = false;
			for( let i = 0 ; i < context.linhas ; i++){
				const amostraAtual = resultadoMerge.getAmostra(i);

				if( amostraAtual.getCampo(campoChave) == amostraOutroVector.getCampo(campoChave) ){
					seCorresponde = true; //Sinaliza que encontrou alguma correspondencia

					//Para cada campo DO OUTRO QUE NÂO EXISTE NESSE 
					//Dados que serão adicionados neste DataStructure
					
					camposOutro.forEach(function( campoOutro ){
						const valorInserir = amostraOutroVector.getCampo( campoOutro );

						//Adiciona o campo apenas na amostraAtual, e nas demais amostras, preenche aquele campo com null se ele não existir
						amostraAtual.adicionarCampo( campoOutro, valorInserir );
					});	

					//Não faz sentido ter mais de uma amostra que bate com a chave, pois muitas vezes o campo chave vai ser unico, por isso usei 'break'
					break;

				}
			}

			//Se não encontrou nenhuma correspondencia
			if( !seCorresponde ){
				
				//Cria os campos em branco
				const camposCriar = outraDataStructure.getNomeCampos();
				resultadoMerge.criarCamposEmBranco( camposCriar );

				//Vai apenas adicionar a amostra 'amostraOutroVector' ao DataStructure atual
				const camposFaltaram = camposOutro;
				resultadoMerge.inserir( amostraOutroVector.rawProfundo().concat( camposFaltaram.map(()=>{ return 0 }) ) );
			}
		});

		return resultadoMerge;
	}

	/**
	* Adiciona uma nova amostrar
	*/
	context.inserir = function( amostraObj ){
		if( Vectorization.Vector.isVector( amostraObj ) == true ){

			if( amostraObj.length != context.colunas ){
				throw `A nova amostra ${amostraObj} tem ${ amostraObj.length } colunas, porém, esse DataStructure possui ${context.colunas} colunas!`
			}

			context.push(amostraObj);

		//Caso não seja um Vectorization.Vector, então, ele pode um JSON
		}else if( typeof amostraObj == 'object' ) {

			const camposAmostra = Object.keys( amostraObj );
			const valoresAmostra = Object.values( amostraObj );
			const temTodosOsCampos = context.nomesCampos.every( ( campo )=>{ return amostraObj[campo] != undefined } );

			if(!temTodosOsCampos){
				throw `A amostra precisa ter os campos [${ context.nomesCampos }] `;
			}

			//Verifica se existe algum campo novo
			camposAmostra.forEach(function( nomeCampo ){

				if( context.existeCampo( nomeCampo ) == false )
				{
					throw `O campo ${ nomeCampo } não existe! `;
				}

			});

			//Adiciona a amostra
			context.push(valoresAmostra);
		}
	}

	/**
	* Apaga uma ou mais amostras 
	*
	* Exemplo:
	*   dataset.deletarAmostras([ { fieldA: 'idade', op: 'isEqual', fieldB: '25' } ]);
    * 
	*  Nesse exemplo, isso iria apagar todas as amostras cujo campo "idade" tiver o valor 25
	* 
	*/
	context.deletarAmostras = function( criterios ){
		const pesquisaApagar = context.findSamples(criterios);

		for( let i = 0 ; i < pesquisaApagar.length ; i++ )
		{
			const amostraApagar = pesquisaApagar[i];
			const indiceApagar  = amostraApagar.index;

			//Apaga a amostra amostraApagar
			context.content = context.content.filter(function( amostraAtual ){

				if( amostraAtual.index != indiceApagar ){
					return amostraAtual;
				}

			});

			context.atualizarQuantidadeColunasLinhas();
		}

	}

	/**
	* Substitui os valores(das amostras) numa determinada coluna que bater com uma condiçao
	* Ele varre as amostras, e a coluna TAL dessa amostra, se bater com a condição, ela vai ter seu valor substituido
    *
	* @param { String } nomeCampo - Nome do campo que quero substituir o valor
	* @param { Array } criterios - Os critérios de busca das amostras que terão suas colunas substituidas
	* @param { Function } replaceFunctionOrValue - O valor que as colunas das amotras encontradas deverão ter, ou uma função que retorna esse valor
	*  Se for uma função, ela recebe os seguintes parametros: (objAmostra, indiceAmostra, indiceColuna, valorExistente, contexto )
    *
	* Exemplo:
	*    dataset.substituirValorColuna( 'nome', [{ fieldA: 'nome', op: 'isEqual', fieldB: 'William' }], 'NINGUEM' );
	*
    *  Isso trocaria onde o nome é 'William' na coluna nome para 'NINGUEM'
	*
	*/
	context.substituirValorColuna = function( nomeCampo, criterios, replaceFunctionOrValue ){
		const pesquisaApagar         = context.findSamples(criterios);
		const indiceColunaSubstituir = context.getIndiceCampo(nomeCampo);

		for( let i = 0 ; i < pesquisaApagar.length ; i++ )
		{
			const amostraSubstituir   = pesquisaApagar[i];
			const indiceAtual         = amostraSubstituir.index;
			const valorExistente      = amostraSubstituir[ indiceColunaSubstituir ];

			if( typeof replaceFunctionOrValue == 'function' ){
				//Se for uma função que representa o valor
				context.definirValorLinha( indiceAtual, 
										   indiceColunaSubstituir, 
										   replaceFunctionOrValue.bind(context)( amostraSubstituir, indiceAtual, indiceColunaSubstituir, valorExistente, context ) 
										 );

			}else{
				//Se for um valor
				context.definirValorLinha( indiceAtual, 
										   indiceColunaSubstituir, 
										   replaceFunctionOrValue 
										);
			}
		}

	}

	/**
	* Converte este DataStructure em um Vectorization.Matrix
	* @returns {Matrix} - Um novo objeto Matrix contendo os dados do DataStructure.
	* @returns 
	*/
	context.toMatrix = function(){
		return Vectorization.Matrix( context.raw(), context.parametrosAdicionais );
	}

	/**
	* Converte este DataStructure em um Vectorization.Matrix
	* @returns {Matrix} - Um novo objeto Matrix contendo os dados do DataStructure.
	* @returns 
	*/
	context.exportarMatrix = context.toMatrix;

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
			{ 
			   campos: nomeCampos,
			   flexibilidade: nomeCampos.map( function( nomeCampoAtual ){ return context.flexibilidade[ context.getIndiceCampo( nomeCampoAtual ) ] } )
			} 
		);
	}

	/**
	* Extrai todos os valores de vários campos e retorna um novo DataStructure
	*/
	context.selectCampos     = context.extrairValoresCampos;
	context.selecionarCampos = context.extrairValoresCampos;

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
	Itera sobre cada campo do DataStructure, chamando um callback sincrono theFunction( campo, indiceCampo, valoresCampo, context )
	*/
	context.forEachCampo = function( theFunction ){
		for( let i = 0 ; i < context.nomesCampos.length ; i++ )
		{
			theFunction(context.nomesCampos[i], i, context.extrairValoresCampo(context.nomesCampos[i]).raw(), context);
		}
	}

	/**
	* @override
	* Cria uma nova coluna nesta Vectorization.Matrix
	*/
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
	context.criarColuna    = context.adicionarColuna;

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
	Preenche uma determinada coluna com o mesmo valor fixo em todas as amostras
	*/
	context.preencherCampo = function(nomeCampo, valorPreencher){
		context.forEach( function(indiceAmostra, amostra, contextoDataStructure){
			amostra.setCampo(nomeCampo, valorPreencher);
		});
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

		ex: filter(function(amostra, rawamostra, datastructure){
			if( amostra.getCampo(FIELDNAME) == VALUE ){
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

	/*** Metodos de matematica ***/

	/**
	* Somar uma coluna
	* @param {String} columnName 
	* @returns {Number}
	*/
	context.sumColumn = function(columnName){
		let acumulated = 0;
		context.forEach( function(indice, amostra, context){
			acumulated += Number( amostra.getCampo(columnName) );
		});

		return acumulated;
	}

	/**
	* Somar uma coluna
	* @param {String} columnName 
	* @returns {Number}
	*/
	context.somarColuna = context.sumColumn;

	context.meanColumn = function(columnName){
		const somaColuna = context.sumColumn( columnName );
		return somaColuna / context.getLinhas();
	}

	/**
	* Soma todos os números de uma linha 
	*/
	context.somarLinha = function( numeroLinha ){
		const objetoLinha = context.getLinha( numeroLinha );

		let acumulated = 0;
		objetoLinha.forEach( function(indice, valorAtual, contextoLinha){
			if( typeof valorAtual.raw() === 'number' ){
				acumulated += Number( valorAtual );
			}else{
				console.warn( `${ valorAtual } é uma string, e não foi incluido na soma!` );
			}
		});

		return acumulated;
	}

    return context;
}