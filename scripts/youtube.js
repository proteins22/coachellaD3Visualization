// The client ID is obtained from the Google Developers Console
// at https://console.developers.google.com/.
// If you run this code from a server other than http://localhost,
// you need to register your own client ID.
var OAUTH2_CLIENT_ID = config.YT_AUTH;
var OAUTH2_SCOPES = [
  'https://www.googleapis.com/auth/youtube'
];

var ytKey = config.YT_KEY;

// Upon loading, the Google APIs JS client automatically invokes this callback.
googleApiClientReady = function() {
  gapi.auth.init(function() {
    window.setTimeout(checkAuth, 1);
  });
};

// Attempt the immediate OAuth 2.0 client flow as soon as the page loads.
// If the currently logged-in Google Account has previously authorized
// the client specified as the OAUTH2_CLIENT_ID, then the authorization
// succeeds with no user intervention. Otherwise, it fails and the
// user interface that prompts for authorization needs to display.
function checkAuth() {
  gapi.auth.authorize({
    client_id: OAUTH2_CLIENT_ID,
    scope: OAUTH2_SCOPES,
    immediate: true
  }, handleAuthResult);
}

// Handle the result of a gapi.auth.authorize() call.
function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    // Authorization was successful. Hide authorization prompts and show
    // content that should be visible after authorization succeeds.
    $('.pre-auth').hide();
    $('.post-auth').show();
    //loadAPIClientInterfaces();
  } else {
    // Make the #login-link clickable. Attempt a non-immediate OAuth 2.0
    // client flow. The current function is called when that flow completes.
    $('#login-link').click(function() {
      gapi.auth.authorize({
        client_id: OAUTH2_CLIENT_ID,
        scope: OAUTH2_SCOPES,
        immediate: false
        }, handleAuthResult);
    });
  }
}

// Load the client interfaces for the YouTube Analytics and Data APIs, which
// are required to use the Google APIs JS client. More info is available at
// http://code.google.com/p/google-api-javascript-client/wiki/GettingStarted#Loading_the_Client
function loadAPIClientInterfaces() {
  gapi.client.load('youtube', 'v3', function() {
    console.log("loadAPIClientInterfaces ok");
    handleAPILoaded();
  });
}

// After the API loads, call a function to enable the search box.
function handleAPILoaded() {
  //$('#search-button').attr('disabled', false);
}


// Search for a specified string.
function searchIn() {
  var q = $('#query').val();
  

  function go(){
    var request = gapi.client.youtube.search.list({
      q: q,
      part: 'snippet'
    });
      
    request.execute(function(response) {
      var str = response.result.items[0].id.videoId;
      $('#search-container').html('<iframe width="100%" height="100%" class="ytEmbed" src="https://www.youtube.com/embed/'+str+'?rel=0&amp;controls=0&amp;showinfo=0&amp;autoplay=1&amp;hd=1" frameborder="0" allowfullscreen></iframe>');
    });
  }

  loadAPIClientInterfaces();

  function loadAPIClientInterfaces() {
    gapi.client.setApiKey(ytKey);
    gapi.client.load('youtube', 'v3', function() {
      console.log("loadAPIClientInterfaces ok");
      go();
    });
  }

}