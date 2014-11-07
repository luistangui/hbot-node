'use strict'

angular.module 'hbotNodeApp'
.controller 'MainCtrl', ($scope, $http, socket) ->
  $scope.xmppRoster=''
  $scope.xmppMessages=[]
  $scope.lastMessage=[];

  $http.get('/api/hbot/roster').success (data) ->
    $scope.xmppRoster = data
    socket.syncUpdates 'xmpp-roster', $scope.xmppRoster,(event,rosterItem,xmppRoster)->
      #TODO: saber como funciona esto realmente :S
      $scope.xmppRoster=rosterItem
      
  $http.get('/api/hbot/messages').success (data) ->
    $scope.lastMessages=data
    socket.syncUpdates 'xmpp-message', $scope.lastMessage,(event,xmppMessage,xmppMessage2)->
      $scope.lastMessage=xmppMessage
      $scope.xmppMessages.push($scope.lastMessage)

  $scope.updateRoster = ->
    $http.get('/api/hbot/roster').success (data) ->
      $scope.xmppRoster = data
