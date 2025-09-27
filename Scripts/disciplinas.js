const fs = require('fs');
const path = require('path');


const diretorio = path.join(__dirname, '../Dados/curriculos');

try {
    
    const arquivos = fs.readdirSync(diretorio);
    const arquivosJson = arquivos.filter(arquivo => path.extname(arquivo) === '.json');

    const conteudosJson = arquivosJson.map(arquivoJson => {
        const caminhoCompleto = path.join(diretorio, arquivoJson);
        const conteudo = fs.readFileSync(caminhoCompleto, 'utf-8');
        return JSON.parse(conteudo);
    });

    // 5. Exiba o resultado
    console.log('Conteúdo de todos os JSONs:');
    console.log(conteudosJson);

} catch (erro) {
    console.error('Ocorreu um erro ao ler os arquivos JSON:', erro);
}


