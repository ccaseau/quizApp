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
     getByMail: function(mail){
        return $cordovaSQLite.execute(db, 'SELECT COUNT(*) FROM Users where mail = ?', [mail])

       }
  }
})
