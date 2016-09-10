angular.module('starter.map', ['ngMap'])

  .controller('MapCtrl', function($scope, $ionicLoading, $compile, socket, $timeout) {

    socket.on('updateBoard', function(everybody){

      var remove = angular.element( document.querySelectorAll( '.tempMarker.tempBox' ) );
      remove.remove();

      angular.forEach(everybody, function(value, key) {
        if(key != localStorage.getItem("uuid"))
        {
          //put everybody by myself on map!
          var mapcontentparent = angular.element( document.querySelector( '#mapcontentparent' ) );
          mapcontentparent.append(
                                '<custom-marker class="tempMarker" id="'+key+'" position="'+new google.maps.LatLng(value.where)+'">'+
                                '<div class="location"></div>'+
                                '<div class="pulse"></div>'+
                                '</custom-marker>'
                                );
          mapcontentparent.append(
                                '<info-window class="tempBox" id="personalSpeechBox">'+
                                  '<div ng-non-bindable>'+
                                    '<div id="recent" class="lastMessage">'+
                                      '<span class="when">'+timeSince(value.when)+'</span><span>'+value.what+'</span>'+
                                    '</div>'+
                                  '</div>'+
                                '</info-window>'
                                );
        }
      });
    });

  function initialize() {
  };

  $scope.myImagePath = './img/profile/me.png';

  $scope.$on('mapInitialized', function(evt, map)
  {
    if(localStorage.getItem("uuid") == null)
    {
      var device = ionic.Platform.device();
      var uuid = device.uuid;
      if(typeof(uuid) == 'undefined')uuid = makeid(); 
      localStorage.setItem("uuid", uuid);
    }
    
    $ionicLoading.show({
    content: 'Getting current location...',
    showBackdrop: false
    });

    $scope.map = map;
    $scope.centerOnMe();
  });

  google.maps.event.addDomListener(window, 'load', initialize);

  $scope.showInfoWindowCustom = function(event,id)
  {
    if(!$scope.mainLocation) 
    {
      return;
    }
    else
    {
      //...set new text for infoWindw
        var map = $scope.map;
        var infoWindow = map.infoWindows[id];
        infoWindow.__open(map, $scope, $scope.mainLocation);
    }
  };

  function makeid()
  {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 16; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  fromLatLngToPixel = function (position)
  {
    var map = $scope.map;
    var scale = Math.pow(2, map.getZoom());
    var proj = map.getProjection();
    var bounds = map.getBounds();

    var nw = proj.fromLatLngToPoint(
    new google.maps.LatLng(
    bounds.getNorthEast().lat(),
    bounds.getSouthWest().lng()
    ));
    var point = proj.fromLatLngToPoint(position);

    return new google.maps.Point(
    Math.floor((point.x - nw.x) * scale),
    Math.floor((point.y - nw.y) * scale));
  };

  fromPixelToLatLng = function (pixel)
  {
    var map = $scope.map;
    var scale = Math.pow(2, map.getZoom());
    var proj = map.getProjection();
    var bounds = map.getBounds();

    var nw = proj.fromLatLngToPoint(
    new google.maps.LatLng(
    bounds.getNorthEast().lat(),
    bounds.getSouthWest().lng()
    ));
    var point = new google.maps.Point();

    point.x = pixel.x / scale + nw.x;
    point.y = pixel.y / scale + nw.y;

    return proj.fromPointToLatLng(point);
  };

  function timeSince(date)
  {
    var seconds = Math.floor((new Date().getTime() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);
    if (interval > 1) {
      return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + " minutes";
    }
    if(seconds === 0) return 'Just now'
      return Math.floor(seconds) + " seconds";
  }

  $scope.centerOnMe = function() 
  {
    if(!$scope.map)
    {return;}else var map = $scope.map;

    navigator.geolocation.getCurrentPosition(function(pos)
    {
      var myLocation = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      $scope.map.setCenter(myLocation);
      $scope.mainLocation = myLocation;

      $scope.emitUser(myLocation);

      map.customMarkers.me.setPosition(myLocation);
      map.customMarkers.me.setVisible(true);

      $ionicLoading.hide();
    }, function(error)
    {
      alert('Unable to get location: ' + error.message);
    });
    $timeout($scope.centerOnMe, 5000);
  };

  $scope.emitUser = function(myLocation)
  {
      if(typeof(myLocation) == 'undefined') myLocation = $scope.mainLocation;
      var uuid = localStorage.getItem("uuid");
      if(localStorage.getItem("lastMessage") == null)var newMessage = 'Hi everybody!';
      else var newMessage = localStorage.getItem("lastMessage");

      if(localStorage.getItem("lastTime") == null) var dateTime = new Date().getTime();
      else var dateTime = localStorage.getItem("lastTime");

      $scope.dateTime = timeSince(dateTime);  
      $scope.lastMessage = newMessage;
      if(typeof($scope.myImagePath) != 'undefined')var image = 'default'; //for now
      else var image = 'default';//for now
      var package = JSON.stringify({'what':newMessage,'when':dateTime,'where':myLocation,'who':image,'how':uuid});
      socket.emit('newUser', package);
  }

  $scope.submitMessage = function()
  {
    if(typeof(myLocation) == 'undefined') var myLocation = $scope.mainLocation;
    var uuid = localStorage.getItem("uuid");
    var newMessage = $scope.textArea;

    var dateTime = new Date().getTime();

    if(typeof($scope.myImagePath) != 'undefined')var image = 'default'; //for now --- need to upload image when is set by user to sit on server then set image here as defualt included witha app code
    else var image = 'default';//for now

    $scope.textArea = '';
    $scope.lastMessage = newMessage;
    $scope.dateTime = timeSince(dateTime);

    localStorage.setItem("lastMessage", newMessage);
    localStorage.setItem("lastTime", dateTime);

    var package = JSON.stringify({'what':newMessage,'when':dateTime,'where':myLocation,'who':image,'how':uuid});
    socket.emit('chatMessage', package);
  }

});
