console.log("hi");
let mychart = document.getElementById('mychart').getContext('2d');
let school = document.getElementById('school');
let year = document.getElementById('year');
Chart.defaults.global.defaultFontFamily='Lato';
Chart.defaults.global.defaultFontSize=18;
Chart.defaults.global.defaultFontColor='#777';
function updateChart(event)
{
var no20=0;
var no40=0;
var no60=0;
var no80=0;
var no100=0;
var studA = 0;
var studB = 0;
var studC = 0;
var studD = 0;
var studE = 0;
    let datas = {
        schools : school.value,
        years : year.value
      }
    
      fetch('http://localhost:4296/results',{
        method : 'POST',
        body: JSON.stringify(datas),
        headers:{
          'Content-Type': 'application/json'
        }
      }).then(data => data.text())
        .then(resp => {
          console.log(resp)
          var myObj = JSON.parse(resp);
          console.log(myObj)
          console.log(myObj.marks_academic.length);
          if(myObj.marks_academic.length==0)
          {
            alert(" Data not available ! ");
          }
          console.log(myObj.extra_curricular[0].charAt(0))
          for(let v=0;v<myObj.extra_curricular.length;v++)
        {
            if(myObj.extra_curricular[v].charAt(0)=='C')
            {
              studC++;
            }
            else
            if(myObj.extra_curricular[v].charAt(0)=='A')
            {
              studA++;
            }
            else
            if(myObj.extra_curricular[v].charAt(0)=='B')
            {
              studB++;
            }
            else
            if(myObj.extra_curricular[v].charAt(0)=='D')
            {
              studD++;
            }
            else
            if(myObj.extra_curricular[v].charAt(0)=='E')
            {
              studE++;
            }
        }
          for(let k=0;k<myObj.marks_academic.length;k++)
          {
          if(myObj.marks_academic[k]<=20)
          {
              no20++;
          }
          else
          if(myObj.marks_academic[k]<=40)
          {
              no40++;
          }
          else
          if(myObj.marks_academic[k]<=60)
          {
              no60++;
          }
          else
          if(myObj.marks_academic[k]<=80)
          {
              no80++;
          }
          else
          if(myObj.marks_academic[k]<=100)
          {
              no100++;
          }
        }
      
    //graphs code

    let masspopchart = new Chart(mychart,{
        type:'bar',
        data:{
           labels:['0-20%','20%-40%','40%-60%','60%-80%','80%-100%'],
           datasets:[{
               label:'',
               data:[no20,no40,no60,no80,no100
           ],
           
           backgroundColor:['rgba(255,99,132,0.6)',
           'rgba(54,162,235,0.6)',
           'rgba(255,206,86,0.6)',
           'rgba(0,128,0,0.6)',
           'rgba(153,102,255,0.6)',
           'rgba(255,159,64,0.6)',
            'rgba(255,99,132,0.6)'              
              ],
              borderWidth:1,
              borderColor:'#777',
              hoverBorderWidth:3,
              hoverBorderColor:'#000'
    
        }]
        },
        options:{
            title:{
                display:true,
                text:'Academic performance',
                fontSize:25
            },
            legend:{
                display:false,
                position:'right',
                labels:
                {
                    fontColor:'#000'
                }
            },
            layout:{
                padding:{
                    left:50,
                    right:0,
                    bottom:0,
                    top:0
                }
            },
            tooltips:{
                enabled:true
            }
        }
    });
 //pie chart code
 let masspopchart1 = new Chart(mychart2,{
    type:'pie',
    data:{
       labels:['A','B','C','D','E'],
       datasets:[{
           label:'Extra curricular activities',
           data:[studA,studB,studC,studD,studE
       ],
       
       backgroundColor:['rgba(255,99,132,0.6)',
       'rgba(54,162,235,0.6)',
       'rgba(255,206,86,0.6)',
       'rgba(0,128,0,0.6)',
       'rgba(153,102,255,0.6)',
       'rgba(255,159,64,0.6)',
        'rgba(255,99,132,0.6)'              
          ],
          borderWidth:1,
          borderColor:'#777',
          hoverBorderWidth:3,
          hoverBorderColor:'#000'

    }]
    },
    options:{
        title:{
            display:true,
            text:'Extra curricular activities',
            fontSize:25
        }
    }
});
        })
}


window.onload = (event)=>{
    event.preventDefault()
    fetch('http://localhost:4296/resultinfo')
    .then(res => res.text())
    .then(data1 => {
           data1 = JSON.parse(data1)
           console.log(data1[1].school_name);
        //    document.getElementById('school').innerHTML+='<option>'+ +'</option>' 
           for (let j = 0;j<data1.length;j++){ 
            document.getElementById('school').innerHTML+='<option>'+ data1[j].school_name +'</option>'
        }
    })
 }