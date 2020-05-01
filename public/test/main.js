/* main.js - Maximilian Schiller 2020 */
let div = document.querySelector('#flag');
x=15;
y=9;
let color = 'black';
let down = false;
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

var countries = []

async function get() {
  document.getElementById('list').innerHTML = '';
  const options = {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json'
      }
  };
  const response = await fetch('/api/get', options);
  const json = await response.json();
  if (json.status == 200) {
    console.log(json)
    countries = json.data
    document.getElementById('count').innerHTML = "All Flags (" + json.data.length + ")"
    var list = document.getElementById('list');
    for(i in json.data){
      var li = document.createElement("li")
      li.innerHTML = `<p>${json.data[i].name}: ${json.data[i].variants.length + ((json.data[i].variants.length != 1) ? " variations" : " variation")} - <a href="/country?iso=${json.data[i].isoCode}">View</a></p>`
      list.appendChild(li)
    }
  }else{
    console.log(json)
    var error = document.getElementById('error');
    error.innerHTML = "Oh! An Error occurred."
  }
}

get()

var white = ["white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white"]

function classify(){
  var values = getArr().map(x=>{return x==''?'white':x.split(" ")[0]});
  var results = []
  for(i in countries){
    for(a in countries[i].variants){
        var matches = 0;
        for (v = 0; v < values.length; v++) {
            if(values[v] == countries[i].variants[a].values[v]){
                matches++
            }
        }
        results.push({
            name: countries[i].name,
            variation: "id",
            addedBy: countries[i].variants[a].addedBy,
            addedAt: countries[i].variants[a].addedAt,
            matches: matches
        })
    }
  }
  var max = {matches: 0};
  for(i in results){
      if(results[i].matches > max.matches){
          max = results[i]
      }
  }
  var error = document.getElementById('error');
  error.style.color = "#000"
  error.innerHTML = "Selected Country: " + max.name
}