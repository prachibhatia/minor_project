window.onload = (event)=>{
    event.preventDefault();
    fetch('http://localhost:4296/resultinfo')
    .then(res => res.text())
    .then(data1 => {
           data1 = JSON.parse(data1)
        //    console.log(data1[1].school_name);
        //    document.getElementById('school').innerHTML+='<option>'+ +'</option>' 
           for (let j = 0;j<data1.length;j++){ 
            document.getElementById('school').innerHTML+='<option>'+ data1[j].school_name +'</option>'
        }
    })
 }



 const selectValue = document.getElementById('marks_obtained')

selectValue.addEventListener('change', (event) => {
          
        console.log(event.target.value)
        let Val = event.target.value;
        console.log(Val)
        let datas = {
             option : Val
          }
        fetch('http://localhost:4296/option',{
        method : 'POST',
        body: JSON.stringify(datas),
        headers:{
          'Content-Type': 'application/json'
        }
       }).then(data => data.json())
        .then(resp => {
          document.getElementById('extra_curricular').innerHTML = ""
          console.log(resp.countrys)
          console.log(resp.countrys.length)
          for (let j = 0;j<resp.countrys.length;j++){
              document.getElementById('extra_curricular').innerHTML+='<option>'+ resp.countrys[j] +'</option>'
          }
        })
        })




 let school_name = document.getElementById('school');
 let school_year = document.getElementById('year');
 let school_class = document.getElementById('student_class');
 let school_marks = document.getElementById('marks_obtained');
 let school_extra = document.getElementById('extra_curricular');
function info()
{
    event.preventDefault()
    console.log('hello');
    let datas = {
        school : school_name.value,
        year : school_year.value,
        class : school_class.value,
        marks : school_marks.value,
        extra : school_extra.value,
      }
      fetch('http://localhost:4296/analysis',{
    method : 'POST',
    body: JSON.stringify(datas),
    headers:{
      'Content-Type': 'application/json'
    }
  }).then(data => data.json())
    .then(resp => {
    //   if(resp.inserted){
        console.log(resp)
        const tablebody = document.getElementById('tabledata');
        let datahtml =' ';
        for(let j=0;j<resp.length;j++)
        {
          let perc = (resp[j].marks_obtained/resp[j].total_marks)*100;
          datahtml+= `<tr><td>${resp[j].adhaar_card}</td><td>${resp[j].student_name}</td><td>${resp[j].student_class}</td><td>${perc} %</td><td>${resp[j].sports_grade}</td><td>${resp[j].dance_grade}</td><td>${resp[j].music_grade}</td><td>${resp[j].art_grade}</td></tr>`
        }
        console.log(datahtml);
        tablebody.innerHTML = datahtml;
    })
}
