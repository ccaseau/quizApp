var app = angular.module('quizApp.services', ['ngCordova']);

//Service permettant le partage du score et du nb de question entre toutes les pages
app.factory('ManageScore', function(){

  var myScore = 0;
  var total = 0;

  return {

    setTotal: function(size)
    {
      total = size;
    },

    getTotal: function()
    {
      return total;
    },

    init: function()
    {
      return myScore;
    },

    reset: function()
    {
      myScore = 0;
      return myScore;
    },
    add: function()
    {
      myScore = myScore + 1;
      return myScore;
    },
  }
})

//********************************************GESTION DE LA BASE DE DONNEE***************************************************//

//Table Questions
app.factory('QuestionsDataService', function ($cordovaSQLite, $ionicPlatform) {

  return {
    //Retourne un certain nombre (nb_qst) de question de maniere aléatoire + selectionne les reponses associées
      getRandomQuestion: function(nb_qst,callback){
           $ionicPlatform.ready(function () {
             $cordovaSQLite.execute(db, 'SELECT * FROM Questions ORDER BY RANDOM() LIMIT "'+nb_qst+'"').then(function (resultsQ) {

               var dataQuestion = [];
               var dataReponse = [];
               for (i = 0, max = resultsQ.rows.length; i < max; i++) {
                 dataQuestion.push(resultsQ.rows.item(i))
               }
                  for (j = 0 ; j<nb_qst ; j++)
                  {
                    $cordovaSQLite.execute(db, 'SELECT reponse1,reponse2,reponse3,reponse4 FROM Reponses WHERE id_question = "' + dataQuestion[j].id + '"').then(function (resultsR) {
                      //WHERE  id_question = "' + dataQuestion[j].id + '"
                      for (i = 0, max = resultsR.rows.length; i < max; i++) {
                        dataReponse.push(resultsR.rows.item(i))
                      }
                      callback(dataQuestion,dataReponse);
                    })
                  }
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
        return $cordovaSQLite.execute(db, 'INSERT INTO Users (mail,age,formation,code,tel,sexe,info,score,date) VALUES (?,?,?,?,?,?,?,?,?)', [user.mail, user.age, user.formation,user.code, user.tel,user.sexe,user.info,user.score,user.date])
      },

      addGainUser: function (gain_user,mail_user) {
      return $cordovaSQLite.execute(db, 'UPDATE Users SET gain = "'+gain_user+'" WHERE mail = "'+mail_user+'"');
      },

    //Supprimer un utilisateur
    deleteUser: function(id){
       return $cordovaSQLite.execute(db, 'DELETE FROM Users where id = ?', [id])
     },


     getMail: function(){
       return mail_user;
     },

     setMail: function(mail){
       mail_user = mail;
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

//Table Cadeaux
app.factory('CadeauxDataService', function ($cordovaSQLite, $ionicPlatform) {
  idCadeau = 0;
  return {

    setIdCadeau: function(value)
    {
      idCadeau = value;
    },

    getIdCadeau: function()
    {
      return idCadeau;
    },

    //On recupere la dotation dont l'heure est passée avec l'obligatoire le plus haut puis l'heure la plus haute
    getCadeau: function(date,date2,callback){
         $ionicPlatform.ready(function () {
           $cordovaSQLite.execute(db,'SELECT Id,CodeCadeau,Chances FROM Cadeaux WHERE Quantite > 0 AND ShowTime <= "'+date+'" ORDER BY Obligatoire DESC, ShowTime DESC, Id DESC').then(function (results) {

             var data = []

             if (results.rows.length > 0)
             {
               for (i = 0, max = results.rows.length; i < max; i++) {
                 data.push(results.rows.item(i))
               }
               callback(data)
             }

            //On recupere la prochaine dotation disponible du jour
             else
             {
              $cordovaSQLite.execute(db,'SELECT Id,CodeCadeau,Chances FROM Cadeaux  WHERE Quantite > 0 AND ShowTime >= "'+date+'" AND ShowTime <="'+date2+'" ORDER BY Obligatoire ASC, ShowTime ASC, Id ASC').then(function (results2) {
                for (i = 0, max = results2.rows.length; i < max; i++) {
                  data.push(results2.rows.item(i))
                }
                callback(data)
              })
             }
        })
      })
      },


      getCadeau2: function(date,date2,callback){
           $ionicPlatform.ready(function () {
             $cordovaSQLite.execute(db,'SELECT Id,CodeCadeau,Chances FROM Cadeaux  WHERE Quantite > 0 AND ShowTime >= "'+date+'" AND ShowTime <="'+date2+'" ORDER BY Obligatoire ASC, ShowTime ASC, Id ASC').then(function (results) {
               var data = []
               for (i = 0, max = results.rows.length; i < max; i++) {
                 data.push(results.rows.item(i))
               }
               callback(data)
             })
          })
        },

      getInfoCadeau: function(idCadeau,callback){
           $ionicPlatform.ready(function () {
             $cordovaSQLite.execute(db,'SELECT Texte, Image FROM Cadeaux WHERE Id = "'+idCadeau+'" ').then(function (results) {
               var data = []
               for (i = 0, max = results.rows.length; i < max; i++) {
                 data.push(results.rows.item(i))
               }
               callback(data)
             })
          })
        },

      //Soustrait de 1 la quantité de la dotation avec l'id égal à Cadeauid
      SubstrQuantite: function(Cadeauid){
         return $cordovaSQLite.execute(db, 'UPDATE Cadeaux SET Quantite=(Quantite-1) WHERE Id = ?', [Cadeauid])
       },
    }
})

//Table Themes
app.factory('ThemesDataService', function ($cordovaSQLite, $ionicPlatform, $http) {
  var theme = 0;
  return {

    //Retourner le théme dans la bdd
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

      //Mettre à jour le théme perso
      updateTheme: function (theme) {
        return $cordovaSQLite.execute(db, 'UPDATE Themes SET background = "' + theme.background + '",font = "' + theme.font + '",color_btn = "' + theme.color_btn + '",color_right = "' + theme.color_right + '",color_false = "' +  theme.color_false + '",color_btn_normal = "' + theme.color_btn_normal + '",color_text = "' + theme.color_text + '",color_bar = "' + theme.color_bar + '" WHERE id = ' + 1);
      },

      //Changer et retourner le n° du theme selectionné par l'utilisateur
      setTheme: function(number)
      {
        theme = number;
      },

      getTheme: function()
      {
        return theme;
      },

  }
})
