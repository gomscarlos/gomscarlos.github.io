const { find } = require('./model/Users.js'),
      validador = require('./model/Validador.js');

const http = require('http'),
    express = require('express'),
    path = require('path'),
    app = express(),
    Users = require('./model/Users.js'),
    bodyParser = require('body-parser'),
    jwt = require('jsonwebtoken'),
    secreto = 'projeto3',
    session = require('express-session'),
    logger = require('morgan'),
    router = express.Router();

app.set('view engin', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(session({
    secret: 'projeto3',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

app.get('/', (req,res) =>{
    req.session.destroy();
    res.render('index.hbs');
});

app.post('/log', async (req, res) =>{
    const email = req.body.email;
    const password = req.body.password;
    const user = await Users.find(email);

    if(user.length == 0){
        res.status(404).end();
    }else{
        if(email === user[0].user && password === user[0].password){
            const admin = user[0].admin;
            const token = jwt.sign({userId: 1}, secreto);
            req.session.login = secreto;
            res.json({token: token, Admin: admin});
        }
    }

    res.status(401).end();
});

app.get('/login',(req,res) =>{
    res.render('entrar.hbs');
});

app.get('/signup',(req,res) =>{
    res.render('cadastrar.hbs');
});

app.post('/publicar', async (req,res)=>{
    const artista = req.body.artista;
    const musica = req.body.musica;
    const letra = req.body.letra;

    Users.publicar(artista,musica,letra);
    res.redirect('/buscar');
});

app.get('/pesquisar', async (req,res) =>{
    const artista = req.query.artista;
    const musica = req.query.musica;
    const result = await Users.pesquisar(artista,musica);
    console.log(artista,musica,result.length);
    if(result.length >0){
        res.render('logado.hbs', {musica: musica, letra: result[0].letra});
    }else{
        res.render('logado.hbs', {erro: "Música não encontrada"});
    }
});

app.get('/buscar', (req,res) =>{
    if(req.session.login)
        res.render('logado.hbs');
    else
        res.redirect('/');
})

app.post('/users', async (req,res) =>{
    const usuario = req.body.nome_usuario,
          senha = req.body.senha,
          resultado = await Users.find(usuario),
          validaSenha = validador.validaSenha(senha),
          validaEmail = validador.validaEmail(usuario);

    if(resultado.length == 0 && validaEmail == true && validaSenha == true){
        Users.insert(usuario,senha);
        res.redirect('/');
    }else if(resultado.length > 0){
        res.render('cadastrar.hbs', {erro: 'O e-mail cadastrado já existe'});
    }else{
        let senhaValida, emailValido;

        if(validaSenha == false){
            senhaValida = "A senha deve conter mais de 8 caracteres e no mínimo um símbolo e uma letra maiúscula";
        }
        if(validaEmail == false){
            emailValido = "O e-mail digitado é inválido por favor insira um e-mail válido";
        }
        res.render('cadastrar.hbs', {erroSenha: senhaValida, erroEmail: emailValido});
    }
});

var port_number = process.env.PORT || 3000;
app.listen(port_number, () => {
    console.log("Listening on port" + port_number);
});