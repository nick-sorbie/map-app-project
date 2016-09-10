angular.module('starter.services', [])

.factory('socket',function(socketFactory){
         var myIoSocket = io.connect('http://192.168.1.65:3000');
          mySocket = socketFactory({
            ioSocket: myIoSocket
          });
        return mySocket;
    })

.factory('listener',function(socketFactory){
         var myIoSocket = io.addListener('http://192.168.1.65:3000');
          mySocket = socketFactory({
            ioSocket: myIoSocket
          });
        return mySocket;
    });
