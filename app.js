const express = require('express');
const path = require('path');
const bodyParser= require('body-parser');
const mongoose = require('mongoose');
const expressValidator= require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport =require('passport');
const config= require('./config/database');


//earliar
//mongoose.connect('mongodb://localhost/nodekb');

mongoose.connect(config.database);

let db=mongoose.connection;

//Check connection
db.once('open',function(){
  console.log('Connected to mongodb');
});

//check for db errors
db.on('error',function(err){
  console.log(err);
});


//Init app
const app = express();

//Bring in Models
let Article=require('./models/article');

//Load view engine

app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');


//Body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());

//set Public folder
app.use(express.static(path.join(__dirname,'public')));

//Express session middleware

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//Express-messages middleware

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//passport config

require('./config/passport')(passport);
//passprtt middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*' ,function(req,res,next){
  res.locals.user =req.user ||null;
  next();
});





//Home route
app.get('/',function(req,res){
  Article.find({},function(err,articles){
    if(err){
      console.log(err);
    }
    else{
    res.render('index',{
      title:'Articles',
      articles:articles
    });
  }
  });
});

/*  let articles=[
    {
      id:1,
      title:'Articles One',
      author:'Prateek Mittal',
      body:'This is article one'
    },
    {
      id:2,
      title:'Articles Two',
      author:'Varun Mittal',
      body:'This is article two'
    },
    {
      id:3,
      title:'Articles Three',
      author:'John Johanson',
      body:'This is article Three'
    }
  ];
  res.render('index',{
    title:'Articles',
    articles:articles

});*/

//Route Files

let articles=require('./routes/articles');
let users=require('./routes/users');
app.use('/articles',articles);
app.use('/users',users);


//Start srever
app.listen(3000,function(){
  console.log('Server started on port 3000...')
});
