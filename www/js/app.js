// App instance
var app = angular.module('quizApp', ['ionic','ionic.service.core','quizApp.controllers','quizApp.services','ngCordova','ngMessages'])

// Database instance.
var db;


app.run(function($ionicPlatform, $cordovaSQLite) {

  $ionicPlatform.ready(function() {
    // //Activer ionic analytics
    // $ionicAnalytics.register();
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    db = $cordovaSQLite.openDB({name:"debug_test3.db", location:'default'});
       $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY AUTOINCREMENT, mail TEXT, age INTEGER, formation TEXT, code INTEGER, tel TEXT, sexe TEXT, info BOOLEAN )');

     });
})

  app.config(function($stateProvider, $urlRouterProvider){
  	$stateProvider

  	.state('home', {
  		url: "/home",
  		templateUrl: "templates/home.html",
  		controller: "HomeCtrl"
  	})

    .state('question', {
      cache: false,
      url: "/question",
      templateUrl: "templates/question.html",
      controller: "QstCtrl"
    })

    .state('form', {
      url: "/form",
      templateUrl: "templates/form.html",
      controller: "FormCtrl"
    })

    .state('wheel', {
      url: "/wheel",
      templateUrl: "templates/wheel.html",
      controller: "WheelCtrl"
    })


    //Route par defaut -> à l'ouverture de index.html ou si le chemin est invalide
  	$urlRouterProvider.otherwise('/form');
})
