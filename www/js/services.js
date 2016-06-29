var app = angular.module('quizApp.services', ['ngCordova']);

//Service permettant le partage du score entre la page question et la page de formulaire
app.factory('ManageScore', function(){

  var myScore = 0;

  return{
    init: function()
    {
      return myScore;
    },
    add: function()
    {
      myScore = myScore + 1;
      return myScore
    },
  }
})
