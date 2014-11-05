'use strict'

angular.module 'hbotNodeApp'
.controller 'MainCtrl', ($scope, $http, socket) ->
  $scope.xmppRoster=''

  $http.get('/api/hbot/roster').success (data) ->
    $scope.xmppRoster = data
    socket.syncUpdates 'xmpp-roster', $scope.xmppRoster,(event,rosterItem,xmppRoster)->
      #TODO: saber como funciona esto realmente :S
      $scope.xmppRoster=rosterItem

  $scope.updateRoster = ->
    $http.get('/api/hbot/roster').success (data) ->
      $scope.xmppRoster = data
