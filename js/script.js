function master() {

const get_cookie = (name) => {
            let name_eq = name + "=";
            let ca = document.cookie.split(';');
            let filtered = ca.filter((x) => {
               return (x.trim().indexOf(name_eq) === 0);
            });
            return (filtered.length === 0) ? null : filtered[0].split("=")[1].split(";")[0];
};

const set_cookie = (val) => {
      const c_name = "api_key";
      var d = new Date();
      d.setTime(d.getTime() + (30*24*60*60*1000)); //30 days
      var expires = "expires="+ d.toUTCString();
      document.cookie = c_name  + "=" + val + ";" + expires + ";path=/";
      return true;
};

let key;

let cookie = get_cookie("api_key");

if (cookie) {
  key = cookie;	
} else {
  key = prompt("Please enter your API key", "");
}

if (key === "") {
  
  alert("No API given, exiting...");
	
  return;
	
} else {

  set_cookie(key);
  console.log("cookie placed for key: " + key);
  console.log(document.cookie);
        	
}

let base = "https://api.seetickets.com/1/";

let req = "shows/town?town=london&page=0&max=50";

let options = "&format=json&key=";
 
req = "shows/postcode?postcode=NG1&radius=20&page=0&max=10";

let loc = window.location.search;

if (loc) {
  req = loc.replace("?req=","");
}

let url = base + req +  options + key;

//parse with native JS
var request = new XMLHttpRequest();
request.open('GET', url, true);

request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    // Success!
   
    var raw = request.responseText;

    console.log(raw);

raw = raw.replace(/\"/g, "\"");
raw = raw.replace(/""/g, '"');

    let flatten = (x) => {

	return Object.flatten(x);

    };

    let max_html_rows = 100;
    
    let data = JSON.parse(raw);

    let dir = ((path) => {
      let a = [];
      let regex = /[?/]/;
      let split_char = path.match(regex)[0];
      let p1 = path.split(split_char)[0];
      let proper = p1.split("")[0].toUpperCase() + p1.split("").slice(1).join("");
      a[0] = proper;
      a[1] = proper.split("").slice(0, proper.length - 1).join("");
      return a;
    })(req);

    let meta_data = ((d) => {
      let arr = [];
        for (let key in d){
         if (key === dir[0]) {
	   continue;	
	}
         arr.push(key + ": " + d[key]);
       }

     return arr.join(" / ");

    })(data);

   $( "#meta-data" ).text(meta_data);   

    let payload = data[dir[0]][dir[1]];
  //  let payload = data.Shows.Show;

    /*
   
    let arr = payload.map(flatten);

    let headers = Object.keys(arr[0]);


    let str_arr = arr.map(x => {
      let a = [];

      for (let key in x){
	a.push(x[key]);
      }
      return a.join(",");
    });

 

    csv = headers.join(",") + "\n" + str_arr.join("\n");

    arr = [headers, ...arr];


   // let arr = $.csv.toArrays(csv);
    //let p = JSON.stringify(data, null, 2);

    arr = arr.slice(0, max_html_rows);


    */
    
    var inArray = arrayFrom(payload);

    var outArray = [];
    for (var row in inArray)
        outArray[outArray.length] = parse_object(inArray[row]);

    let arr = outArray;

    let csv = $.csv.fromObjects(outArray);

    let headers = csv.split("\n")[0].split(",");

   // arr = [headers, ...arr];
    renderCSV(arr);
    //generateHtmlTable(arr);
	//$('#str').text( csv );

    $( "#dl_btn" ).click(function() {
        dl_event(csv, "test_report");
    });

    //var data = JSON.parse(request.responseText);
  } else {
    // We reached our target server, but it returned an error

  }
};

request.onerror = function() {
  // There was a connection error of some sort
};

request.send();

/*

$.get( url , function( data ) {
  
	console.log( data );
  
        let clear = JSON.parse(JSON.stringify(data).replace(/\\""/g,'"').replace(/"\\"/g,'"'));
	alert( "Load was performed." );

        let payload = clear.Shows.Show;

        let flatten = (x) => {
           return Object.flatten(x);
	}
        
        let arr = payload.map(flatten);

       // payload = Object.flatten(payload);


        //let csv = json2flat_csv(arr);//JSONToCSVConvertor(payload, '', true);
       // let arr = $.csv.toArrays(csv);
	//let p = JSON.stringify(data, null, 2);
        generateHtmlTable(arr);
	//$('#str').text( csv );

       $( "#dl_btn" ).click(function() {
          dl_event(csv, "test_report");
       });
});

*/

let link_gen = (url) => {
  let base_m = "http://m.seetickets.com";
  let base_o = "http://www.seetickets.com";
  var parse_url = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
  var result = parse_url.exec(url);
  var names = ['url', 'scheme', 'slash', 'host', 'port', 'path', 'query', 'hash'];
  let path = `/` + result[5];
  let html = `<a href='` + url + `' target='_blank'>` + path + ` </a>`;
  return html
}

let global_card_count = 0;

let to_html_row = (str) => {
 let obj = typeof str !== "object" ? JSON.parse(str) : str;

 let html = "";
 for (let key in obj){
   html += key + ": " + obj[key] + "<br>";
 }

let id = "card_" + global_card_count;
let id_with_selector = "#" + id;
let heading_id = "heading_" + global_card_count;

let card = `
<p>
  <a class='btn btn-primary' data-toggle='collapse' href='${id_with_selector}' role='button' aria-expanded='false' aria-controls='${id}'>
    Click
  </a>
</p>
<div class='collapse' id='${id}'>
  <div class='card card-body'>
  ${html}
  </div>
</div>
`;
 global_card_count++;

  return card;
}

let format_date = (str) => {
  var d = new Date(str);
  return moment(d).format('DD/MM/YYYY') 
}


let parser = {
DateOnSale: {
 fn:  format_date
},
Starts: {
 fn:  format_date
},
Tour: {
 fn:  to_html_row
},
Status: {
 fn:  to_html_row
},
Venue: {
 fn:  to_html_row
},
MobileUrl: {
 fn: link_gen
},
DesktopUrl: {
fn: link_gen
}
}

function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    
    var CSV = '';    
    //Set Report title in first row or line

    let matched_parsers = {};

    //This condition will generate the Label/Header
    if (ShowLabel) {
        var row = "";
        
        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {
            if (index in parser){
               matched_parsers[index] = parser[index].fn;
            }
            //Now convert each value to string and comma-seprated
            row += index + ',';
        }

        row = row.slice(0, -1);
        
        //append Label row with line break
        CSV += row + '\r\n';
    }
    
    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";
        
        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
            if (index in matched_parsers){
              row += '"' + matched_parsers[index](arrData[i][index]) + '",';
            } else {
              row += '"' + arrData[i][index] + '",';
            }
        }

        row.slice(0, row.length - 1);
        
        //add a line break after each row
        CSV += row + '\r\n';
    }

    if (CSV == '') {        
        alert("Invalid data");
        return;
    }   
    console.log(CSV);
    return CSV;


    //Generate a file name
    var fileName = "MyReport_";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle.replace(/ /g,"_");   
    
    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
    
    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension    
    
    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");    
    link.href = uri;
    
    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";
    
    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function dl_event(CSV, ReportTitle){
    //Generate a file name
    var fileName = "MyReport_";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle.replace(/ /g,"_");   
    
    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
    
    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension    
    
    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");    
    link.href = uri;
    
    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";
    
    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function generateHtmlTable(data) {
  var html = '<table  class="table table-condensed table-hover table-striped">';

  if (typeof(data[0]) === 'undefined') {
    return null;
  } else {
    $.each(data, function(index, row) {
      //bind header
      if (index == 0) {
        html += '<thead>';
        html += '<tr>';
        $.each(row, function(index, colData) {
          html += '<th>';
          html += colData;
          html += '</th>';
        });
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
      } else {
        html += '<tr>';
        $.each(row, function(index, colData) {
          html += '<td>';
          html += colData;
          html += '</td>';
        });
        html += '</tr>';
      }
    });
    html += '</tbody>';
    html += '</table>';
    //	alert(html);
    $('#csv-display').append(html);
  }
}

 function renderCSV(objects) {
    var rows = $.csv.fromObjects(objects, {justArrays: true});
    if (rows.length < 1) return;

    // find CSV table
    var table = $('#csv-display')[0];
    $(table).text("");

    // render header row
    var thead = document.createElement("thead");
    var tr = document.createElement("tr");
    var header = rows[0];
    for (field in header) {
      var th = document.createElement("th");
      $(th).text(header[field])
      tr.appendChild(th);
    }
    thead.appendChild(tr);

    // render body of table
    var tbody = document.createElement("tbody");
    for (var i=1; i<rows.length; i++) {
      tr = document.createElement("tr");
      for (field in rows[i]) {
        var td = document.createElement("td");
        $(td)
          .text(rows[i][field])
          .attr("title", rows[i][field]);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }

    table.appendChild(thead);
    table.appendChild(tbody);
  }


const json2flat_csv = (data) => {

  const flatten = (data) => {
    let header_row = data[0];

    let headers = Object.keys(header_row);

    let flattened_headers = [];

    let sub_item_delim = "_/_";

    for (const header of headers) {
      const type = typeof header_row[header];

      if (type === "object") {
        let subheaders = Object.keys(header_row[header]);
        subheaders = subheaders.map(x => [header, x].join(sub_item_delim));
        flattened_headers = [...flattened_headers, ...subheaders];
      } else {
        flattened_headers = [...flattened_headers, header];
      }
    }

    //now have flattened_headers;

    let arr = [];

    arr.push(flattened_headers);

    for (let i = 0; i < data.length; i++) {
      let row = [];
      for (const header of flattened_headers) {
        if (header.indexOf(sub_item_delim) > -1) { // is an object
          let parts = header.split(sub_item_delim);
          row.push(JSON_flatten(data[i][parts[0]][parts[1]]));
        } else { // is a value
          row.push(data[i][header]);
        }
      }
      arr.push(row);
    }
    return arr;

  }

  let arr = flatten(data);

  let csv = arr.map(row => row.map(item => item).join(",")).join("\n");

  return csv

}

Object.flatten = function(data) {
    var result = {};
    function recurse (cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
             for(var i=0, l=cur.length; i<l; i++)
                 recurse(cur[i], prop + "[" + i + "]");
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop+"."+p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
}

}

master();
