/* main.js - Maximilian Schiller 2020 */

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