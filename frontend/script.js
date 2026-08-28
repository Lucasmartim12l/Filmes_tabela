async function buscarFilmes() {
    // acessar a rota GET do backend e exibir os filmes na tela
    const resposta = await fetch("https://filmes-tabela.vercel.app/")
    const filmes = await resposta.json()
    const sectionFilmes = document.querySelector(".filmes")

    filmes.forEach((filme) => {
        sectionFilmes.innerHTML += `
            <div>
                <h2>${filme.nome}</h2>
                <p><strong>Gênero:</strong> ${filme.genero}</p>
                <p><strong>Duração:</strong> ${filme.duracao} minutos</p>
                <p><strong>Classificação indicativa:</strong> ${filme.classific_et > 0 ? filme.classific_et + ' anos' : 'Livre'}</p>
            </div>
        `
    })
}

buscarFilmes()