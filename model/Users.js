const MongoClient = require('mongodb').MongoClient;

module.exports = class Users {
    static async find(usuario) {
        const conn = await MongoClient.connect('mongodb://127.0.0.1:27017/Users');
        const db = conn.db();

        if(usuario)
            return db.collection('users').find({user: usuario}).toArray();
            conn.close();
    }

    static async insert (usuario,senha){
        const conn = await MongoClient.connect('mongodb://127.0.0.1:27017/Users');
        const db = conn.db();

        db.collection('users').insertOne({user: usuario, password: senha, admin: false});
    }

    static async publicar(artista,musica,letra){
        const conn = await MongoClient.connect('mongodb://127.0.0.1:27017/Musics');
        const db = conn.db();

        db.collection('musics').insertOne({artista: artista, musica: musica, letra: letra});
        conn.close();
    }

    static async pesquisar(artista,musica){
        const conn = await MongoClient.connect('mongodb://127.0.0.1:27017/Musics');
        const db = conn.db();

        return db.collection('musics').find({artista: artista, musica: musica}).toArray();
    }
}