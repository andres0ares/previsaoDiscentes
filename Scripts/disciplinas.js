import { writeFile } from 'fs/promises'; // Importa a função específica
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const diretorio = path.join(__dirname, '../Dados/curriculos');
const saida = path.join(__dirname, '../Dados/disciplinas.json');

try {
    
    const arquivos = fs.readdirSync(diretorio);
    const arquivosJson = arquivos.filter(arquivo => path.extname(arquivo) === '.json');

    const conteudosJson = arquivosJson.map(arquivoJson => {
        const caminhoCompleto = path.join(diretorio, arquivoJson);
        const conteudo = fs.readFileSync(caminhoCompleto, 'utf-8');
        return JSON.parse(conteudo);
    });
    
    let dados = {};

    for(let curriculo of conteudosJson) {

        const curso = curriculo.curso;

        for(let disciplina of curriculo?.disciplinas) {

            if(!(disciplina.codigo in dados)) {
                dados[disciplina.codigo] = {
                    codigo: disciplina.codigo,
                    disciplina: disciplina.nome,
                    "Optativa": [],
                    "Obrigatória": [],
                    "ComplementarFlexiva": []
                }
            }
          
            dados[disciplina.codigo][disciplina.tipo].push(curso);

        }
    }
    

    try {
        await writeFile(saida, JSON.stringify(dados, null, 4), 'utf8');
        console.log(`Arquivo salvo com sucesso em: ${saida}. Quantidade: ${Object.keys(dados).length}`);
    } catch (erro) {
        console.error('Falha ao gravar o arquivo:', erro);
    }

   

} catch (erro) {
    console.error('Ocorreu um erro ao ler os arquivos JSON:', erro);
}

