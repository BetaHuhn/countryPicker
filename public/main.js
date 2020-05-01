/* main.js - Maximilian Schiller 2020 */

let div = document.querySelector('#flag');
x=15;
y=9;
let color = 'black';
let down = false;
var map = ["red", "orange","yellow","green","blue","indigo", "violet","white","black"]
var white = ["white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white","white"]
var countries = []

var url_string = window.location.href; 
var url = new URL(url_string);
var code = url.searchParams.get("code");
if(code != undefined){
  var colors = []
  code = BigInt("0x" + code).toString(10)
  console.log(code)
  code.split('').forEach(function(c) {
    colors.push(map[parseInt(c)])
  });
  console.log(colors)
  div.innerHTML = ""
  for(i in colors){
    var span = document.createElement('span')
    span.classList.add('pixel');
    span.style.backgroundColor = colors[i]
    div.appendChild(span)
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
  get(function(){
    classify()
  })
}else{
  init()
  get()
}

function init(){
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
}

function getArr() {
  ret = [];
  document.querySelectorAll('.pixel').forEach(s=>{
    ret.push(s.style.backgroundColor);
  });
  console.log(ret)
  return ret;
}

function hash() {
  var values = getArr().map(x=>{return x==''?'white':x.split(" ")[0]});
  var result = values.map(x => map.indexOf(x));
  result = result.join('')
  var code = BigInt(result).toString(16)
  var resp = "https://flags.mxis.ch/?code=" + code
  var $body = document.getElementsByTagName('body')[0]
  var $tempInput = document.createElement('INPUT');
  $body.appendChild($tempInput);
  $tempInput.setAttribute('value', resp)
  $tempInput.select();
  document.execCommand('copy');
  $body.removeChild($tempInput);
  var span = document.getElementById('share')
  span.innerHTML = "Link copied"
  setTimeout(function() {
    span.innerHTML = "Or copy Link to Flag"
  }, 1000);
}

async function get(cb) {
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
    if(cb != undefined){
      cb()
    }
  }else{
    console.log(json)
    var error = document.getElementById('error');
    error.innerHTML = "Oh! An Error occurred."
  }
}

function classify(){
  var values = getArr().map(x=>{return x==''?'white':x.split(" ")[0]});
  console.log(values)
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
  if(max.name == undefined){
    error.innerHTML = "No country recognized"
  }else{
    error.innerHTML = "Selected Country: " + max.name + " (Score: " + Math.round(max.matches / 135 * 100) + "%)"
  }
}