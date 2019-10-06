const express = require('express')
const path = require('path')
const app = express();
const port = process.env.port || 4296
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
               res.redirect('http://localhost:4296/wrong.html')
          }
          else
          {
               console.log(req.file.path);
               db.getConnection((err , connection) =>{
                    if(err){
                         console.log(err);
                         connection.release();
                         return ; 
                    }
                    else{
                        console.log(req.body);
                         console.log("Hello")
                         connection.query(`load data infile '/home/prachi/Desktop/MyFiles/Project/server/${req.file.path}' into table student_details fields terminated by ',' lines terminated by '\n' (school_id,adhaar_card,student_name,student_class,marks_obtained,total_marks,extra_curricular);` , (err ,rows , fields) =>{
                              if(err){
                                   console.log(err)
                                   return res.send(err)
                              }
                              else {
                              res.redirect('http://localhost:4296/correct.html')
                              connection.release()
                              }
                         })
                    }
               })
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
let schoolIDD;
let marks=[];
let curricular=[];
app.post('/results',(req,res)=>{
     db.getConnection((err , connection) =>{
          if(err){
               console.log(err);
               connection.release();
               return ; 
          }
          else{
              console.log(req.body);
               console.log("Hello")
               connection.query(`SELECT school_id FROM school_details WHERE school_name = '${req.body.schools}'`, (err ,rows , fields) =>{
                    if(err){
                         console.log(err)
                         return res.send(err)
                    }
                    else {
                         schoolIDD = rows[0].school_id;
                         console.log(schoolIDD);

                         connection.query(`SELECT marks_obtained,total_marks,extra_curricular FROM student_details WHERE school_id = ${schoolIDD}`, (err ,rows , fields) =>{
                              if(err){
                                   console.log(err)
                                   return res.send(err)
                              }
                              else {
                                   // console.log(rows);
                                   // rows[0].extra_curricular.trim();
                                   // console.log(rows[0].extra_curricular);
                                   for(let i=0;i<rows.length;i++)
                                   {
                                      rows[i].extra_curricular.trim();
                                      marks[i] = (rows[i].marks_obtained/rows[i].total_marks)*100;
                                      curricular[i] = rows[i].extra_curricular;
                                   }
                                   console.log(curricular);
                                   console.log(marks);
                                   // connection.release()
                              }
                         })
                         return res.json({
                              marks_academic : marks,
                              extra_curricular : curricular
                         });
                         // connection.release()
                    }
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
                res.redirect('http://localhost:4296/details')
                // console.log(req.session.userId);
               // res.redirect('http://localhost:4321/')
                //return res.send({status: "Login"})
             }
           else {
           // return res.send({status: "Login failed"})
             res.redirect('http://localhost:4296/login')
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
app.get('/resultinfo',(req,res)=>{
     db.getConnection((err , connection) =>{
     if(err){
          console.log(err);
          connection.release();
          return ; 
     }
     else{
          connection.query(`SELECT DISTINCT school_name FROM school_details` , (err ,rows , fields) =>{
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