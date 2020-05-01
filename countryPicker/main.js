/* main.js - Maximilian Schiller 2020 */

let div = document.querySelector('#flag');
x=15;
y=9;
let color = 'black';
let down = false;
var white = ["white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white"]

for (i = 0; i < x*y; i++) {
  div.appendChild(document.createElement('span'))
    .classList.add('pixel');
}
document.querySelectorAll('#colselect>span').forEach(s=>{
  s.addEventListener('click',e=>{
    color = e.target.id;
  })
});

document.querySelectorAll('.pixel').forEach(s=>{
  s.addEventListener('mouseover',e=>{
    if (down) {
      e.target.style.backgroundColor=color;
      classify()
    }
  });
  s.addEventListener('mousedown',e=>{
    e.target.style.backgroundColor=color;
    classify()
  })
});

div.addEventListener('mousedown',e=>{
  down=true;
});

div.addEventListener('mouseup',e=>{
  down=false;
});

function getArr() {
  ret = [];
  document.querySelectorAll('.pixel').forEach(s=>{
    ret.push(s.style.backgroundColor);
  });
  console.log(ret)
  return ret;
}


function classify(){
  var values = getArr().map(x=>{return x==''?'white':x.split(" ")[0]});
  console.log(values)
  var results = []
  for(i in countries){
    var matches = 0;
    for (v = 0; v < values.length; v++) {
        if(values[v] == countries[i].values[v]){
            matches++
        }
    }
    results.push({
        name: countries[i].name,
        addedBy: countries[i].addedBy,
        matches: matches
    })
    
  }
  var max = {matches: 0};
  for(i in results){
      if(results[i].matches > max.matches){
          max = results[i]
      }
  }
  var error = document.getElementById('error');
  error.style.color = "#000"
  if(max.name == undefined){
    error.innerHTML = "No country recognized"
  }else{
    error.innerHTML = "Selected Country: " + max.name + " (Score: " + Math.round(max.matches / 135 * 100) + "%)"
  }
}