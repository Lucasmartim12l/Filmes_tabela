import express from "express"
import mysql2 from "mysql2"
import cors from "cors"

const app = express()


app.use(express.json())
app.use(cors())

app.get("/", (request, response) => {
    const selectCommand = "SELECT * FROM filmes_LucasMartim"

    sql.query(selectCommand, (error, data) => {
        if (error) {
            console.log(error)
            return
        }

        response.json(data)
    })
})

app.post("/create", (request, response) => {
    const { nome, genero, duracao, classific_et } = request.body

    const insertCommand = "INSERT INTO filmes_LucasMartim(nome, genero, duracao, classific_et) VALUES (?, ?, ?, ?)"

    sql.query(insertCommand, [nome, genero, duracao, classific_et], (error) => {
        if (error) {
            console.log(error)
            return
        }

        response.status(201).json({
            message: "Filme criado com sucesso!"
        })
    })
})

app.delete("/delete/:id", (request, response) => {
    const { id } = request.params

    const deleteCommand = "DELETE FROM filmes_LucasMartim WHERE id=?"

    sql.query(deleteCommand, [id], (error) => {
        if (error) {
            console.log(error)
            return
        }

        response.json({
            message: "Filme apagado com sucesso!"
        })
    })
})

// atualizar tarefas
app.put("/update/:id", async (request, response) => {
    const { id } = request.params
    const { title, gender, duration, ageRating } = request.body

    const updateCommand = "UPDATE filmes_LucasMartim SET nome = ?, genero = ?, duracao = ?, classific_et = ? WHERE id = ?"

        sql.query(updateCommand, [title, gender, duration, ageRating, id], (error) => {
            if (error) {
                console.log(error)
                return
            }

            response.json({
                message: "Filme atualizado com sucesso!"
            })
        })
})

app.listen(3067, () => {
    console.log("Servidor rodando")
})

const sql = mysql2.createPool({
    host: "benserverplex.ddns.net",
    user: "alunos",
    password: "senhaAlunos",
    database: "alunos_filmes03TB"
})