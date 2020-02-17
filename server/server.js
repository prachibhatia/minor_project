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
const bcrypt = require('bcrypt');
const saltRounds = 10;
const joi = require('@hapi/joi') 
const jwt = require('jsonwebtoken')

// const schema = joi.object().keys({
//      username: joi.string().regex(/([a-zA-Z0-9_]+$)/).min(3).max(30).required(),
//      password: joi.string().trim().min(6).max(32).required(),
//    });



//    function createTokenSendResponse( hashedPassword , req , res , id ,next ){
//      const payload = {
//          _id: id , 
//          username: req.body.username , 
//          password: hashedPassword , 
//      }
//      console.log(process.env.TOKEN_SECRET)
//      //Gen. a token 
//      jwt.sign(payload ,process.env.TOKEN_SECRET , {
//          expiresIn: '1d'
//      } , (err , token) =>{
//          if(err){
//              //err during gen of token 
//              respondError422(res , next , '' , err)
//          }
//          else{
//              //sending token 
//              res.json({token})
//          }
//      })
//  }

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
                         connection.query(`load data infile '/home/prachi/Desktop/MyFiles/Project/server/${req.file.path}' into table student_details fields terminated by ',' lines terminated by '\n' (school_id,adhaar_card,student_name,student_class,marks_obtained,total_marks,extra_curricular,Year,sports_grade,dance_grade,music_grade,art_grade);` , (err ,rows , fields) =>{
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




app.post('/option',(req,res)=>{
     console.log(req.body);
     if(req.body.option == 'Dance' || req.body.option == 'Music' || req.body.option == 'Art' || req.body.option == 'Sports')
     {
     res.send(
          {
               countrys : ['A','B','C','D','E']
          }
          )
         }
         else if(req.body.option == 'Academics')
         {
         res.send(
              {
                   countrys : ['0-20%','20%-40%','40%-60%','60%-80%','80%-100%']
              }
              )
             }      
})



app.post('/register',(req,res)=>{
     console.log(req.body);
    db.getConnection((err , connection) =>{
         if(err){
              console.log(err);
              connection.release();
              return ; 
         }
         else{
             console.log(req.body);
              console.log("Hello")
              const password = req.body.pswd;
              bcrypt.hash(password,saltRounds,function(err,hash)
              {
               connection.query(`INSERT INTO school_details (school_id,school_name,school_email,address,location,pincode,contactNo,password) VALUES ('${req.body.ID}','${req.body.schholname}','${req.body.email}','${req.body.address}','${req.body.location}','${req.body.pin}','${req.body.contact}','${hash}');` , (err ,rows , fields) =>{
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
              })
         }
    })
})
let iddd;
app.post('/analysis',(req,res)=>{
     console.log(req.body);
     db.getConnection((err , connection) =>{
          if(err){
               console.log(err);
               connection.release();
               return ; 
          }
          else{
          //     console.log(req.body);
               console.log("Hello")
               connection.query(`SELECT school_id FROM school_details WHERE school_name = '${req.body.school}'`, (err ,rows , fields) =>{
                    if(err){
                         console.log(err)
                         return res.send(err)
                    }
                    else {
                         iddd = rows[0].school_id;
                         console.log(iddd);
                         if(req.body.marks=='Dance')
                         {
                              connection.query(`SELECT adhaar_card,student_name,student_class,marks_obtained,total_marks,sports_grade,dance_grade,music_grade,art_grade FROM student_details WHERE school_id = ${iddd} AND Year='${req.body.year}' AND student_class='${req.body.class}' AND dance_grade='${req.body.extra}'`, (err ,rows , fields) =>{
                                   if(err){
                                        console.log(err)
                                        return res.send(err)
                                   }
                                   else {
                                        console.log(rows);
                                        return res.send(rows);
                                   }
                              })
                         }
                         else
                         if(req.body.marks=='Art')
                         {
                              connection.query(`SELECT adhaar_card,student_name,student_class,marks_obtained,total_marks,sports_grade,dance_grade,music_grade,art_grade FROM student_details WHERE school_id = ${iddd} AND Year='${req.body.year}' AND student_class='${req.body.class}' AND art_grade='${req.body.extra}'`, (err ,rows , fields) =>{
                                   if(err){
                                        console.log(err)
                                        return res.send(err)
                                   }
                                   else {
                                        console.log(rows);
                                        return res.send(rows);
                                   }
                              })
                         }
                         else
                         if(req.body.marks=='Music')
                         {
                              connection.query(`SELECT adhaar_card,student_name,student_class,marks_obtained,total_marks,sports_grade,dance_grade,music_grade,art_grade FROM student_details WHERE school_id = ${iddd} AND Year='${req.body.year}' AND student_class='${req.body.class}' AND music_grade='${req.body.extra}'`, (err ,rows , fields) =>{
                                   if(err){
                                        console.log(err)
                                        return res.send(err)
                                   }
                                   else {
                                        console.log(rows);
                                        return res.send(rows);
                                   }
                              })
                         }
                         else
                         if(req.body.marks=='Sports')
                         {
                              connection.query(`SELECT adhaar_card,student_name,student_class,marks_obtained,total_marks,sports_grade,dance_grade,music_grade,art_grade FROM student_details WHERE school_id = ${iddd} AND Year='${req.body.year}' AND student_class='${req.body.class}' AND sports_grade='${req.body.extra}'`, (err ,rows , fields) =>{
                                   if(err){
                                        console.log(err)
                                        return res.send(err)
                                   }
                                   else {
                                        console.log(rows);
                                        return res.send(rows);
                                   }
                              })
                         }
                         else{
                             if(req.body.extra == '0-20%')
                             {
                              connection.query(`SELECT adhaar_card,student_name,student_class,marks_obtained,total_marks,sports_grade,dance_grade,music_grade,art_grade FROM student_details WHERE school_id = ${iddd} AND Year='${req.body.year}' AND student_class='${req.body.class}' AND (marks_obtained/total_marks)*100<=20 AND (marks_obtained/total_marks)*100>0`, (err ,rows , fields) =>{
                                   if(err){
                                        console.log(err)
                                        return res.send(err)
                                   }
                                   else {
                                        console.log(rows);
                                        return res.send(rows);
                                   }
                              })
                             }
                             else if(req.body.extra == '20%-40%')
                             {
                              connection.query(`SELECT adhaar_card,student_name,student_class,marks_obtained,total_marks,sports_grade,dance_grade,music_grade,art_grade FROM student_details WHERE school_id = ${iddd} AND Year='${req.body.year}' AND student_class='${req.body.class}' AND (marks_obtained/total_marks)*100<=40 AND (marks_obtained/total_marks)*100>=21`, (err ,rows , fields) =>{
                                   if(err){
                                        console.log(err)
                                        return res.send(err)
                                   }
                                   else {
                                        console.log(rows);
                                        return res.send(rows);
                                   }
                              })
                             }
                             else if(req.body.extra == '40%-60%')
                             {
                              connection.query(`SELECT adhaar_card,student_name,student_class,marks_obtained,total_marks,sports_grade,dance_grade,music_grade,art_grade FROM student_details WHERE school_id = ${iddd} AND Year='${req.body.year}' AND student_class='${req.body.class}' AND (marks_obtained/total_marks)*100<=60 AND (marks_obtained/total_marks)*100>=41`, (err ,rows , fields) =>{
                                   if(err){
                                        console.log(err)
                                        return res.send(err)
                                   }
                                   else {
                                        console.log(rows);
                                        return res.send(rows);
                                   }
                              })
                             }
                             else if(req.body.extra == '60%-80%')
                             {
                              connection.query(`SELECT adhaar_card,student_name,student_class,marks_obtained,total_marks,sports_grade,dance_grade,music_grade,art_grade FROM student_details WHERE school_id = ${iddd} AND Year='${req.body.year}' AND student_class='${req.body.class}' AND (marks_obtained/total_marks)*100<=80 AND (marks_obtained/total_marks)*100>=61`, (err ,rows , fields) =>{
                                   if(err){
                                        console.log(err)
                                        return res.send(err)
                                   }
                                   else {
                                        console.log(rows);
                                        return res.send(rows);
                                   }
                              })
                             }
                             else{
                              connection.query(`SELECT adhaar_card,student_name,student_class,marks_obtained,total_marks,sports_grade,dance_grade,music_grade,art_grade FROM student_details WHERE school_id = ${iddd} AND Year='${req.body.year}' AND student_class='${req.body.class}' AND (marks_obtained/total_marks)*100<=100 AND (marks_obtained/total_marks)*100>=81`, (err ,rows , fields) =>{
                                   if(err){
                                        console.log(err)
                                        return res.send(err)
                                   }
                                   else {
                                        console.log(rows);
                                        return res.send(rows);
                                   }
                              })
                             }
                              
                         }
                    }
               })
          }
     })  
})

let schoolIDD;
var marks=[];
var curricular=[];
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

                         connection.query(`SELECT marks_obtained,total_marks,extra_curricular FROM student_details WHERE school_id = ${schoolIDD} AND Year='${req.body.years}'`, (err ,rows , fields) =>{
                              if(err){
                                   console.log(err)
                                   return res.send(err)
                              }
                              else {
                                   console.log(rows);
                                   // rows[0].extra_curricular.trim();
                                   // console.log(rows[0].extra_curricular);
                                   marks=[];
                                   curricular=[];
                                   for(let i=0;i<rows.length;i++)
                                   {
                                      rows[i].extra_curricular.trim();
                                      marks[i] = (rows[i].marks_obtained/rows[i].total_marks)*100;
                                      curricular[i] = rows[i].extra_curricular;
                                   }
                                   console.log(curricular);
                                   console.log(marks);
                                   return res.send({
                                        marks_academic : marks,
                                        extra_curricular : curricular
                                   });
                                   // connection.release()
                              }
                         })
                         // connection.release()
                    }
               })
          }
     })  
 })
 app.post('/gov',(req,res)=>{
      console.log(req.body);
      if(req.body.IDlogin==12345 && req.body.password=='hellohello')
      {
          res.redirect('http://localhost:4296/analysis')
      }
      else
      {
          res.redirect('http://localhost:4296/login')
      }
 })
let activeID ;
app.post('/auth',(req,res)=>{

//     db.getConnection((err , connection) =>{
//          if(err){
//               console.log(err);
//               connection.release();
//               return ; 
//          }
//          else{
//              console.log(req.body);
//               console.log("Hello")
//               connection.query('SELECT school_id,password FROM `school_details`' , (err ,rows , fields) =>{
//                    if(err){
//                         console.log(err)
//                         return res.send(err)
//                    }
//                    else {
//                    console.log(rows)
//                    console.log(req.body.schoolIDlogin);
//                 //    console.log(password);
//                    let  checkusers  = false ;
//                    checkusers = rows.find(user =>{
//                    if(user.school_id == req.body.schoolIDlogin)
//                    {
//                       if(user.password == req.body.passwordlogin)
//                       {
//                          return user ; 
//                      }
//                    }
//              })
//              if(checkusers){
//                 console.log(checkusers)
//                 activeID = checkusers.school_id;
//                 console.log(activeID);
//                 req.session.userId = checkusers.school_id;
//                 res.redirect('http://localhost:4296/details')
//              }
//            else {
//              res.redirect('http://localhost:4296/login')
//            }
//                    }
//               })
//          }
//     })
db.getConnection((err , connection) =>{
              if(err){
                   console.log(err);
                   connection.release();
                   return ; 
              }
              else{
                  console.log(req.body);
                  connection.query(`SELECT password,school_id FROM school_details WHERE school_id=${req.body.schoolIDlogin}` , (err ,rows , fields) =>{
                                       if(err){
                                            console.log(err)
                                            return res.send(err)
                                       }
                                       else 
                                       if(rows.length==0)
                                       {
                                        res.redirect('http://localhost:4296/login')
                                       }
                                        console.log(rows) ;
                                        const hash = rows[0].password;
                                        console.log(hash);
                                        bcrypt.compare(req.body.passwordlogin,hash,function(err,response)
                                        {
                                            if(response==true){
                                                 console.log("hi");
                                                 activeID = rows[0].school_id;
                                                 console.log(activeID);
                                                 req.session.userId = rows[0].school_id;
                                                 res.redirect('http://localhost:4296/details')
                                            }
                                            else{
                                                 res.redirect('http://localhost:4296/login')
                                            }
                                        });
                                   })
              }
          })

})

app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'../client/login.html'))
})
app.get('/analysis',(req,res)=>{
     res.sendFile(path.join(__dirname,'../client/analysis.html'))
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