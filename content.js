var OPAL_MINER_TIMEZONE = "Australia/Sydney";
var text = "";
var endDate;
var gotAllPages = false;

// http://stackoverflow.com/a/18197341
function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
}

function getMode(html) {
   var modes = ["bus", "train", "ferry"]
   for (var i = 0; i < modes.length; i++) {
      if (html.indexOf(modes[i]) > -1) {
         // Display summary as "Mode" from Blah to Blah
         // e.g. "Train from Central to Town Hall"
         // Top up events will have no mode value
         return modes[i].charAt(0).toUpperCase() + modes[i].slice(1) + " from "
      }
   }
   return ""
}

function sendRequests() {
  var years       = document.getElementById("selectYearForCardActivities").options;
  var months      = document.getElementById("selectMonthForCardActivities").options;
  var cardIndices = document.getElementById("selectCardIndex");
  var cardIndex   = cardIndices.options[cardIndices.selectedIndex].value;
  var y, m;
  // Start from 1 as first option is "nothing selected" 
  for (y = 1; y < years.length; y++) {
    for (m = 1; m < months.length; m++) {
      var pageIndex = 1;
      gotAllPages = false;
      while (!gotAllPages) {
        sendRequest(years[y].value, months[m].value, cardIndex, pageIndex);
        pageIndex++;
      }
    }
  }
} 

function sendRequest(year, month, cardIndex, pageIndex) {
   var request = new XMLHttpRequest();
   if (request != null) {
      var d = new Date();
      var url = "https://www.opal.com.au/registered/opal-card-transactions/opal-card-activities-list?";
      url += "AMonth=" + month;
      url += "&AYear=" + year;
      url += "&cardIndex=" + cardIndex;
      url += "&pageIndex=" + pageIndex;
      url += "&_=" + d.getTime();
      request.open("GET", url, false);
      request.onreadystatechange = function() {
         if (request.readyState == 4) {
            var d = document.implementation.createHTMLDocument("asdf");
            d.documentElement.innerHTML = request.responseText;
            parseHTML(url, d);
         }
      }
      request.send(null);
   }
}

function parseHTML(url, d) {
  var table = d.getElementById("transaction-data")
  for (var r = 1; r < table.rows.length; r++) {
    var row = table.rows[r];
    var dateComponents = row.cells[1].innerText.split("\n");
    var day = dateComponents[1].split('/').reverse().join('');
    var time = dateComponents[2].replace(':', '');
    var mode = getMode(row.cells[2].innerHTML);
    var formattedDate = "TZID=" + OPAL_MINER_TIMEZONE + ":" + day + "T" + time + "00";
    var icalEvent = ["BEGIN:VEVENT"
                    ,"DTSTART;" + formattedDate
                    ,"DTEND;" + formattedDate
                    ,"SUMMARY:" + mode + row.cells[3].innerText 
                    // Display amount as the description
                    ,"DESCRIPTION:" + row.cells[8].innerText
                    ,"SEQUENCE:0"
                    ,"END:VEVENT\n"
                    ].join('\n');
    text += icalEvent;
    if (r == 1) {
       endDate = day;
    }
  }
  if (!d.getElementById("next")) {
    gotAllPages = true;
  }
}

function makeCalendar() {
   alert("Exporting Opal data to iCal (may take a while)...");
   text   =    ["BEGIN:VCALENDAR"
               ,"PRODID:-//opal miner//hacked-together javascript//EN"
               ,"VERSION:2.0"
               ,"CALSCALE:GREGORIAN"
               ,"METHOD:PUBLISH"
               ,"BEGIN:VTIMEZONE"
               ,"TZID:" + OPAL_MINER_TIMEZONE
               ,"X-LIC-LOCATION:Australia/Sydney"
               ,"BEGIN:DAYLIGHT"
               ,"TZOFFSETFROM:+1000"
               ,"TZOFFSETTO:+1100"
               ,"TZNAME:EST"
               ,"DTSTART:19701025T020000"
               ,"RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU"
               ,"END:DAYLIGHT"
               ,"BEGIN:STANDARD"
               ,"TZOFFSETFROM:+1000"
               ,"TZOFFSETTO:+1000"
               ,"TZNAME:EST"
               ,"DTSTART:19700329T020000"
               ,"RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU"
               ,"END:STANDARD"
               ,"END:VTIMEZONE\n"
               ].join('\n');
   sendRequests();
   text += "END:VCALENDAR";
   download("opal_" + endDate + ".ics", text);
}

var container = document.createElement("a");
container.setAttribute("class", "button");
var span = document.createElement("span");
span.style.outline = "0px";
span.onclick = makeCalendar;
var text = document.createTextNode("Download iCal");
span.appendChild(text);
container.appendChild(span);
document.getElementById("data-tools").appendChild(container);



