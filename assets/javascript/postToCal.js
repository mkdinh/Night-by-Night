/*
  See https://developers.google.com/google-apps/calendar/v3/reference/events/insert#examples
  for examples of request formatting
*/

// Client ID and API key from the Developer Console
var CLIENT_ID = '684241832249-bjgaqjvt9408fvm3iokba1fj0mdabiht.apps.googleusercontent.com';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar";

/**
 *  On load, called to load the auth2 library and API client library.
 */
var handleClientLoad = function () {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    discoveryDocs: DISCOVERY_DOCS,
    clientId: CLIENT_ID,
    scope: SCOPES
  });
}

// in case it didn't load on page load...
$("#tab-id-events").click(handleClientLoad);

/*
  Formatting for these parameters:
    (see googleCalDemo.html for examples, and also for function for formatting dates)
  summary: string (this will be the event "title")
  description: string
  start: an object. 
    For all-day events, it contains key 'date' with value formatted yyyy-mm-dd. 
    For time-specific events, it contains key 'dateTime' 
    with value formatted yyyy-mm-ddThh:mm:ss{time zone, format eg -05:00}
    e.g.:
      'start': {
        'dateTime': '2017-07-08T14:00:00-04:00'
      }
  end: an object, same as start
  location: string, preferably valid address; 
    for best results include country, e.g. "US"
*/

function postToCal(summary, description, start, end) {
  var event = {
    'summary': summary,
    'description': description,
    'start': start,
    'end': end
  }
  var request = gapi.client.calendar.events.insert({
    'calendarId': 'primary',
    'resource': event
  });

  gapi.auth2.getAuthInstance().signIn().then(function () {
    request.execute(function (event) {
      console.log("Response:", event);
      var $toastContent = $("<a href='" + event.htmlLink + "'Event</a> created");
      Materialize.toast($toastContent, 5000); // not happening
      var li = $("<li class='collection-item'>");
      var div = $("<div>");
      div.html(moment(event.start.date, "YYYY-MM-DD").format("M/D/YY") + "<br><a href='" + event.htmlLink + "' target='_blank'>" + event.summary + "</a>");
      var a = $("<a href='#!' class='secondary-content cal-del' data-delID='" + event.id + "'><i class='material-icons red-text'>delete_forever</i></a>");
      div.append(a);
      li.append(div);
      $("#cal-collection").append(li); // happening
    });
  }).catch(function (errorMessage) {
    console.log("Google calendar error:", errorMessage);
  });
}

$("body").on("click", ".cal-del", function (e) {
  e.preventDefault();
  var parentLi = $(this).parent().parent();
  var url = "https://www.googleapis.com/calendar/v3/calendars/primary/events/" + $(this).attr("data-delID");
  $.ajax({
    type: "DELETE",
    url: url,
    success: function () {
      Materialize.toast("Event deleted", 5000);
      parentLi.remove();
    }
  });

});