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

//On met toute la partie gestion des données dans un service UsersDataService -> Opérations "CRUD" sur la base de données
//Dans l'idéal il faudrait deplacer ce service dans un propre fichier .js

  app.factory('UsersDataService', function ($cordovaSQLite, $ionicPlatform) {
    var db, dbName = "quizapp3.db"

//On commence par créer notre base de données en utilisant SQLite. On utilisera aussi WebSql pour que l'application
//soit utilisable/testable sur l'environement de développement
    function useWebSql() {
      db = window.openDatabase(dbName, "1.0", "User database", 200000)
      console.info('Using webSql')
    }

    function useSqlLite() {
      db = $cordovaSQLite.openDB({name: dbName})
      console.info('Using SQLITE')
    }

    //si elle n'existe pas on crée la table T_USER qui va contenir les données sur les utilisateurs
    function initDatabase(){
      $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS T_USER (id integer primary key, nom, prenom, addr, info, score)')
        .then(function(res){

        }, onErrorQuery)
    }

    // On determine si l'application est lancé depuis un appareil ou non et on utilise soit SqlLite soit WebSql en fonction
    $ionicPlatform.ready(function () {
      if(window.cordova){
        useSqlLite()
      } else {
        useWebSql()
      }

      initDatabase()
    })

    function onErrorQuery(err){
      console.error(err)
    }

    //On retourne le service contenant la liste des fonctions exposées pour faire les opérations CRUD basique.(create, read, update, delete)
    //ainsi que les autres fonctions dont nous avons besoin en particulier pour cette application
    return {

      //Crée un utilisateur
      createUser: function (user) {
        return $cordovaSQLite.execute(db, 'INSERT INTO T_USER (prenom, nom, addr, info, score) VALUES(?, ?, ?, ?, ?)', [user.prenom, user.nom, user.addr, user.info, user.score])
      },

      //Update un utilisateur
      updateUser: function(user){
        return $cordovaSQLite.execute(db, 'UPDATE T_USER set prenom = ?, nom = ?, addr = ? where id = ?', [user.prenom, user.nom, user.id])
      },

      //Retourne les utilisateurs
      getAll: function(callback){
        $ionicPlatform.ready(function () {
          $cordovaSQLite.execute(db, 'SELECT * FROM T_USER').then(function (results) {
            var data = []

            for (i = 0, max = results.rows.length; i < max; i++) {
              data.push(results.rows.item(i))
            }

            callback(data)
          }, onErrorQuery)
        })
      },

      //Supprime un utiisateur avec un certain id
      deleteUser: function(id){
        return $cordovaSQLite.execute(db, 'DELETE FROM T_USER where id = ?', [id])
      },

      //Retourne les utilisateurs avec une certaine adresse
      getSameAddr: function(addr){
        return $cordovaSQLite.execute(db, 'SELECT * FROM T_USER where addr = ?', [addr])
      },

      //Retourne les utilisateurs avec un certain id
      getById: function(id, callback){
        $ionicPlatform.ready(function () {
          $cordovaSQLite.execute(db, 'SELECT * FROM T_USER where id = ?', [id]).then(function (results) {
            callback(results.rows.item(0))
          })
        })
      }

    }
  })
