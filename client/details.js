console.log("hello")
let id = document.getElementById('myID')
let name = document.getElementById('myname')
let email = document.getElementById('myemail')
let address = document.getElementById('myaddress')
let city = document.getElementById('mycity')
let pin = document.getElementById('mypin')
let contact_no = document.getElementById('mycontact_no')
const year = document.getElementById('myyear')
window.onload = ()=>{
    fetch('http://localhost:4296/detailsINFO')
    .then(res => res.text())
    .then(data => {
           data = JSON.parse(data)
           console.log(data[0].school_id)
           id.value = data[0].school_id;
           name.value = data[0].school_name;
           email.value = data[0].school_email;
           address.value = data[0].address;
           city.value = data[0].location;
           pin.value = data[0].pincode;
           contact_no.value = data[0].contactNo;
    })
 }