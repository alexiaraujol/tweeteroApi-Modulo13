import express, { json } from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();
const DATABASE_URL = ("mongodb://127.0.0.1:27017/tweetero");
app.use(cors());
app.use(json());

//conexão do banco de dados.
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

mongoClient.connect()
    .then(() => {
        console.log("MongoDB conectado com sucesso!");
        db = mongoClient.db()
    })
    .catch(err => console.log(err.menssage));


app.get("/tweets", (req, res) => {

    db.collection("tweets").find().toArray()
        .then(data => res.send(data))
        .catch(err => res.status(500).send(err.menssage))

});


app.post("/sign-up", (req, res) => {
    const { username, avatar } = req.body;
    if (!username || !avatar) {
        return res.status(400).send("Todos os campos são obrigatórios!");
    }

    // Verifica se o usuário já existe no banco de dados
    db.collection("users").findOne({ username })
        .then(existingUser => {
            if (existingUser) {
                return res.status(409).send("Usuário já existe!");
            }

            // Insere o novo usuário no banco de dados
            db.collection("users").insertOne({ username, avatar })
                .then(() => {
                    res.status(201).send("Usuriário criado com sucesso!");
                })
                .catch(err => {
                    console.log(err.message);
                    res.status(500).send("Erro ao inserir usuário");
                });
        })
        .catch(err => {
            console.log(err.message);
            res.status(500).send("Erro ao verificar usuário");
        });
});

app.post("/tweets", (req, res) => {
    const { username, tweet } = req.body;

    if (!username || !tweet) {
        return res.status(400).send("Todos os campos são obrigatórios!");
    }

    // Verifica se o usuário existe no banco de dados
    db.collection("users").findOne({ username })
        .then(user => {
            if (!user) {
                return res.status(401).send("UNAUTHORIZED");
            }

            const newTweet = { username, tweet };

            // Insere o tweet no banco de dados
            db.collection("tweets").insertOne(newTweet)
                .then(() => {
                    res.status(201).send("Seu tweet foi enviado com sucesso!");
                })
                .catch(err => {
                    console.log(err.message);
                    res.status(500).send("Erro ao inserir tweet");
                });
        })
        .catch(err => {
            console.log(err.message);
            res.status(500).send("Erro ao verificar usuário");
        });
});


app.listen(5000, () => {
    console.log("Servidor rodando na porta 5000");
});