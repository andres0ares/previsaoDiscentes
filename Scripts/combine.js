import { writeFile } from 'fs/promises'; // Importa a função específica
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const diretorio_turmas = path.join(__dirname, '../Dados/turmasAlocadas.json');
const diretorio_disciplinas = path.join(__dirname, '../Dados/disciplinas.json');


const saida = path.join(__dirname, '../Dados/tudo.json');
const saida2 = path.join(__dirname, '../Dados/faltosos.json');

try {


    const turmasAlocadas = JSON.parse(fs.readFileSync(path.join(diretorio_turmas), 'utf-8'));
    const disciplinas = JSON.parse(fs.readFileSync(path.join(diretorio_disciplinas), 'utf-8'));

    let res = [];

    let ex = {
        not_found: [],
        no_history: []
    }

    for (let turma of Object.values(turmasAlocadas)) {

        try {

            //console.log(`../Dados/historico/${turma.codigo}.json`)
            const turmas = JSON.parse(fs.readFileSync(path.join(__dirname,`../Dados/historico/${turma.codigo}.json`), 'utf-8'));
            const historico = turmas.filter(t => t.turma == turma.turma).map(t => ({
                docentes: t.docentes,
                horario: t.horario,
                capacidade: t.capacidade,
                matriculas: t.matriculas,
                local: t.local,
                periodo: t.periodo,
                vagas: t.vagas,
            }));

            
            if(historico.length === 0) {
                ex.no_history.push(`${turma.codigo}-${turma.turma}`);
            }

            delete turma.nome; // Remover nome para evitar duplicidade
            res.push({
                ...turma,
                ...disciplinas[turma.codigo] || null,
                historico: historico || []
            });
        } catch {

            ex.not_found.push(turma.codigo)

            console.log('aqui', `../Dados/historico/${turma.codigo}.json`)
            delete turma.nome; // Remover nome para evitar duplicidade
            res.push({
                ...turma,
                ...disciplinas[turma.codigo] || null,
                historico: []
            });
        }





    }



    try {
        await writeFile(saida, JSON.stringify(res, null, 4), 'utf8');
        console.log(`Arquivo salvo com sucesso em: ${saida}.`);
    } catch (erro) {
        console.error('Falha ao gravar o arquivo:', erro);
    }

    try {
        await writeFile(saida2, JSON.stringify(ex, null, 4), 'utf8');
        console.log(`Arquivo salvo com sucesso em: ${saida}.`);
    } catch (erro) {
        console.error('Falha ao gravar o arquivo:', erro);
    }



} catch (erro) {
    console.error('Ocorreu um erro ao ler os arquivos JSON:', erro);
}

