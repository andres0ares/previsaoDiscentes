import { writeFile } from 'fs/promises'; // Importa a função específica
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const diretorio = path.join(__dirname, '../Dados/ultimasAlocacoes');
const saida = path.join(__dirname, '../Dados/turmasAlocadas.json');
const saida2 = path.join(__dirname, '../Dados/disciplinasAlocadas.json');

try {
    
    const arquivos = fs.readdirSync(diretorio);
    const arquivosJson = arquivos.filter(arquivo => path.extname(arquivo) === '.json');

    const conteudosJson = arquivosJson.map(arquivoJson => {
        const caminhoCompleto = path.join(diretorio, arquivoJson);
        const conteudo = fs.readFileSync(caminhoCompleto, 'utf-8');
        return JSON.parse(conteudo);
    });
    
    let dados = {};
    let dados2 = {};

    for(let alocacao of conteudosJson) {
        for(let salas of alocacao?.solution) {
            for(let turma of salas.classes) {
                
                let turma_id = turma.turma.split(' ')[0];

                dados2[turma.codigo] = {
                    codigo: turma.codigo,
                    nome: turma.nome,
                }

                dados[turma.codigo+"-"+turma_id] = {
                    codigo: turma.codigo,
                    turma: turma_id,
                    nome: turma.nome,
                }
            }
        }
    }
    

    try {
        await writeFile(saida, JSON.stringify(dados, null, 4), 'utf8');
        console.log(`Arquivo salvo com sucesso em: ${saida}. Quantidade: ${Object.keys(dados).length}`);
    } catch (erro) {
        console.error('Falha ao gravar o arquivo:', erro);
    }

     try {
        await writeFile(saida2, JSON.stringify(dados2, null, 4), 'utf8');
        console.log(`Arquivo salvo com sucesso em: ${saida2}. Quantidade: ${Object.keys(dados2).length}`);
    } catch (erro) {
        console.error('Falha ao gravar o arquivo:', erro);
    }


   

} catch (erro) {
    console.error('Ocorreu um erro ao ler os arquivos JSON:', erro);
}

