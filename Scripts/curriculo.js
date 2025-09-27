const info = document.getElementsByClassName('visualizacao')[0].children[1].children;

let dados = {
    codigo:  info[0].children[1].textContent,
    curriculo: info[1].children[1].textContent,
    ano: Number(info[2].children[1].textContent.split(' - ')[0]),
    periodo: Number(info[2].children[1].textContent.split(' - ')[1]) ,
    carga_por_semestre_max: info[7].children[1].textContent.match(/\d+/g).map(Number)[0],
    carga_por_semestre_min: info[7].children[1].textContent.match(/\d+/g).map(Number)[1],
    disciplinas: [],
}

const periodos =  document.getElementsByClassName('subFormulario'); 
let qtd = periodos.length;

for(let i = 0; i < qtd; i++) {

    const disciplinas_do_periodo = periodos[i].children[1].children;
    for(let j  = 0; j < disciplinas_do_periodo.length -1; j++) {

        let disciplina = disciplinas_do_periodo[j].children[0].textContent.split(' - ');
        dados.disciplinas.push({
            codigo: disciplina[0],
            nome: disciplina[1],
            carga_horaria: disciplina[2],
            tipo: disciplinas_do_periodo[j].children[1].textContent.replace(/\s+/g, ''),
            optativa:  disciplina[3],
            periodo: i,
        })
    }
}

console.log(JSON.stringify(dados, null, 4));