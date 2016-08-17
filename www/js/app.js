// Création de l'instance de notre application. Dans laquelle on passe les differents plugins que l'on utitilise (comme ngAnimate, ngProgress)
//ainsi que les autres fichiers js (angular) qui seront utilisés par l'application => les controllers et les services
var app = angular.module('quizApp', ['ionic','ionic.service.core','quizApp.controllers','quizApp.services','ngCordova','ngMessages','ngCsv','ngProgress','ngAnimate'])

//C'est ici qu'il faudra charger la base de donnée, on crée donc une instance db
var db;

app.run(function($ionicPlatform, $cordovaSQLite, $rootScope,ThemesDataService) {

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

    //On veut pouvoir utiliser une base de donnée pré remplie. On va donc créer une fonction db copy qui copie le contenu local de notre ordinateur dans
    //une autre base de donnée qui elle sera compilé dans notre .apk
    function dbcopy()
    {
      //Les parametres correspondent dans l'ordre au nom de la base, sa localisation et les fonctions à appeler en cas de succés et d'erreur
      window.plugins.sqlDB.copy("data3.db",0,copysuccess,copyerror);
    }

    //La fonction dbcopy renverra vers copysuccess dans le cas ou il n'y a pas eu de bus mais aussi seulement si la base de donnée n'existe pas encore.
    function copysuccess()
    {

      db = window.sqlitePlugin.openDatabase({name: "data3.db", iosDatabaseLocation: 'default'});
      console.log('Base copiée')
    }

    //si la base de donnée à déja été combié ça sera copyerror qui sera appelé
    function copyerror(e)
    {

      console.log("La base existe déja");
      //même si la base de donnée a déja été copié on veut quand même que l'application l'ouvre pour l'utiliser.
      db = window.sqlitePlugin.openDatabase({name: "data3.db", iosDatabaseLocation: 'default'});
    }

    //Je met egalement en place une fonction pour supprimer facilement la base de donnée copié. ça sera utile dans le cas ou on veut changer completement de base utilisée par exemple
    function dbremove()
    {
      window.plugins.sqlDB.remove("data3.db",0,removesuccess,removeerror);
    }

    //De même que pour la fonction de copie on va verifier que la base de donnée à bien été supprimée avec removesucess ou removeerror qui seront appelées en fonction
    function removesuccess()
    {
      console.log('la base a été supprimée')
    }

    function removeerror(e)
    {
      console.log("La base n'a pas pu être supprimée");
    }


    //On appelle simplement notre fonction dbcopy ici
    //Décommenter ou commenter la ligne de dessous en fonction de si l'on souhaite recopier la base ou garder la précédente.
    dbremove();
    dbcopy();
  })

})


  //Ici on definit les routes de notre application. c'est à dire que pour chaque template crée un etat qui pourra directement etre appelé ainsi $state.go('home')
  app.config(function($stateProvider, $urlRouterProvider){
  	$stateProvider

    .state('custom', {
  		url: "/custom",
  		templateUrl: "templates/custom.html",
  		controller: "CustomCtrl"
  	})

    .state('first', {
  		url: "/first",
  		templateUrl: "templates/first.html",
  		controller: "FirstCtrl"
  	})

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
      controller: "WheelWinCtrl"
    })

    .state('wheelLoose', {
      url: "/wheel_loose",
      templateUrl: "templates/wheel_loose.html",
      controller: "WheelLooseCtrl"
    })

    .state('fin', {
      url: "/fin",
      templateUrl: "templates/fin.html",
      controller: "FinCtrl"
    })

    .state('data',{
      url: "/data",
      templateUrl: "templates/data.html",
      controller: "DataCtrl"
    })


    //Route par defaut -> dans le cas ou le chemin spécifié est invalide, ou a l'ouverture de l'application quand aucun chemin n'est specifié l'application renverra par defaut à 'index'
  	$urlRouterProvider.otherwise('/first');
})
