/**
* Author Name: William Alves Jardim
* Author Email: williamalvesjardim@gmail.com
* 
* LICENSE: MIT
*
* File Name: DataStructure.js
*/
Analise.DataStructure = function( dadosIniciais=[] , config={} ){

	let parametrosAdicionais = {
		nome: config.nome || '',
		flexibilidade: config.flexibilidade || null
	};

	let map_keysIdentificadas = {};

	let dadosIniciais_tratados  = [];

	let tipoDadosIniciais       = undefined;

	/**
	* Callback que será usado para fazer tratamentos internos e verificações internas em cada amostra na hora de criar um DataStructure
	* Uma das utilidades desta função será identificar a flexibilidade
	*/
	function callbackChecarAmostras( objAmostra )
	{
		/**
		* @umavez
		* SE OS NOMES DOS CAMPOS NÂO FOREM INFORMADOS
		* Identifica os nomes dos campos que são usados no 'objAmostra'
		*/
		if( !config.campos )
		{
			//Se a amostra for um Array
			if( objAmostra instanceof Array )
			{
				console.info(`Determinando nomes dos campos em um array sem que eles sejam informados!. Atribuindo 'campos' ao config automaticamente. `);

			//Se a amostra for um JSON
			}else if( !(objAmostra instanceof Array) && typeof objAmostra == 'object')
			{
				config.campos = Object.keys( objAmostra );
			}	
		}

		/**
		* @umavez
		* Identifica a flexibilidade caso ela não tenha sido informada 
		* Ele vai usar a primeira amostra que aparecer como base para identificar a flexibilidade
		*/
		if( !parametrosAdicionais.flexibilidade ) 
		{
			//Função que identifica qual é a flexibilidade de cada campo
			function obterFlexibilidade(valor, indiceValor)
			{
				return typeof valor == 'number'  ? 'numero'   :
					   typeof valor == 'string'  ? 'texto'    :
					   typeof valor == 'boolean' ? 'booleano' :
					  'texto'  
			}

			//Se a amostra for um Array
			if( objAmostra instanceof Array )
			{
				parametrosAdicionais.flexibilidade = objAmostra.map(obterFlexibilidade);

			//Se a amostra for um JSON
			}else if( !(objAmostra instanceof Array) && typeof objAmostra == 'object')
			{
				parametrosAdicionais.flexibilidade = (config.campos).map(function(nomeCampo, indiceNomeCampo){
																		return obterFlexibilidade( objAmostra[ nomeCampo ], indiceNomeCampo );
																	});
			}	
			
		}
	}

	//Tratar os dados iniciais
	//Se for um array de JSON
	if( dadosIniciais instanceof Array && typeof dadosIniciais == 'object' && !(dadosIniciais[0] instanceof Array) )
	{
		tipoDadosIniciais = 'JSON_ARRAY';

		//Para cada amostra
		for( let i = 0 ; i < dadosIniciais.length ; i++ )
		{
			//Extrai as informações
			const amostraJSON     = dadosIniciais[i];
			const keysAmostra     = Object.keys(amostraJSON);

			/**
			* Faz uma verificação na amostra(se necessário)
			*/
			callbackChecarAmostras(amostraJSON);

			//Vai salvando as chaves no mapa de chaves identificadas
			keysAmostra.forEach(function(chave){
				map_keysIdentificadas[chave] = true;
			});

			const valoresAmostra  = Object.values(amostraJSON);

			//Joga os dados da amostra no Array
			dadosIniciais_tratados.push(valoresAmostra);
		}

	//Se for um JSON contendo Arrays
	}else if( !(dadosIniciais instanceof Array) && 
			  typeof dadosIniciais == 'object'  && 
			  //O Object.keys(dadosIniciais)[0] obtem o nome do primeiro campo
			  dadosIniciais[ Object.keys(dadosIniciais)[0] ] instanceof Array 
	){
		tipoDadosIniciais = 'JSON_OF_ARRAY';
		dadosIniciais_tratados = []; //Sinaliza de forma explicita que esse Array será usado

		const nomesCampos = Object.keys(dadosIniciais);
		const primeiroCampo = nomesCampos[0];

		/**
		* Obtém a quantidade de amostras, pois aqui, a quantidade de amostras vai ser a quantidade de elementos que um campo possui, visto que, cada linha vai ter esses mesmos campos.
		*
		* Por exemplo:
		*	{
		*		campo1: [1,2,3],
		*   	campo2: [4,5,6]
		* 	} 
		*
		* Isso seriam 3 amostras. Que seriam: [1,4], [2,5] e [3,6].
		* Note que a ordem está invertida(ou transposta)
		*/
		const qtdeAmostras = dadosIniciais[primeiroCampo].length;

		//Para cada amostra
		for( let i = 0 ; i < qtdeAmostras ; i++ )
		{	
			const indiceAmostraAtual = i;

			/**
			* Crio um Array pra armazenar todos os valores dessa amostra que ele está pegando do JSON
			*/
			const dadosAmostraAtual = [];

			//Para cada campo
			(nomesCampos)
			.forEach(function( nomeCampo, indiceCampo ){
				
				const todosValoresCampo   = dadosIniciais[ nomeCampo ];

				/** 
				* O valor do campo "nomeCampo" da iteração atual NA AMOSTRA NÙMERO "indiceAmostraAtual" 
				* Fiz isso por que, quero obter exatamente o valor daquele campo especifico NA AMOSTRA ESPECIFICA
				*/
				const valorCampoDaAmostra = todosValoresCampo[ indiceAmostraAtual ];

				dadosAmostraAtual.push( valorCampoDaAmostra );
			});

			/**
			* Faz uma verificação na amostra(se necessário)
			*/
			callbackChecarAmostras(dadosAmostraAtual);

			/**
			* Adiciona os valores dessa amostra atual(ou seja, os valores dos campos da amostra atuaç), dentro da variavel "dadosAmostraAtual"
			* Isso vai adicionar cada amostra que extraimos do JSON dentro da Matrix "dadosAmostraAtual"
			*/
			dadosIniciais_tratados.push( dadosAmostraAtual );
		}
	

	//Se for uma Matrix
	}else if( dadosIniciais[0] instanceof Array ){
		tipoDadosIniciais = 'Matrix';

		//Atribui os dados ao dadosIniciais_tratados
		dadosIniciais_tratados = JSON.parse(JSON.stringify(dadosIniciais));

		/**
		* Se a flexibilidade não foi informada, ele vai percorrer cada amostra para procurar por isso e fazer outras verificações se necessário, assim como nas outras confições acima
		*/
		if( !parametrosAdicionais.flexibilidade )
		{
			dadosIniciais_tratados.forEach(function( amostra, indiceAmostra ){

				/**
				* Faz uma verificação na amostra(se necessário)
				*/
				callbackChecarAmostras( amostra );

			});
		}
	}

    const context = Analise.Base(dadosIniciais_tratados, parametrosAdicionais);
	
	context.nome = parametrosAdicionais.nome;

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

		case 'JSON_OF_ARRAY':
			context.keysIdentificadas = config.campos || Object.keys( dadosIniciais );
			context.nomesCampos       = config.campos || Object.keys( dadosIniciais );
			break;
	}

	/**
	* @override
	* Sobrescreve o método "map" para ajustar a flexibilidade
	*
	* Percorre cada linha da matrix, aplicando uma função de callback, retornando um resultado
    * @param {Function} callback(index, element, context)
    * @returns {Vectorization.Vector or Vectorization.Matrix}
	* 
	*/
	context.map = function(callback){
        let novaMatrix = [];

        for( let i = 0 ; i < context.content.length ; i++ )
        {
            novaMatrix[i] = callback( i, context.content[i], context );
        }

        //Se a função de callback ao ser aplicada resultar numa matrix, então ele converte resultado para Matrix
        if( Vectorization.Vector.isVector( novaMatrix[0] ) ){
            if( context.flexibilidade != undefined )
            {
                return Vectorization.Matrix(novaMatrix, {
                                                flexibilidade: context.flexibilidade
                                            });

            }else{
                return Vectorization.Matrix(novaMatrix);
            }


        //Se for um Vectorization.Vector
		}else{
			if( context.flexibilidade != undefined )
			{
				const ultimaFlexibilidade = context.flexibilidade[ 
																//Se tem o columns, usa ele
																context.columns 
																			? context.columns 
																			//se nao usa o length, caso seja um Vector
																			: context.flexibilidade.length-1                                                               
																];

				return Vectorization.BendableVector(novaMatrix, {
														flexibilidade: Array(novaMatrix.length).fill( ultimaFlexibilidade  )
													});

			}else{
				return Vectorization.Vector(novaMatrix);
			}
		}
    }

	/**
	* Exporta os dados deste DataStructure para um formato JSON
	* @returns {Array}
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

		if( VECTORIZATION_BUILD_TYPE == 'navegador' ) {
			if(downloadArquivo && downloadArquivo.endsWith('.json') ){
				context.downloadArquivo( dadosConvertidos , downloadArquivo );
			}

		//Se for node
		}else if( VECTORIZATION_BUILD_TYPE == 'node' ) {

		}

		return dadosConvertidos;
	}

	/**
	* Exporta os dados deste DataStructure para um formato JSON completo
	* @returns {Object}
	*/
	context.exportarJSON_indexado = function( downloadArquivo=null ){
		const dadosConvertidos = {};

		//Percorre cada amostra
		context.forEach(function( indiceElemento, amostraVector, contexto ){
			const estruturaCamposAmostra = {};
			
			//Obtem os valores dos campos para a amostra atual
			context.nomesCampos.forEach(function(nomeCampo){

				estruturaCamposAmostra[nomeCampo] = amostraVector.getCampo( nomeCampo )
				                                                 .raw();

			});

			//Adiciona os dados JSON da amostra atual na lista
			dadosConvertidos[ indiceElemento ] = estruturaCamposAmostra;
		});

		if( VECTORIZATION_BUILD_TYPE == 'navegador' ) {
			if(downloadArquivo && downloadArquivo.endsWith('.json') ){
				context.downloadArquivo( dadosConvertidos , downloadArquivo );
			}

		//Se for node
		}else if( VECTORIZATION_BUILD_TYPE == 'node' ) {

		}

		return dadosConvertidos;
	}

	/**
	* Exporta os dados para um JSON que contém ARRAYS para os dados das colunas
	*/
	context.exportarJSON_colunas = function( downloadArquivo=null ){
		
		const dadosJSON_ARRAY = {};

		context.getNomeCampos().forEach(function(nomeCampo){
			const dadosCampo = context.extrairValoresCampo(nomeCampo).rawProfundo();
			dadosJSON_ARRAY[nomeCampo] = dadosCampo;
		});

		if( VECTORIZATION_BUILD_TYPE == 'navegador' ) {
			if(downloadArquivo && downloadArquivo.endsWith('.json') ){
				context.downloadArquivo( dadosJSON_ARRAY , downloadArquivo );
			}

		//Se for node
		}else if( VECTORIZATION_BUILD_TYPE == 'node' ) {

		}

		return dadosJSON_ARRAY;
	}

	/**
	* Exporta os dados deste DataStructure para um formato CSV com separador configurável
	* @param {string|null} downloadArquivo Nome do arquivo para download (opcional)
	* @param {string} separador Separador de colunas (padrão: ',')
	*/
	context.exportarCSV = function(downloadArquivo = null, separador = ',') {
		let csvConteudo = '';

		// Gera a linha de cabeçalho (nomes dos campos)
		const linhaCabecalho = context.nomesCampos.join(separador);
		csvConteudo += linhaCabecalho + '\n';

		// Percorre cada amostra
		context.forEach(function(indiceElemento, amostraVector, contexto) {
			const linhaValores = context.nomesCampos.map(function(nomeCampo) {
				const valorCampo = amostraVector.getCampo(nomeCampo).raw();

				// Escapa valores que contêm o separador ou aspas
				if (typeof valorCampo === 'string' && (valorCampo.includes(separador) || valorCampo.includes('"'))) {
					return `"${valorCampo.replace(/"/g, '""')}"`;
				}
				return valorCampo;
			}).join(separador);

			// Adiciona a linha atual ao conteúdo do CSV
			csvConteudo += linhaValores + '\n';
		});

		//Corta o \n sozinho no final
        if( csvConteudo.endsWith('\n') ){
            csvConteudo = csvConteudo.slice(0, csvConteudo.length-String('\n').length);
        }

		if( VECTORIZATION_BUILD_TYPE == 'navegador' ) {
			// Faz o download do arquivo, se solicitado
			if (downloadArquivo && downloadArquivo.endsWith('.csv')) {
				context.downloadArquivo(csvConteudo, downloadArquivo);
			}

		//Se for node
		}else if( VECTORIZATION_BUILD_TYPE == 'node' ) {

		}

		return csvConteudo;
	}

	/**
	* Exporta os dados deste DataStructure para um formato TXT com separador configurável.
	* @param {string|null} downloadArquivo Nome do arquivo para download (opcional).
	* @param {string} separador Separador de colunas (padrão: '\t').
	* @returns {string} Conteúdo do arquivo TXT.
	*/
	context.exportarTXT = function(downloadArquivo = null, separador = '\t') {
		let txtConteudo = '';

		// Gera a linha de cabeçalho (nomes dos campos)
		const linhaCabecalho = context.nomesCampos.join(separador);
		txtConteudo += linhaCabecalho + '\n';

		// Percorre cada amostra
		context.forEach(function(indiceElemento, amostraVector, contexto) {
			const linhaValores = context.nomesCampos.map(function(nomeCampo) {
				const valorCampo = amostraVector.getCampo(nomeCampo).raw();

				// Escapa valores que contêm o separador
				if (typeof valorCampo === 'string' && valorCampo.includes(separador)) {
					return `"${valorCampo}"`; // Adiciona aspas apenas se houver o separador no valor
				}
				return valorCampo;
			}).join(separador);

			// Adiciona a linha atual ao conteúdo do TXT
			txtConteudo += linhaValores + '\n';
		});

		//Corta o \n sozinho no final
        if( txtConteudo.endsWith('\n') ){
            txtConteudo = txtConteudo.slice(0, txtConteudo.length-String('\n').length);
        }

		if( VECTORIZATION_BUILD_TYPE == 'navegador' ) {
			// Faz o download do arquivo, se solicitado
			if (downloadArquivo && downloadArquivo.endsWith('.txt')) {
				context.downloadArquivo(txtConteudo, downloadArquivo);
			}

		//Se for node
		}else if( VECTORIZATION_BUILD_TYPE == 'node' ){


		}

		return txtConteudo;
	}

	/**
	* Carrega um arquivo JSON do computador via upload e depois injeta dentro deste DataStructure
	* @param {Function} callback 
	*/
	context.loadJSON = function(callback) {

		if( VECTORIZATION_BUILD_TYPE == 'navegador' ) {
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

		//Se for node
		}else if( VECTORIZATION_BUILD_TYPE == 'node' ){
			
		}
	}

	/**
	* Carrega um arquivo JSON do computador via upload e depois injeta dentro deste DataStructure
	* @param {Function} callback 
	*/
	context.loadJSON_indexado = function(callback) {

		if( VECTORIZATION_BUILD_TYPE == 'navegador' ) {
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

						for( let i = 0 ; i < Object.keys(jsonData).length ; i++ )
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

		//Se for node
		}else if( VECTORIZATION_BUILD_TYPE == 'node' ){
			
		}
	}

	/**
	* Carrega um arquivo JSON do computador via upload e depois injeta dentro deste DataStructure
	* @param {Function} callback 
	*/
	context.loadJSON_colunas = function(callback) {

		if( VECTORIZATION_BUILD_TYPE == 'navegador' ) {
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

						const camposPresentes    = Object.keys(jsonData);
						const quantidadeCampos   = camposPresentes.length;
						const quantidadeAmostras = jsonData[ camposPresentes[0] ].length;

						for( let i = 0 ; i < quantidadeAmostras ; i++ )
						{
							//Extrai as informações
							const dadosAmostra = [];

							//Para cada campo
							camposPresentes.forEach(function(nomeCampo){
								dadosAmostra.push( jsonData[nomeCampo][i] );
							});

							const keysAmostra     = camposPresentes;
				
							//Vai salvando as chaves no mapa de chaves identificadas
							keysAmostra.forEach(function(chave){
								map_keysIdentificadas_tratado[chave] = true;
							});
				
							const valoresAmostra = dadosAmostra;
				
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

		//Se for node
		}else if( VECTORIZATION_BUILD_TYPE == 'node' ){
			
		}
	}

	/**
	* Carrega um arquivo CSV do computador via upload e injeta dentro deste DataStructure
	* @param {Function} callback
	* @param {string} separador Separador usado no CSV (padrão: ',')
	*/
	context.loadCSV = function(callback, separador = ',') {

		if( VECTORIZATION_BUILD_TYPE == 'navegador' ) {
			// Cria dinamicamente o elemento <input> do tipo "file"
			const inputFile = document.createElement("input");
			inputFile.type = "file";
			inputFile.accept = ".csv"; // Aceita apenas arquivos CSV

			// Adiciona o evento "change" para capturar o arquivo selecionado
			inputFile.addEventListener("change", function(event) {
				const file = event.target.files[0]; // Obtém o primeiro arquivo selecionado

				if (!file) return; // Caso nenhum arquivo seja selecionado, não faz nada

				const reader = new FileReader();

				// Lê o conteúdo do arquivo como texto
				reader.onload = function() {
					try {
						const csvData = reader.result;

						// Divide as linhas do CSV
						const linhas = csvData.split(/\r?\n/).filter(linha => linha.trim() !== '');

						// Extrai os cabeçalhos (primeira linha)
						const nomesCampos = linhas[0].split(separador).map(campo => campo.trim());

						// Processa os dados (demais linhas)
						const dadosTratados = linhas.slice(1).map(linha => {
							const valores = linha.split(separador).map(valor => valor.trim());

							// Gera um objeto chave-valor com base nos cabeçalhos
							const amostra = {};
							nomesCampos.forEach((nome, index) => {
								amostra[nome] = valores[index] || null; // Lida com campos vazios
							});

							return amostra;
						});

						// Atualiza os dados do DataStructure
						context.nomesCampos = nomesCampos;
						context.keysIdentificadas = nomesCampos;
						context.content = dadosTratados.map(amostra =>
							Object.values(amostra)
						);
						context._matrix2Advanced();
						context.mapearNomes();
						context.atualizarQuantidadeColunasLinhas();

						context.columns = context.content[0]?.length || 0;
						context.colunas = context.columns;

						context.injetarFuncoesAmostras();

						if (callback) {
							// Chama o callback com os dados CSV
							callback(dadosTratados, context);
						}
					} catch (error) {
						console.error("Erro ao carregar o arquivo CSV:", error);
						alert("O arquivo selecionado não é um CSV válido.");
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

		//Se for node
		}else if( VECTORIZATION_BUILD_TYPE == 'node' ){

		}
	}

	/**
	* Carrega um arquivo TXT do computador via upload e injeta dentro deste DataStructure.
	* @param {Function} callback Função a ser chamada após carregar os dados.
	* @param {string} separador Separador usado no TXT (padrão: '\t').
	*/
	context.loadTXT = function(callback, separador = '\t') {

		if( VECTORIZATION_BUILD_TYPE == 'navegador' ) {

			// Cria dinamicamente o elemento <input> do tipo "file"
			const inputFile = document.createElement("input");
			inputFile.type = "file";
			inputFile.accept = ".txt"; // Aceita apenas arquivos TXT

			// Adiciona o evento "change" para capturar o arquivo selecionado
			inputFile.addEventListener("change", function(event) {
				const file = event.target.files[0]; // Obtém o primeiro arquivo selecionado

				if (!file) return; // Caso nenhum arquivo seja selecionado, não faz nada

				const reader = new FileReader();

				// Lê o conteúdo do arquivo como texto
				reader.onload = function() {
					try {
						const txtData = reader.result;

						// Divide as linhas do TXT
						const linhas = txtData.split(/\r?\n/).filter(linha => linha.trim() !== '');

						// Extrai os cabeçalhos (primeira linha)
						const nomesCampos = linhas[0].split(separador).map(campo => campo.trim());

						// Processa os dados (demais linhas)
						const dadosTratados = linhas.slice(1).map(linha => {
							const valores = linha.split(separador).map(valor => valor.trim());

							// Gera um objeto chave-valor com base nos cabeçalhos
							const amostra = {};
							nomesCampos.forEach((nome, index) => {
								amostra[nome] = valores[index] || null; // Lida com campos vazios
							});

							return amostra;
						});

						// Atualiza os dados do DataStructure
						context.nomesCampos = nomesCampos;
						context.keysIdentificadas = nomesCampos;
						context.content = dadosTratados.map(amostra =>
							Object.values(amostra)
						);
						context._matrix2Advanced();
						context.mapearNomes();
						context.atualizarQuantidadeColunasLinhas();

						context.columns = context.content[0]?.length || 0;
						context.colunas = context.columns;

						context.injetarFuncoesAmostras();

						if (callback) {
							// Chama o callback com os dados TXT
							callback(dadosTratados, context);
						}
					} catch (error) {
						console.error("Erro ao carregar o arquivo TXT:", error);
						alert("O arquivo selecionado não é um TXT válido.");
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

		//Se for node
		}else if( VECTORIZATION_BUILD_TYPE == 'node' ){

		}
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
	* Verifica se um JSON exato existe dentro deste DataStructure
	* Ou seja, procura uma amostra dentro deste DataStructure que seja exatamente igual ao JSON passado
	* @param {JSON} dadosAmostra 
	* @returns {Object}
	*/
	context.existeJSON = function( dadosAmostra={} ){
		let nomesCamposDadosAmostra = Object.keys( dadosAmostra );
		let encontrado       = false;
		let indiceEncontrado = 0;
		let linhaEncontrado  = null;

		for( let i = 0 ; i < context.linhas ; i++ )
		{
			const indiceLinha = i;
			const linha       = context.getLinha(i);

			// Para cada campo do dadosAmostra, verifica se o valor dele é igual ao da amostra atual "i"
			let iguais = 0;
			
			(nomesCamposDadosAmostra)
			.forEach(function( nomeCampo ){

				if( linha.getCampo(nomeCampo).raw() == dadosAmostra[nomeCampo] ){
					iguais++;
				}

			});

			// Se todos os valores são iguais
			if( nomesCamposDadosAmostra.length == iguais )
			{
				encontrado = true;
				indiceEncontrado = i;
				linhaEncontrado = linha;
				break;
			}
		}

		return { 
			encontrado       : encontrado, 
			indiceEncontrado : indiceEncontrado,
			amostra          : linhaEncontrado,
			campos           : nomesCamposDadosAmostra
		};
	}

	/**
	* Verifica se um Array exato existe dentro deste DataStructure
	* Ou seja, procura uma amostra dentro deste DataStructure que seja exatamente igual ao Array passado
	* Em outras palavras, é a mesma coisa que o "existeJSON" só que para Array
	* @param {JSON} arrayAmostra 
	* @returns {Object}	
	*/	
	context.existeArray = function( arrayAmostra ){
		const nomeCamposDataStructure = context.nomesCampos;
		const JSONAmostra = {};

		if( arrayAmostra.length != nomeCamposDataStructure.length ){
			throw Error(`Voce precisa passar todos os campos!. Precisa ter esses campos: ${nomeCamposDataStructure}`);
		}

		nomeCamposDataStructure.forEach(function( nomeCampo ){
			const indiceCampo = context.mapaCampos[ nomeCampo ];
			JSONAmostra[ nomeCampo ] = arrayAmostra[indiceCampo];
		});

		return context.existeJSON(JSONAmostra);
	}

	/**
	* Verifica se uma amostra JSON ou ARRAY existe dentro deste DataStructure
	* Faz uso do "existeArray" e "existeJSON"
	* @param {Object|Array} instanciaAmostra 
	* @returns {Object}
	*/
	context.existeAmostra = function(instanciaAmostra){
		if( typeof instanciaAmostra == 'object' && !(instanciaAmostra instanceof Array) ){
			return context.existeJSON( instanciaAmostra );

		}else if( instanciaAmostra instanceof Array ){
			return context.existeArray( instanciaAmostra );
		
		}else{
			throw new Error("estrutura de amostra inesperada!");
			
		}
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
    * Permite fatiar(ou recortar) o DataStructure
    * @param {linhaInicial} - inicio
    * @param {linhaFinal} - final
    * @param {intervalo} - intervalo
    * @returns {Vectorization.Matrix} - o DataStructure recortado
    */
    context.slice = function(linhaInicial, linhaFinal, intervalo=1){
        let dadosRecortados = [];

        if( linhaInicial < 0 ){
            throw 'A linhaInicial precisa ser maior ou igual a zero!';
        }

        if( linhaFinal > context.rows ){
            throw 'A linhaFinal precisa estar entre as linhas da matriz! valor muito alto!';
        }

        if( intervalo <= 0 ){
            throw 'O intervalo precisa ser maior que zero!';
        }

        for( let i = linhaInicial ; i < linhaFinal ; i = i + intervalo )
        {
            dadosRecortados.push( context.getLinha(i).rawProfundo() );
        }

		const parametrosDados = {
			campos: context.nomesCampos, 
			flexibilidade: context.flexibilidade 
		};

        return Analise.DataStructure( Vectorization.Matrix( 
			                                                dadosRecortados, 
			                                                parametrosDados
														  ).raw(),
									  parametrosDados
									);
    }

    context.recortarLinhas = context.slice;
    context.sliceLinhas = context.slice;

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
			vetorAmostra.adicionarCampo = function( nomeCampo, valorDefinir, flexibilidadeUsada ){
				context.criarCampoEmBranco( nomeCampo );
				vetorAmostra.setCampo( nomeCampo, valorDefinir );

				//Adiciona na flexibilidade
				context.flexibilidade[ context.getIndiceCampo( nomeCampo ) ] = flexibilidadeUsada;
			}

			//Converte a amostra para JSON
			vetorAmostra.toJSON = function(){
				const estruturaCamposAmostra = {};

				context.getNomeCampos().forEach( function(nomeCampo){ 
					estruturaCamposAmostra[nomeCampo] = vetorAmostra.getCampo(nomeCampo).raw();
				});

				return estruturaCamposAmostra;
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
    * Se o parametro "sobrescrever" for true, então, Se o ID(o campo chave) existir, e os campos existem em ambos os DataStructures, então ele vai sobrescrever o valor dessas amostras no primeiro DataStructure pelos valores que estão no segundo DataStructure
    * Voce pode ignorar alguns campos na hora de sobrescrever, basta atribuir ao campo o valor A.IGNORE.
	* 
	* Retorna o contexto atual do DataStructure com essa junção feita
	*/
	context.mergeWith = function( outraDataStructure, campoChave='nome', sobrescrever=false ){
		
		const campoChaveIsArray  = campoChave instanceof Array ? true : false; 
		const campoChaveIsString = (!campoChaveIsArray && typeof campoChave == 'string') ? true : false; 

		const camposEste  = context.getNomeCampos();

		//Pegar os campos que tem no OUTRO DataStructure  QUE NÂO EXISTEM NO DataStructure Atual
		const camposOutro = outraDataStructure.getNomeCampos().filter(function( nomeCampo ){ return !camposEste.includes(nomeCampo) });

		//Percorrer cada amostra do outro DataStructure
		outraDataStructure.forEach(function( indiceAmostra, amostraOutroVector, contextOutro ){

			//Verifica se o campo NOME da amostra atual deste DataStructure tem exatamente o mesmo valor que o campo NOME do OUTRO DataStructure 
			let seCorresponde = false;
			for( let i = 0 ; i < context.linhas ; i++){
				const amostraAtual = context.getAmostra(i);

				//Se algum campo chave foi correspondido
				if( 
					//Se o parametro for um array de nome de campos, usa eles como chave, PRA VERIFICAR se alguma amostra for correspondido
					(
						campoChaveIsArray  == true && 
						campoChave.map(function( campoChaveAtual ){
											return amostraAtual.getCampo(campoChaveAtual).raw() == amostraOutroVector.getCampo(campoChaveAtual).raw()
									})
									.some(( condicao )=>{ return condicao == true }) == true
					) 

					//Ou então, se existe apenas um unico campo chave, usa apenas ele PRA VERIFICAR se alguma amostra for correspondido
					|| (campoChaveIsString == true && amostraAtual.getCampo(campoChave).raw() == amostraOutroVector.getCampo(campoChave).raw() )

				){
					seCorresponde = true; //Sinaliza que encontrou alguma correspondencia

					//Para cada campo DO OUTRO QUE NÂO EXISTE NESSE 
					//Dados que serão adicionados neste DataStructure
					
					camposOutro.forEach(function( campoOutro ){
						const valorInserir = amostraOutroVector.getCampo( campoOutro );

						//Obtem a flexibilidade do campo
						const indiceCampoOutro          = outraDataStructure.getNomeCampos().indexOf( campoOutro );
						const flexibilidadeCampoOutro   = outraDataStructure.flexibilidade[ indiceCampoOutro ];

						//Se o campo não existe no DataStructure atual
						//Adiciona o campo apenas na amostraAtual, e nas demais amostras, preenche aquele campo com null se ele não existir
						amostraAtual.adicionarCampo( campoOutro, valorInserir, flexibilidadeCampoOutro );
					});	

					//Se for permitido sobrescrever campos
					if( sobrescrever == true )
					{
						//Para cada campo do primeiro DataStructure
						camposEste.forEach(function( campoEste ){

							//Se o campo atual deste primeiro DataStructure tambem existe no segundo DataStructure
							if( contextOutro.existeCampo( campoEste ) == true ){
								//Obtem a flexibilidade do campo
								const indiceCampoOutro          = outraDataStructure.getNomeCampos().indexOf( campoEste );
								const flexibilidadeCampoOutro   = outraDataStructure.flexibilidade[ indiceCampoOutro ];
								const valorCampoOutro           = amostraOutroVector.getCampo( campoEste );

								//Se não for um campo que deve ser ignorado
								if( valorCampoOutro.raw() != Analise.IGNORE && 
								    valorCampoOutro.raw() != null &&
									!isNaN(valorCampoOutro.raw())
								){
									//Define o valor da amostra atual deste primeiro DataStructure 
									amostraAtual.setCampo( campoEste, valorCampoOutro );
								}
							}

						});
					}

					//Não faz sentido ter mais de uma amostra que bate com a chave, pois muitas vezes o campo chave vai ser unico, por isso usei 'break'
					break;
				}
			}

			//Se não encontrou nenhuma correspondencia
			if( !seCorresponde ){
				
				//Cria os campos em branco
				const camposCriar = outraDataStructure.getNomeCampos();
				context.criarCamposEmBranco( camposCriar );

				//Ajusta a flexibilidade antes de adicionar os campos que faltam
				camposCriar.forEach(function( nomeCampo ){
					//Obtem a flexibilidade do campo
					const indiceCampoEste          = context.getNomeCampos().indexOf( nomeCampo );
					const indiceCampoOutro         = outraDataStructure.getNomeCampos().indexOf( nomeCampo );
					const flexibilidadeCampoOutro  = outraDataStructure.flexibilidade[ indiceCampoOutro ];

					//Define a flexibilidade
					context.flexibilidade[ indiceCampoEste ] = flexibilidadeCampoOutro;
				});

				//Vai apenas adicionar a amostra 'amostraOutroVector' ao DataStructure atual

				//Monta os campos que vai adicionar
				const estruturaCamposAmostra = {};
				camposEste.forEach( function(nomeCampo){ 
					
					if( contextOutro.existeCampo(nomeCampo) == true ){
						//Se ja existe então a flexibilidade tambem ja esta definida

						//Define o valor
						estruturaCamposAmostra[nomeCampo] = amostraOutroVector.getCampo(nomeCampo).raw();

					//Se o campo não existe no outro DataStructure, define um valor padrão, e ajusta a flexibilidade
					}else{
						//Define o valor
						estruturaCamposAmostra[nomeCampo] = 0;
					}
					
				});
				
				context.inserir( estruturaCamposAmostra );

				context.columns = context.content[0].length;
				context.colunas = context.columns;

				context.injetarFuncoesAmostras();
			}
		});

		return context;
	}

	/**
	* SUBSTITUIR AMOSTRAS:
	*	substitui certos campos das amostras do primeiro DataStructure, com os valores que estão no segundo DataStructure
	*
    * Se o ID(o campo chave) existir, e os campos existem em ambos os DataStructures, então ele vai sobrescrever o valor dessas amostras no primeiro DataStructure pelos valores que estão no segundo DataStructure
    * Voce pode ignorar alguns campos na hora de sobrescrever, basta atribuir ao campo o valor A.IGNORE.
	* 
	* Retorna o contexto atual do DataStructure com essa substituição feita
	*/
	context.substituirCamposAmostras = function( outraDataStructure, campoChave='nome' ){
		
		const campoChaveIsArray  = campoChave instanceof Array ? true : false; 
		const campoChaveIsString = (!campoChaveIsArray && typeof campoChave == 'string') ? true : false; 
		const camposEste  = context.getNomeCampos();

		//Percorrer cada amostra do outro DataStructure
		outraDataStructure.forEach(function( indiceAmostra, amostraOutroVector, contextOutro ){

			//Verifica se o campo NOME da amostra atual deste DataStructure tem exatamente o mesmo valor que o campo NOME do OUTRO DataStructure 
			let seCorresponde = false;
			for( let i = 0 ; i < context.linhas ; i++){
				const amostraAtual = context.getAmostra(i);

				//Se algum campo chave foi correspondido
				if( 
					//Se o parametro for um array de nome de campos, usa eles como chave, PRA VERIFICAR se alguma amostra for correspondido
					(
						campoChaveIsArray  == true && 
						campoChave.map(function( campoChaveAtual ){
											return amostraAtual.getCampo(campoChaveAtual).raw() == amostraOutroVector.getCampo(campoChaveAtual).raw()
									})
									.some(( condicao )=>{ return condicao == true }) == true
					) 

					//Ou então, se existe apenas um unico campo chave, usa apenas ele PRA VERIFICAR se alguma amostra for correspondido
					|| (campoChaveIsString == true && amostraAtual.getCampo(campoChave).raw() == amostraOutroVector.getCampo(campoChave).raw() )

				){
					seCorresponde = true; //Sinaliza que encontrou alguma correspondencia

					//Para cada campo do primeiro DataStructure
					camposEste.forEach(function( campoEste ){

						//Se o campo atual deste primeiro DataStructure tambem existe no segundo DataStructure
						if( contextOutro.existeCampo( campoEste ) == true ){
							//Obtem a flexibilidade do campo
							const indiceCampoOutro          = outraDataStructure.getNomeCampos().indexOf( campoEste );
							const flexibilidadeCampoOutro   = outraDataStructure.flexibilidade[ indiceCampoOutro ];
							const valorCampoOutro           = amostraOutroVector.getCampo( campoEste );

							//Se não for um campo que deve ser ignorado
							if( valorCampoOutro != undefined &&
								valorCampoOutro.raw() != Analise.IGNORE && 
								valorCampoOutro.raw() != null &&
								!isNaN(valorCampoOutro.raw())
							){
								//Define o valor da amostra atual deste primeiro DataStructure 
								amostraAtual.setCampo( campoEste, valorCampoOutro );
							}
						}

					});

					//Não faz sentido ter mais de uma amostra que bate com a chave, pois muitas vezes o campo chave vai ser unico, por isso usei 'break'
					break;
				}
			}

		});

		return context;
	}

	/**
	* Adiciona uma ou mais nova(s) amostra(s). 
	* Para isso basta passar um JSON da amostra, ou um ARRAY DE JSONs das amostras
	*
	* >>>> Exemplo com uma única amostra (JSON) <<<<
	* 	@example
	* 	context.inserir({ nome: 'William',  cf: 30, idade: 32 })
	*
	* >>>> Exemplo com múltiplas amostras (Array de JSONs) <<<<
	* 	@example
	* 	context.inserir([
	*   	{ nome: 'William',  cf: 30, idade: 32 },
	*   	{ nome: 'Pedro',  cf: 30, idade: 45 }
	* 	]);
	*
	* >>>> Exemplo com múltiplas amostras (Array de Array) <<<<
	* 	@example
	* 	context.inserir([
	*   	[ 'William', 30, 32 ],
	*		[ 'Pedro',   30, 45 ]
	* 	]);
	*/
	context.inserir = function( amostraObj ){
		// Caso o argumento seja um array, iterar e inserir cada amostra individualmente

		if ( Array.isArray(amostraObj) == true && 
			 //O que esta dentro do Array principal NÂO PODE SER UM ARRAY. POIS SE FOR, ENTÂO VAMOS TER QUE USAR OUTRA ESTRATEGIA
			 Array.isArray(amostraObj[0]) == false 
		) {
			amostraObj.forEach((amostra) => context.inserir(amostra));

		//Se o que está dentro do array principal for um Array tambem
		}else if( Array.isArray(amostraObj) == true && 
				  //O que esta dentro do Array principal SE FOR UM ARRAY, ENTÂO VAMOS TER QUE USAR ESSA ESTRATEGIA
				  Array.isArray(amostraObj[0]) == true  
		){
			amostraObj.forEach((amostra) => {

				let array2objeto = {};
				amostra.forEach(function( valorCampo, indiceCampo ){
					array2objeto[ context.nomesCampos[ indiceCampo ] ] = valorCampo;
				});

				context.inserir(array2objeto);

			});
		} 
		// Caso seja uma única amostra (Vector ou Objeto)
		else {

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
		const pesquisaSubstituir         = context.findSamples(criterios);
		const indiceColunaSubstituir = context.getIndiceCampo(nomeCampo);

		for( let i = 0 ; i < pesquisaSubstituir.length ; i++ )
		{
			const amostraSubstituir   = pesquisaSubstituir[i];
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
	* Calcula a correlação entre dois campos 
	*/
	context.correlacaoCampos = function( campo1, campo2 ){
		return Vectorization.Math.correlation( 
			                                   Vectorization.Vector( context.extrairValoresCampo(campo1).rawProfundo() ), 
		                                       Vectorization.Vector( context.extrairValoresCampo(campo2).rawProfundo() ) 
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

	/**
	* Extrai as ultimas linhas
	*/
	context.ultimas = function( ultimas_linhas ){
		if(!ultimas_linhas){
			throw 'Voce precisa dizer quantas linhas são!';
		}
		if( context.linhas-ultimas_linhas < 0 ){
			throw `Impossivel voltar ${ ultimas_linhas } linhas sendo que o seu DataStructure possui apenas ${context.linhas} amostras.`;
		}

		return context.lineRange( context.linhas-ultimas_linhas, context.linhas );
	}

	/**
	* Extrai as ultimas linhas
	*/
	context.ultimos = context.ultimas;

	/**
	* Extrai as primeiras linhas
	*/
	context.primeiras = function( primeiras_linhas ){
		if(!primeiras_linhas){
			throw 'Voce precisa dizer quantas linhas são!';
		}
	
		return context.lineRange( 0, primeiras_linhas );
	}

	/**
	* Extrai as primeiras linhas
	*/
	context.primeiros = context.primeiras;

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
		//Modifica a flexibilidade adicionando a flexibilidade adequada para o retorno da função aplicada
        context.flexibilidade.push( 
            typeof funcao(0, context.getLinha(0)) == 'string' 
            ? 'texto' 
            : 
            typeof funcao(0, context.getLinha(0)) == 'number' 
            ? 'numero' 
            : 'texto'
        );

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
		//context.nomesCampos.push(novoCampo);
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
        //Modifica a flexibilidade adicionando a flexibilidade adequada para o retorno da função aplicada
        context.flexibilidade.push( 
            typeof funcao(0, context.getLinha(0)) == 'string' 
            ? 'texto' 
            : 
            typeof funcao(0, context.getLinha(0)) == 'number' 
            ? 'numero' 
            : 'texto'
        );

		// Iterar sobre as linhas e aplicar a função
		const novaColuna = context.map((indiceLinha, linha) => {
			return funcao(indiceLinha, linha);
		});

		// Adicionar a nova coluna aos dados
		context.adicionarColuna( novaColuna, novoCampo );

		// Atualizar metadados
		//context.nomesCampos.push(novoCampo);

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

	/**
	* Agrupa amostras usando algumas colunas
	* Por exemplo, ele pode ser usado para agrupar todas as amostras de vendas que foram feitas NO DIA DA SEMANA
	* Por exemplo, Ao agrupar por DIA DA SEMANA, teriamos um DataStructure para as segundas feitas, outro para as terças feitas, etc...
	*/
	context.agrupar = function( colunaOuColunas ){
		const colunasAgrupar   = colunaOuColunas instanceof Array ? colunaOuColunas : [colunaOuColunas];

		const agrupagens       = {
			objectName: 'Agrupador',
			path: 'Analise.DataStructure.Agrupador',
		};

		/**
		* Para cada coluna que queremos agrupar 
		*/
		colunasAgrupar.forEach(function( nomeColuna, indiceColuna ){

			agrupagens[ nomeColuna ] = {};
			//Cria um getter para acessar grupagens[ nomeColuna ]
			agrupagens[`get${ nomeColuna[0].toUpperCase() + nomeColuna.slice(1, nomeColuna.length) }`] = function(){
				return agrupagens[nomeColuna];
			}
			
			const valoresPossiveis = context.extrairValoresCampo( nomeColuna )
									        .valoresUnicos()
										    .raw();

			/**
			* Para cada valor possivel DESSA COLUNA
			*/
			valoresPossiveis.forEach(function( valorAtual, indiceValorAtual ){

				//Cria um objeto para armazenar TODAS AS AMOSTRAS QUE TEM O VALOR ATUAL
				let datastructureValorAtual = Analise.DataStructure([], {...context._config});

				datastructureValorAtual.indexOrigem = {};
				datastructureValorAtual.getIndices = function(){
					return datastructureValorAtual.indexOrigem;
				}

				/**Para cada amostra */
				context.paraCadaLinha(function(indiceAmostra_iteracao, vetorAmostra){

					const indiceAmostra = vetorAmostra.index;

					//Se a amostra tem o valor VALOR na coluna
					if( vetorAmostra.getCampo( nomeColuna ).raw() == valorAtual ){
						datastructureValorAtual.push( vetorAmostra.clonar().raw() );

						//Faz um link para a ultima amostra adicionada, com o indice que estava no DataStructure de origem
						datastructureValorAtual.indexOrigem[ indiceAmostra ] = context.ultimos(1)[0];
					}

				});

				agrupagens[ nomeColuna ][ valorAtual ] = datastructureValorAtual;
				//Cria um getter para acessar agrupagens[ nomeColuna ][ valorAtual ]
				agrupagens[ nomeColuna ][`get${ String(valorAtual)[0].toUpperCase() + String(valorAtual).slice(1, String(valorAtual).length) }`] = function(){
					return agrupagens[ nomeColuna ][ valorAtual ];
				}

			});

		});

		return agrupagens;

		
	}

	/**
	* Muda a organização dos campos.
	* O que estava no ultimo pode ser arrastado para o primeiro, e vice versa.
	* Para mudar a ordem dos campos, voce precisa passar um novo Array contendo as colunas na nova organiação que voce deseja.
	*
	* NOTA: Esta função permite organizar os campos na ordem que voce quiser. Voce pode omitir campos que voce não queira usar. 
	*
	* @param { Array } novaOrdem - A nova ordem que voce deseja deixar o DataStructure atual.
	* @returns {Analise.DataStructure} - Um novo DataStructure com as colunas organizadas na nova ordem
	*/
	context.organizarCampos = function( novaOrdem ){

		return Analise.DataStructure(

				context.rawProfundo(), 

				//Extrai apenas os campos que queremos com exatamente a nova ordem que queremos
				{
					campos: context.nomesCampos, 
					flexibilidade: context.flexibilidade
				}

		).extrairValoresCampos(novaOrdem);

	}

	/*** Metodos de reamostragem ***/

	/**
	* Um método de reamonstragem em que as amostras selecionadas podem se repetir
	* @param {Number} quantidadeAmostras
	* @returns {Analise.DataStructure}
	*/
	context.bootstrapping = function( quantidadeAmostras ){

		let amostrasSelecionadas = [];

		if(!quantidadeAmostras){
			throw Error(`Voce precisa escolher uma quantidade de amostras!`);
		}

		//Enquanto não terminar de escolher N amostras
		while(amostrasSelecionadas.length < quantidadeAmostras)
		{
			const numeroAleatorio  = Vectorization.Random.gerarNumeroInteiroAleatorio( 0, context.linhas );

			const amostraEscolhida = context.getLinha( numeroAleatorio )
											.rawProfundo();

			amostrasSelecionadas.push( amostraEscolhida );
		}

		return new Analise.DataStructure(amostrasSelecionadas, 
										 {
											flexibilidade: context.flexibilidade,
											campos       : context.nomesCampos
										 });

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

	/** Criação ou modificação de features */

	/**
	* Adiciona um tipo de padrão linear em um determinado campo de todas as amostras.
	* Um padrão que tem um tipo de dependencia temporal, pois, os valores das amostras anteriores foram progredindo gradualmente até chegar no valor da amostra atual
	*
	* OBS: Ele não vai criar amostras. Em vez disso, ele vai ir percorrendo as amostras do DataStructure, e aplicando as mudanças nas colunas pra refletir esse padrão ao longo das amostras
	*
	* Você vai poder definir a partir de qual amostra, ele vai começar a subir, ou então, assumir uma subida constante que pode aumentar em intensidade conforme vai passando pelas amostras. Cada amostra pode ter um peso
	*
	* Ou também, podemos aplicar essa regra por critérios(usando funções) ou critérios internos.
	* Como faixas de valores, e níveis de subida pra determinados ranges de valores da coluna da amostra 
	*
	* Deve ser um método bastante flexível, que pode ser usado inclusive pra reforçar/intensificar padrões já existentes noa dados, percorrendo as amostras, e acrescentando o padrão a coluna desejada. E claro, certas amostras podem não ser modificadas, enquanto outras podem receber a modificação, e o método pode criar padrões sequenciais(onde o valor atual depende do valor anterior), dependendo do tipo de padrão usado, e das configurações e condições 
	*
	* Podemos ter critérios que determinam quando o valor deve começar a subir .. quando deve começar descer, e como deve começar a descer ou subir. Cada detalhezinho pode ser controlado
	*
	* @example
	* Exemplo de uso:
	*
	*   dataset.AddLinearStandart('idade', Analise.LinearStandarts.AlwaysUp({}) );
	*
	*/
	context.AddLinearStandart = function( campo=null, detalhes={} ){
		if(!campo){
			throw Error('Voce precisa dizer qual é o campo que voce deseja aplicar o padrão!');
		}

		const detalhesPadrao = {

			//Delimita a partir de qual amostra o padrão vai começar a ser aplicado
			range: {
				startIndex: detalhes.range.startIndex || 0,
				endIndex: null
			},

			getRange: function(){
				return this.range;
			},

			//Configura a direção do padrão, se vai subir ou descer, ou ambos, ou se manter,.. e em quais condições
			sense: {

				/**
				* Quais direções eu quero: subir, descer, ou ambas 
				*/
				direction: detalhes.sense.direction || ('subindo' || 'descendo' || 'ambos'),
				
					//Metodos dele
					getDirection: function(){
						return this.direction;
					},

					setDirection: function( direcao ){
						this.direction = direcao;
					},

				/**
				* Uma função que vai dizer quando o valor atual deve se manter estagnado 
				*/
				stayCondition: detalhes.sense.stayCondition, //Funcao

					//Metodos dele
					getStayCondition: function(){
						return this.stayCondition;
					},

					setStayCondition: function( condicao ){
						this.stayCondition = condicao;
					},

				/**
				* Uma função que vai dizer quando o valor atual deve subir
				*/
				upCondition: detalhes.sense.upCondition, //Funcao

					//Metodos dele
					getUpCondition: function(){
						return this.upCondition;
					},

					setUpCondition: function( condicao ){
						this.upCondition = condicao;
					},

				/**
				* Uma função que vai dizer quando o valor atual deve descer
				*/
				downCondition: detalhes.sense.downCondition, //Funcao

					//Metodos dele
					getDownCondition: function(){
						return this.downCondition;
					},

					setDownCondition: function( condicao ){
						this.downCondition = condicao;
					},
			},

			getSense: function(){
				return this.sense;
			},

			//Configura a força, ou seja, a força dos passos
			steps: {
				
				/**
				* Controla se vai somar ou apenas definir o valor atual nas amostras 
				*/
				insertionType:   detalhes.steps.insertionType || 'sum',

				/**
				* Se vai ter ruidos aleatorios nos passos do valor atual
				*/
				randomNoises:    detalhes.steps.randomNoises || false, //JSON ou falso

				/**
				* Se vai ter ruidos customizados nos passos do valor atual
				*/
				customNoises:    detalhes.steps.customNoises || false, //Funcao ou falso

				/**
				* Valor inicial do "valor atual"
				*/
				initialValue:    detalhes.steps.initialValue || 0,

				/**
				* Função que controla o valor do passo do "valor atual" quando ele estiver subindo
				*/
				stepUp: detalhes.steps.stepUp || 0.1, //Funcao ou valor

				/**
				* Função que controla o valor do passo do "valor atual" quando ele estiver descendo
				*/
				stepDown: detalhes.steps.stepDown || 0.1, //Funcao ou valor

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
				beforeStep: detalhes.steps.beforeStep,

				/**
				* Callback que vai rodar depois de cada passo do "valor atual"
				*/
				afterStep: detalhes.steps.afterStep,
			},

			getSteps: function(){
				return this.steps;
			}

		}
 
		//Para cada amostra
		let valorAtual = detalhesPadrao.steps.initialValue;

		for( let numeroAmostra = detalhesPadrao.range.startIndex; 
			 numeroAmostra < ( detalhesPadrao.range.endIndex == null ? context.linhas : detalhesPadrao.range.endIndex); 
			 numeroAmostra++ 
		){

			/**
			* Obtem o valor atual na amostra atual 
			*/
			const valorCampoAmostra = context.content[ numeroAmostra ].getCampo( campo )
																	  .raw();

			/**
			* Parametros que serão passados para cada callback
			*/
			const parametrosCallbacks = {
				//Contexto
				time: new Date().getTime(),
				datastructure: context,
				detalhesPadrao: detalhesPadrao,

				/** Obtem a configuração do padrão atual pra permitir modificar */
				getPadrao: function(){
					return detalhesPadrao;
				},

				/** Obtem o DataStructure */
				getDataStructure: function(){
					return context;
				},

				//Amostra
				indiceAmostra: numeroAmostra,
				amostra: context.content[ numeroAmostra ],
				campo: campo,
				valor: valorCampoAmostra
			}

			//Antes do passo
			if( detalhesPadrao.steps.beforeStep && typeof detalhesPadrao.steps.beforeStep == 'function'){
				detalhesPadrao.steps.beforeStep.bind(parametrosCallbacks)(parametrosCallbacks);
			}

			/**
			* Insere o valor atual na amostra atual somando ou substituindo
			*/
			(context.content[ numeroAmostra ])
			.getCampo( campo )
			.setValor( 
				
				/* Se for somar por cima do valor que já existe */
				(detalhesPadrao.steps.insertionType == 'sum') 
				? valorCampoAmostra + valorAtual 
				:

				/* Se for substituir/trocar o valor */
				(detalhesPadrao.steps.insertionType == 'set')
				? valorAtual 
				: 0

			);

			/**
			* Modifica o valor atual:
			* Isso é feito para que, na próxima vez que a linha anterior for executada, na hora de definir o valor da proxima amostra, ele vai ser uma sequencia do anterior.
			*/
		
			//Se nao for ficar parado(sem incrementar ou decrementar). OU SEJA SE NÂO ESTIVER EM MODO DE MANTER
			if( (detalhesPadrao.sense || {}).stayCondition == undefined || (detalhesPadrao.sense || {}).stayCondition(parametrosCallbacks) == false )
			{
				/**
				* Se estiver descendo o valor
				*/
				if(  ( 
					  //Se eu permito essa direção no config do padrão
					  !detalhesPadrao.direction || 
					   detalhesPadrao.direction == 'down' || 
					   detalhesPadrao.direction == 'both'
					 ) 
					 && 
					 //Se eu defini uma condição de descida de valor
					 detalhesPadrao.sense.downCondition && detalhesPadrao.sense.downCondition(parametrosCallbacks) == true 
				){
					const valorDown = (
										typeof detalhesPadrao.steps.stepDown == 'function' 
										? detalhesPadrao.steps.stepDown(parametrosCallbacks) 
										: 
										typeof detalhesPadrao.steps.stepDown == 'number' 
										? detalhesPadrao.steps.stepDown 
										: 0

									  //Multiplica por um parametro chamado "stepRate" pra oferecer melhor controle de passos
									  ) * (detalhesPadrao.steps.stepRate || 1) * (detalhesPadrao.steps.stepDownRate || 1);

					valorAtual -= valorDown;

				}

				/**
				* Se estiver subindo o valor
				*/
				if(
					( 
					  //Se eu permito essa direção no config do padrão
					  !detalhesPadrao.direction || 
					  detalhesPadrao.direction == 'up' || 
					  detalhesPadrao.direction == 'both'
					) 
					&&  
					//Se eu defini uma condição de subida de valor
					detalhesPadrao.sense.upCondition && detalhesPadrao.sense.upCondition(parametrosCallbacks) == true 
				){
					const valorUp = (
								typeof detalhesPadrao.steps.stepUp == 'function' 
								? detalhesPadrao.steps.stepUp(parametrosCallbacks) 
								: 
								typeof detalhesPadrao.steps.stepUp == 'number' 
								? detalhesPadrao.steps.stepUp 
								: 0

								//Multiplica por um parametro chamado "stepRate" pra oferecer melhor controle de passos
								) * (detalhesPadrao.steps.stepRate || 1) * (detalhesPadrao.steps.stepUpRate || 1);

					valorAtual += valorUp;

				}

			//Se estiver mantendo, o valor se mantem
			}else{
				valorAtual = valorAtual;
			}

			//Depois do passo
			if( detalhesPadrao.steps.afterStep && typeof detalhesPadrao.steps.afterStep == 'function'){
				detalhesPadrao.steps.afterStep.bind(parametrosCallbacks)(parametrosCallbacks);
			}

		}
	}

	// Adiciona este DataStructure criado na lista de memória Painel, para permitir ser controlado e monitorado via Painel
	Analise.Painel.memoria.push(context);

    return context;
}