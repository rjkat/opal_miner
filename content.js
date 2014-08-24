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

function parseData() {
   var table = document.getElementById("transaction-data")
   var timezoneId = "Australia/Sydney"
   var text  = ["BEGIN:VCALENDAR"
               ,"PRODID:-//opal miner//hacked-together javascript//EN"
               ,"VERSION:2.0"
               ,"CALSCALE:GREGORIAN"
               ,"METHOD:PUBLISH"
               ,"BEGIN:VTIMEZONE"
               ,"TZID:" + timezoneId
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
               ].join('\n')
   var startDate, endDate;
   for (var r = 1; r < table.rows.length; r++) {
      var row = table.rows[r]
      var dateComponents = row.cells[1].innerText.split("\n")
      var day = dateComponents[1].split('/').reverse().join('')
      var time = dateComponents[2].replace(':', '')
      var mode = getMode(row.cells[2].innerHTML)
      var formattedDate = "TZID=" + timezoneId + ":" + day + "T" + time + "00"
      var icalEvent = ["BEGIN:VEVENT"
                      ,"DTSTART;" + formattedDate
                      ,"DTEND;" + formattedDate
                      ,"SUMMARY:" + mode + row.cells[3].innerText 
                      // Display amount as the description
                      ,"DESCRIPTION:" + row.cells[8].innerText
                      ,"SEQUENCE:0"
                      ,"END:VEVENT\n"
                      ].join('\n')
      text += icalEvent
      if (r == 1) {
         endDate = day
      }
      if (r == (table.rows.length - 1)) {
         startDate = day
      }
   }
   text += "END:VCALENDAR"
   download("opal_" + startDate + "_to_" + endDate + ".ics", text)
}

var container = document.createElement("a")
container.setAttribute("class", "button")
var span = document.createElement("span")
span.style.outline = "0px"
span.onclick = parseData
var text = document.createTextNode("Download iCal")
span.appendChild(text)
container.appendChild(span)
document.getElementById("data-tools").appendChild(container);

