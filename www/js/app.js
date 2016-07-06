// App instance
var app = angular.module('quizApp', ['ionic','ionic.service.core','quizApp.controllers','quizApp.services','ngCordova','ngMessages','ngProgress','ngAnimate'])

// Database instance.
var db;



app.run(function($ionicPlatform, $cordovaSQLite, $rootScope) {

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

    //Utilisation d'une base de donnée pré remplie
    //On copie le contenu de notre base de donnée dans une base "locale" à l'application
    function dbcopy()
    {
      //Les parametres correspondent dans l'ordre au nom de la base, sa localisation et les fonctions à appeler en cas de succés et d'erreur
      window.plugins.sqlDB.copy("data3.db",0,copysuccess,copyerror);
    }

    //si la base n'existe pas encore
    function copysuccess()
    {

      db = window.sqlitePlugin.openDatabase({name: "data3.db", iosDatabaseLocation: 'default'});
      console.log('Base copiée')
    }

    //si la base existe déja
    function copyerror(e)
    {

      console.log("La base existe déja");
      db = window.sqlitePlugin.openDatabase({name: "data3.db", iosDatabaseLocation: 'default'});
    }

    //Fonction pour permettre la supression rapide de la base de donnée
    function dbremove()
    {
      window.plugins.sqlDB.remove("data3.db",0,removesuccess,removeerror);
    }

    //On verifie que la suppression a bien marchée
    function removesuccess()
    {
      console.log('la base a été supprimée')
    }

    function removeerror(e)
    {
      console.log("La base n'a pas pu être supprimée");
    }

    dbcopy();
    //Décommenter la ligne si l'on veut supprimer la base
    // dbremove();

  })

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

    .state('wheelWin', {
      url: "/wheel_win",
      templateUrl: "templates/wheel_win.html",
      controller: "WheelCtrl"
    })

    .state('wheelLoose', {
      url: "/wheel_loose",
      templateUrl: "templates/wheel_loose.html",
      controller: "WheelCtrl"
    })

    .state('fin', {
      url: "/fin",
      templateUrl: "templates/fin.html",
      controller: "FinCtrl"
    })


    //Route par defaut -> à l'ouverture de index.html ou si le chemin est invalide
  	$urlRouterProvider.otherwise('/home');
})
