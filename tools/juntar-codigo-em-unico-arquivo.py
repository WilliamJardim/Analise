import os,sys;

def lerArquivo(caminho):
    asLinhas = '';
    with open(caminho, 'r') as arq:
        asLinhas = arq.readlines();

    return asLinhas;

def lerArquivo_Str(caminho):
    return ''.join( lerArquivo(caminho) );

listaBuild = lerArquivo('../examples/browser/index.html');

novasLinhas = '';
for linha in listaBuild:
    if '<script src=' in str(linha).lower():
        novasLinhas += linha;

todosOsScripts_Str = novasLinhas;
todosOsScripts_List = novasLinhas.split('\n');

#Tratando removendo coisas nao precisa
novasLinhas = '';
for linha in todosOsScripts_List:
    novasLinhas += linha.replace('<script src=', '')+'\n'

novasLinhas_2 = '';
for linha in novasLinhas.split('\n'):
    novasLinhas_2 += linha.replace('></script>', '')+'\n'

novasLinhas_3 = '';
for linha in novasLinhas_2.split('\n'):
    novasLinhas_3 += linha.replace('"', '')+'\n'

listaScripts = novasLinhas_3.split('\n');

novasLinhas_4 = [];
for linha in listaScripts:
    if linha != '':
        novasLinhas_4.append(linha);

#Tratando o path das libs
novasLinhas_5 = [];
for linha in novasLinhas_4:
    if linha == 'index.js':
        novasLinhas_5.append('../examples/browser/index.js');

    else:
        if not linha.startswith('<!--'):
            novasLinhas_5.append( linha.replace('../../libs/', '../libs/').replace('../../src/', '../src/') );

listaScripts = novasLinhas_5;

#Versao tudo junto
from datetime import datetime
agora = datetime.now();

codigoCompleto = '';

codigoCompleto += '''
/*
 * Author Name: William Alves Jardim
 * Author Email: williamalvesjardim@gmail.com
 * 
 * LICENSE: MIT
*/
''';

codigoCompleto += '\n/* COMPILADO: ' + str(agora.day)+'/'+str(agora.month)+'/'+str(agora.year) + ' - ' + str(agora.strftime("%H:%M:%S")) + str() + '*/';

for arquivo in listaScripts:
    codigoCompleto += '/* ARQUIVO: ' + str(arquivo) + '*/\n'; 
    codigoCompleto += lerArquivo_Str(arquivo) + '\n';
    codigoCompleto += '/* FIM DO ARQUIVO: ' + str(arquivo) + '*/\n'; 

def salvarArquivo(caminho, conteudo):
    with open(caminho, 'w') as arq:
        arq.write(conteudo);
        arq.close();

codigoCompleto = codigoCompleto + '\nwindow.isbrowser = true;\n';

codigoCompleto = codigoCompleto + '\nwindow.iscompilation = true';

salvarArquivo('../build/Analise-builded.js', codigoCompleto);
print('Pronto!. Arquivo salvo em ../build/Analise-builded.js');

codigoCompletoNN = codigoCompleto;

codigoCompletoNN = codigoCompletoNN + '\nwindow.isbrowser = false;\n';

codigoCompletoNN = codigoCompletoNN + '\nmodule.exports = new Analise_4Node();'; 
salvarArquivo('../build/Analise-builded-4node.js', codigoCompletoNN);

print('Pronto!. Arquivo salvo em ../build/Analise-builded_4node.js');

arquivoTeste = '''
    <html>
        <head>
            <title> Analise-builded </title>
        </head>
        <body> Press F11 </body>

        <script src='Analise-builded.js'></script>

        <script>

            //Exemplo de código
            
        </script>

    </html>
'''
salvarArquivo('../build/browser-import-example.html', arquivoTeste)

arquivoTesteNode = '''
    //Exemplo de código
''';

salvarArquivo('../build/node-import-example.js', arquivoTesteNode)