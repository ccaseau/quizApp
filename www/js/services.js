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

//********************************************GESTION DE LA BASE DE DONNEE***************************************************//

//Table Questions
app.factory('QuestionsDataService', function ($cordovaSQLite, $ionicPlatform) {

  return {

    //Retourner les utilisateurs déja présent dans la base de donnée
    getAll: function(callback){
         $ionicPlatform.ready(function () {
           $cordovaSQLite.execute(db, 'SELECT * FROM Questions').then(function (results) {
             var data = []
             for (i = 0, max = results.rows.length; i < max; i++) {
               data.push(results.rows.item(i))
             }
             callback(data)
           })
        })
      },
  }
})

//Table Reponses
app.factory('ReponsesDataService', function ($cordovaSQLite, $ionicPlatform) {

  return {

    //Retourner les utilisateurs déja présent dans la base de donnée
    getAll: function(callback){
         $ionicPlatform.ready(function () {
           $cordovaSQLite.execute(db, 'SELECT * FROM Reponses').then(function (results) {
             var data = []
             for (i = 0, max = results.rows.length; i < max; i++) {
               data.push(results.rows.item(i))
             }
             callback(data)
           })
        })
      },
  }
})

//Table Users
app.factory('UsersDataService', function ($cordovaSQLite, $ionicPlatform) {

  return {

    //Retourner les utilisateurs déja présent dans la base de donnée
    getAll: function(callback){
         $ionicPlatform.ready(function () {
           $cordovaSQLite.execute(db, 'SELECT * FROM Users').then(function (results) {
             var data = []
             for (i = 0, max = results.rows.length; i < max; i++) {
               data.push(results.rows.item(i))
             }
             callback(data)
           })
        })
      },

    //Rajouter un utilisateur dans la base de donnée
      createUser: function (user) {
        return $cordovaSQLite.execute(db, 'INSERT INTO Users (mail,age,formation,code,tel,sexe,info) VALUES (?,?,?,?,?,?,?)', [user.mail, user.age, user.formation,user.code, user.tel,user.sexe,user.info])
      },

    //Supprimer un utilisateur
    deleteUser: function(id){
       return $cordovaSQLite.execute(db, 'DELETE FROM Users where id = ?', [id])
     },

     //Retourne un utilisateur avec une certaine adresse

       getSameMail: function(mail,callback){
         var data = {} ;
         $cordovaSQLite.execute(db, 'SELECT COUNT(*) AS cnt FROM Users where mail = ?', [mail]).then(function (results) {
          if (results.rows.item(0).cnt != 0)
          {
            console.log("L'utilisateur avec l'adresse "+mail+" existe déja !");
            data = true;
          }

          else {
            console.log("L'utilisateur n'existe pas encore !");
            data = false;
          }

          callback(data);

         })
     }
  }
})

//Table Themes
app.factory('ThemesDataService', function ($cordovaSQLite, $ionicPlatform, $http) {

  return {

    //Retourner les utilisateurs déja présent dans la base de donnée
    getAll: function(callback){
         $ionicPlatform.ready(function () {
           $cordovaSQLite.execute(db, 'SELECT * FROM Themes').then(function (results) {
             var data = []
             for (i = 0, max = results.rows.length; i < max; i++) {
               data.push(results.rows.item(i))
             }
             callback(data)
           })
        })
      },
  }
})
