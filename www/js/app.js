// Création de l'instance de notre application. Dans laquelle on passe les differents plugins que l'on utitilise (comme ngAnimate, ngProgress)
//ainsi que les autres fichiers js (angular) qui seront utilisés par l'application => les controllers et les services
var app = angular.module('quizApp', ['ionic','ionic.service.core','quizAppControllers','quizApp.services','ngCordova','ngMessages','ngCsv','ngProgress','ngAnimate','papa-promise'])
var quizAppControllers = angular.module('quizAppControllers', []);


//C'est ici que l'on va gerer la création de la base de donnée puis l'injection des questions et dotations
//depuis des fichiers CSV.

var db;

app.run(function($ionicPlatform, $cordovaSQLite, $rootScope,ThemesDataService,$http) {

  $ionicPlatform.ready(function() {
    //Activer ionic analytics
    //$ionicAnalytics.register();

    //Code présent par defaut : à conserver
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    //On commence par supprimer la base si elle existe déja
    dbremove();

    function localDBcreate()
    {
      //Avec le plugin sqlitePlugin on crée une base de donnée locale à l'application
      db = window.sqlitePlugin.openDatabase({name: "my.db", iosDatabaseLocation: 'default'});
      console.log("Base de donnée crée !")

      //On effectue ensuite les requêtes pour construire la structure de notre base => les differentes tables & attributs
      db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS Questions (id,path,intitule,bonneRep,explication,nbRep INTEGER,nbRepJuste INTEGER)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS Reponses (id_question,reponse1,reponse2,reponse3,reponse4)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS Cadeaux (id PRIMARY KEY,Texte,Quantite,CodeCadeau,Image,Chances,ShowTime,Obligatoire)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS Themes (background,font,color_btn,color_right,color_false,color_btn_normal,color_text,color_bar,id UNIQUE PRIMARY KEY)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY AUTOINCREMENT,mail,age,formation,code,tel,sexe,info,score,gain,date,temps)');

        //On gere les cas d'erreurs
      }, function(error) {
        console.log('Transaction ERROR: ' + error.message);

        //Si nos requêtes fonctionnent on peut alors remplir nos tables
      }, function() {

        console.log('Populated database OK');

        //On appelle les fonctions pour injecter les données des fichiers CSV
        injecterThemes();
        injecterQuestions();
        injecterDotations();

      });
    }


    function injecterThemes(tx)
    {
      //Traitement du fichier themes.csv

      $http.get('data/themes.csv').success(function(data){
        //On récupere les données de theme.csv et on utilise le plugin papa-parse pour convertir en format js
        //Le resultat de papa.parse nous renvoi 3 objets : data, errors et meta => dans notre cas c'est data qui nous interessent c'est la ou on retrouve nos données parsées. Dans errors on retrouve un tableau d'erreurs s'il y en a et dans meta des info suplémentaires sur le parsing
        var resultsT = Papa.parse(data);
        var ThemeData = resultsT.data; //On veut juste récuperer la partie "data" du parse

        //On execute alors une requête INSERT pour entrer notre Theme en base. => ex. ThemeData[1][0] fait reference à la deuxieme ligne et à la premiere colonne de notre fichier CSV.
        db.executeSql('INSERT OR IGNORE INTO Themes VALUES (?,?,?,?,?,?,?,?,?)', [ThemeData[1][0],ThemeData[1][1],ThemeData[1][2],ThemeData[1][5],ThemeData[1][6],ThemeData[1][3],ThemeData[1][4],ThemeData[0][2],'1']);
      })
    }
    //Traitement du fichier questions.csv
    function injecterQuestions(tx)
    {
      $http.get('data/questions.csv').success(function(data){

        var resultsQ = Papa.parse(data);
        var QuestionData = resultsQ.data;

        //On effectue une boucle pour entrer l'ensemble des lignes du fichier CSV dans la base
        // /!\ On s'arrette à QuestionData.length (qui renvoi le nombre de ligne) - 1 (!) car une ligne vide se rajoute à la fin de chaque .csv
        for (i = 1; i < QuestionData.length-1; i++ )
        {
          var question = ''+i; //On doit entrer l'id comme un string et non un int car autrement pour les requêtes select : ex.Where id = ... ça ne fonctionnait pas

          db.executeSql('INSERT INTO Questions VALUES (?,?,?,?,?,?,?)', [question,QuestionData[i][7],QuestionData[i][0],QuestionData[i][5],QuestionData[i][6]],0,0);
          db.executeSql('UPDATE Questions SET nbRepJuste = 0');
          db.executeSql('UPDATE Questions SET nbRep = 0');
          //On insere également les données dans la table réponses (les 4 choix possibles et l'id de la question) => on associera ensuite les deux avec une requête select where id_question = id
          db.executeSql('INSERT OR IGNORE INTO Reponses VALUES (?,?,?,?,?)', [question,QuestionData[i][1],QuestionData[i][2],QuestionData[i][3],QuestionData[i][4]]);
        }
      })
    }
    //Traitement du fichier dotations.csv
    function injecterDotations()
    {
      $http.get('data/dotations.csv').success(function(data){
        var resultsD = Papa.parse(data);
        var DotationData = resultsD.data;

        for (j = 1; j <= DotationData.length-2; j++)
        {
          var dotation = ''+j;
          db.executeSql('INSERT OR IGNORE INTO Cadeaux VALUES (?,?,?,?,?,?,?,?)', [dotation,DotationData[j][0],DotationData[j][1],DotationData[j][2],DotationData[j][3],DotationData[j][6],DotationData[j][5],DotationData[j][4]]);
        }
      })
    }

    //Je met egalement en place une fonction pour supprimer facilement la base de donnée copiée
    //C'est utile car dans le cas d'un changement des fichiers .csv il faudra d'abord detruire la bdd pour la re crée et la re remplire.
    function dbremove()
    {
      window.sqlitePlugin.deleteDatabase({name: 'my.db', location: 'default'}, removesuccess, removeerror);

      //Clean databases used for tests : A faire sur la tablette et sur mon telephone
      // window.sqlitePlugin.deleteDatabase({name: 'testing1.db', location: 'default'});
      // window.sqlitePlugin.deleteDatabase({name: 'test333.db', location: 'default'});
      // window.sqlitePlugin.deleteDatabase({name: 'populated.db', location: 'default'});
      // window.sqlitePlugin.deleteDatabase({name: 'demo.db', location: 'default'});
      // window.sqlitePlugin.deleteDatabase({name: 'demo2.db', location: 'default'});
      // window.sqlitePlugin.deleteDatabase({name: 'debug_test3.db', location: 'default'});
      // window.sqlitePlugin.deleteDatabase({name: 'data_structure2.db', location: 'default'});
      // window.sqlitePlugin.deleteDatabase({name: 'data3.db-journal', location: 'default'});
      // window.sqlitePlugin.deleteDatabase({name: 'filled_db_test1.db', location: 'default'});
    }

    //On va verifier que la base de donnée à bien été supprimée avec removesucess ou removeerror qui seront appelées en fonction
    function removesuccess()
    {
      console.log('la base a été supprimée')
      localDBcreate(); //Si la supression marche on appelle localDBcreate() pour créer la nouvelle base de donnée
    }

    function removeerror(e)
    {
      console.log("La base n'a pas pu être supprimée");
      localDBcreate();//Si la supression ne marche pas c'est probablement que la base n'existait pas, il faut donc quand même appeler localDBcreate()
    }

  })

})


//Ici on definit les routes de notre application. c'est à dire que pour chaque template on crée un etat qui pourra directement etre appelé ainsi $state.go('home')
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


  //Route par defaut -> dans le cas ou le chemin spécifié est invalide, ou a l'ouverture de l'application quand aucun chemin n'est specifié l'application renverra par defaut à cet endroit.
  $urlRouterProvider.otherwise('/first');
})
