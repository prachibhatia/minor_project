const express = require('express')
const path = require('path')
const app = express();
const port = process.env.port || 2001
const mysql = require('mysql')
const session = require('express-session')
const uuid = require('uuid')
const db = require('./db/connection')
const volleyball = require('volleyball');
const multer = require('multer');

app.use(express.json())
app.use(express.urlencoded(
     {
          extended : true
     }
))
app.use(volleyball)


app.use(session({
    secret: 'prachi learning authorisation ',
    resave: false,
    saveUninitialized: false,
    genid: function(req) {
        return uuid() // use UUIDs for session IDs
      },
    cookie: { 
        sameSite: true
     }
}))

const storage = multer.diskStorage({
     destination : './public/uploads/' ,
     filename : function(req,file,cb)
     {
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
     }
});

const upload = multer({
     storage : storage,
     fileFilter : function(req,file,cb){
          checkFileType(file,cb);
     }
}).single('myfile')

//checkFileType
function checkFileType(file,cb){
     const fileTypes = /csv/;
     const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
     if(extname)
     {
          return cb(null,true);
     }
     else{
          cb('Error:files in csv format only')
     }
}


app.post('/upload',(req,res)=>{
     upload(req,res,(err) =>
     {
          if(err){
               console.log(err);
               res.redirect('http://localhost:2001/wrong.html')
          }
          else
          {
               console.log(req.file);
               res.redirect('http://localhost:2001/correct.html')
          }
     });
});
app.use('/' , express.static('../client'))
app.use('/' , express.static('./public'))

app.get('/',(req,res) => {
    res.setHeader('Content-Type' , "text/html")
    res.sendFile(path.join(__dirname,'../client/index.html'))

})

app.post('/register',(req,res)=>{
    db.getConnection((err , connection) =>{
         if(err){
              console.log(err);
              connection.release();
              return ; 
         }
         else{
             console.log(req.body);
              console.log("Hello")
              connection.query(`INSERT INTO school_details (school_id,school_name,school_email,address,location,pincode,contactNo,password) VALUES ('${req.body.ID}','${req.body.schholname}','${req.body.email}','${req.body.address}','${req.body.location}','${req.body.pin}','${req.body.contact}','${req.body.pswd}');` , (err ,rows , fields) =>{
                   if(err){
                        console.log(err)
                        return res.send(err)
                   }
                   else {
                   return res.send({"inserted": true})
                   connection.release()
                   }
                   return res.send({"trying":"fff"})
              })
         }
    })
})

let activeID ;
app.post('/auth',(req,res)=>{
    db.getConnection((err , connection) =>{
         if(err){
              console.log(err);
              connection.release();
              return ; 
         }
         else{
             console.log(req.body);
              console.log("Hello")
              connection.query('SELECT school_id,password FROM `school_details`' , (err ,rows , fields) =>{
                   if(err){
                        console.log(err)
                        return res.send(err)
                   }
                   else {
                   console.log(rows)
                   console.log(req.body.schoolIDlogin);
                //    console.log(password);
                   let  checkusers  = false ;
                   checkusers = rows.find(user =>{
                   if(user.school_id == req.body.schoolIDlogin){
                      if(user.password == req.body.passwordlogin){
                         return user ; 
                }
            }
             })
             if(checkusers){
                console.log(checkusers)
                activeID = checkusers.school_id;
                console.log(activeID);
                req.session.userId = checkusers.school_id;
                res.redirect('http://localhost:2001/details')
                // console.log(req.session.userId);
               // res.redirect('http://localhost:4321/')
                //return res.send({status: "Login"})
             }
           else {
           // return res.send({status: "Login failed"})
             res.redirect('http://localhost:2001/login')
           }
                   }
              })
         }
    })
})

app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'../client/login.html'))
})

app.get('/detailsINFO',(req,res)=>{
        db.getConnection((err , connection) =>{
        if(err){
             console.log(err);
             connection.release();
             return ; 
        }
        else{
             connection.query(`SELECT school_id,school_name,school_email,address,location,pincode,contactNo FROM school_details WHERE school_id = ${activeID}` , (err ,rows , fields) =>{
                  if(err){
                       console.log(err)
                       return res.send(err)
                  }
                  else {
                  console.log(rows)
                  return res.send(rows)
                  connection.release()
                  }
             })
        }
   })
})

app.get('/details',(req,res)=>{
    if(typeof(req.session.userId) != 'number'){
        return res.redirect('/login')
    }
    res.sendFile(path.join(__dirname,'../client/details.html'))
})


app.listen( port ,() => console.log(`server started on port http://localhost:${port}`))