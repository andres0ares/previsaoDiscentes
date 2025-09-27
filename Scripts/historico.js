import puppeteer from 'puppeteer';
import { writeFile } from 'fs/promises'; // Importa a função específica
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// ================================ LEITURA DAS DISCIPLINAS ===========================================



const entrada = path.join(__dirname, "../Dados/disciplinas.json");
const conteudo = JSON.parse(fs.readFileSync(entrada, 'utf-8'));


// // ==================================== BUSCA DOS DADOS ===============================================


const nivel = 'G';
const user = '';
const password = '';

const browser = await puppeteer.launch({
    //headless: false,
    headless: "new",
    //slowMo: 100,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();

await page.goto('https://sigaa.ufpb.br/sigaa/logon.jsf');

await page.evaluate(
    (user, password) => {
        let inputUser = document.getElementById('form:login');
        let inputPassword = document.getElementById('form:senha');

        inputUser.value = user;
        inputPassword.value = password;

        document.getElementById('form:entrar').click();

    },
    user,
    password,
);

await page.waitForNavigation();


await page.evaluate(() => {
    document.getElementById('j_id_jsp_552244886_1:consultarTurma').click();
});

await page.waitForNavigation();

let first_click = true;

for (const diciplina of Object.keys(conteudo).slice(0, 1)) {

    await page.evaluate(
        (nivel, codigo, first_click) => {

            // //nivel
            // if (first_click) {
            //     let inputNivel = document.getElementById('form:selectNivelTurma');
            //     inputNivel.value = nivel;
            //     document.getElementById('form:checkNivel').click();
            // }

            //periodo
            //por padrao esse campo é pre selecionado, se nao for usar deve desativar
            if (first_click) document.getElementById('form:checkAnoPeriodo').click();

            //codigo
            let inputCodigo = document.getElementById('form:inputCodDisciplina',);
            inputCodigo.value = codigo;

            if (first_click) document.getElementById('form:checkCodigo').click();

            document.getElementById('form:buttonBuscar').click();
        },
        nivel,
        diciplina,
        first_click,
    );

    first_click = false;

    await page.waitForNavigation();

    const res = await page.evaluate(
        async () => {

            let tbody = document.getElementById('lista-turmas').children.item(2);

            let tm = tbody.children.length;

            let codigo = '';
            let nome = '';

            let res = [];

            for (let i = 0; i < tm; i++) {
                let text = tbody.children.item(i).textContent.replace(/[\n\t]/gm, '');
                if (tbody.children.item(i).className == 'destaque') {
                    let ar = text.replace('(GRADUAÇÃO)', '').split(/-(.*)/s);
                    codigo = ar[0].replace(' ', '');
                    nome = ar[1];
                } else {
                    if (text[0] != ' ') {
                        let util = text.slice(12, text.length - 10);

                        let docentes = tbody.children
                            .item(i)
                            .children.item(2)
                            .textContent.split(' e ')
                            .map((e) => e.slice(0, util.indexOf(' (') - 2));

                        let periodo = tbody.children
                            .item(i)
                            .children.item(0)
                            .textContent.replace(/\s+/g, '');

                        let turma_el = tbody.children
                            .item(i)
                            .children.item(1)



                       const seletorDoClick = `#lista-turmas > tbody > tr:nth-child(${i + 1}) > td:nth-child(2) > a`;

                        let turma = turma_el
                            .textContent.split(' ')[1]
                            .slice(0, 2);


                        let horario = tbody.children.item(i).children.item(6).textContent;
                        let matriculas = Number(
                            tbody.children
                                .item(i)
                                .children.item(8)
                                .textContent.split('/')[0],
                        );
                        let capacidade = Number(
                            tbody.children
                                .item(i)
                                .children.item(8)
                                .textContent.split('/')[1]
                                .split(' ')[0],
                        );
                        let local = tbody.children.item(i).children.item(7).textContent;

                        res.push({
                            codigo,
                            nome,
                            turma,
                            docentes,
                            horario,
                            matriculas,
                            capacidade,
                            local,
                            periodo,
                            seletor: seletorDoClick
                        });
                    }
                }
            }

            return res;
        } 
    );

    const resultadosFinais = [];

    let count = 0;
    let total = res.length;

    for (const turma of res) {

        console.log(`processando ${++count}/${total}...`);

        await page.click(turma.seletor);

        const seletorDoPopup = '#resumo';
        await page.waitForSelector(seletorDoPopup, { visible: true });
        
        const dadosDoPopup = await page.evaluate(() => {
            const container = document.getElementsByClassName('subFormulario')[2]; 
            if (!container) return [];

            const collection = container.children[1].children;
            return Array.from(collection).map((e) => ({
                curso: e.children[0]?.textContent.trim(),
                vagas: Number(e.children[1]?.textContent.trim()),
            }));
        });

        await page.click('.ydlg-close'); 

        resultadosFinais.push({
            ...turma, // dados da lista inicial
            vagas: dadosDoPopup, // dados extraídos do pop-up
            seletor: undefined,
        });
    }


    const saida = path.join(__dirname, `../Dados/historico/${diciplina}.json`);

    try {
        await writeFile(saida, JSON.stringify(resultadosFinais, null, 4), 'utf8');
        console.log(`Arquivo salvo com sucesso em: ${saida}. Quantidade: ${Object.keys(res).length}`);
    } catch (erro) {
        console.error('Falha ao gravar o arquivo:', erro);
    }

}

await browser.close();



