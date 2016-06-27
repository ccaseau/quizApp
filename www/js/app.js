var app = angular.module('quizApp', ['ionic','ionic.service.core','quizApp.controllers','quizApp.services','LocalStorageModule'])

app.run(function($ionicPlatform) {

  $ionicPlatform.ready(function() {

    // //Activer ionic analytics
    // $ionicAnalytics.register();

    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  })
})

app.config(function (localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('quizApp');
});

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
  	$urlRouterProvider.otherwise('/home');
})
