// COMMENTER ET NETTOYER LE CODE INUTILE

var app = angular.module('quizApp.controllers', []);

    app.controller('MainCtrl', function ($scope, $ionicModal,$state) {
      //Avant de charger la page home on laisse quelques ms à l'application pour ouvrir la base de donnée
      console.log("Chargement de la bdd");
      setTimeout(function()
      {
          $state.go('wheel');
      },950);

    });

    app.controller('CustomCtrl', function ($scope, $ionicModal,$state,ThemesDataService) {
      console.log("Vous pouvez créer votre théme visuel avant de lancer l'application");
      $scope.theme = [];
      $scope.createTheme = function()
      {
        ThemesDataService.updateTheme($scope.theme);
        $state.go('home');
      }

      $scope.next = function()
      {
        $state.go('home')
      }

    });

    // Controller de la page home
    app.controller('HomeCtrl', function ($scope, $ionicModal,ThemesDataService) {
      console.log("vous êtes sur la page home");

      //***********************************Customisation dynamique************************************* //
      //Recuperation du theme
        $scope.getThemeFromDb = function()
        {
          ThemesDataService.getAll(function(data){
              $scope.background_img = {"background-image": "url("+data[ThemesDataService.getTheme()].background+")"};
              $scope.text_color = {"color": data[ThemesDataService.getTheme()].color_text};
              $scope.text_font = {"font-family" :data[ThemesDataService.getTheme()].font};
              $scope.color_btn = {"background-color": data[ThemesDataService.getTheme()].color_btn}
          });
        }

        $scope.$on('$ionicView.enter', function(e) {
          $scope.getThemeFromDb();
        });

      $scope.margeStyleObj = function(objectList) {
        var obj = {};
          objectList.forEach(function(x) {
            angular.extend(obj,x);
          });
        return obj;
      }
      //********************************Fin Customisation dynamique************************************* //

      //Permettre le changement de thème par l'utilisateur
      $scope.themeSelect = 'Mon théme';
      $scope.showSelectValue = function (themeSelect)
      {
        if (themeSelect == 'Mon théme')
        {
          ThemesDataService.setTheme(0);
        }

        else if (themeSelect == 'Light')
        {
          ThemesDataService.setTheme(1);
        }

        else if (themeSelect == 'Dark')
        {
          ThemesDataService.setTheme(2);
        }

        else if (themeSelect == 'Colorfull')
          {
            ThemesDataService.setTheme(3);
          }
          $scope.getThemeFromDb();
      }

    });

    // Controller de la page question
    app.controller('QstCtrl', function ($scope,$interval,$filter,$ionicModal,$location,$state,ManageScore, $state, $ionicPopover,QuestionsDataService,ThemesDataService,ngProgressFactory) {

      $scope.$on('$ionicView.enter', function(e) {
        ThemesDataService.getAll(function(data){
        //***********************************Customisation dynamique************************************* //
            $scope.background_img = {"background-image": "url("+data[ThemesDataService.getTheme()].background+")"};
            $scope.text_color = {"color": data[ThemesDataService.getTheme()].color_text};
            $scope.text_font = {"font-family" :data[ThemesDataService.getTheme()].font};
            $scope.color_btn = {"background-color": data[ThemesDataService.getTheme()].color_btn};
            $scope.background_explication = {"background-color": data[ThemesDataService.getTheme()].color_false};
            $scope.true = {"background-color": data[ThemesDataService.getTheme()].color_right};
            $scope.false = {"background-color": data[ThemesDataService.getTheme()].color_false};
            $scope.color_btn_normal = [{"background-color": data[ThemesDataService.getTheme()].color_btn_normal},{"background-color": data[ThemesDataService.getTheme()].color_btn_normal},{"background-color": data[ThemesDataService.getTheme()].color_btn_normal},{"background-color": data[ThemesDataService.getTheme()].color_btn_normal}];
            $scope.color_bar = {"color": data[ThemesDataService.getTheme()].color_bar};
          });
        });

      $scope.margeStyleObj = function(objectList) {
        var obj = {};
          objectList.forEach(function(x) {
            angular.extend(obj,x);
          });
        return obj;
      }
      //*******************************Fin Customisation dynamique************************************* //

      //Variables
      $scope.count = 0; //Variable pour incrémenter l'id de la question qui doit s'afficher
      $scope.isActive = false;
      $scope.rightAnswer = false; //variable pour savoir si l'utilisateur à répondu juste ou faux
      $scope.timeout = false; //variable pour savoir si l'utilisateur n'a pas répondu a temps
      $scope.viewReponse = false; //variable pour n'afficher les 4 propositions qu'aprés 5 secondes de timer
      $scope.nbQst = 2; // le nombre de question que l'on pioche (pour l'instant definie en local)

      //****Timer**** Plugin progressbar.js
      $scope.timeQst = 5; //On set à 5 secondes le timer pour lire la question
      $scope.time = 20; //On set à 20 secondes pour répondre

      //Timer pour lire la question
      var barQuestion = new ProgressBar.Line('#barQuestion', {
      from: { color: '#97CE68'},
      to: { color: '#97CE68'},
      duration: $scope.timeQst * 1000,
      strokeWidth: 2.5,
      trailColor: '#818C8E',
      trailWidth: 2.5,
      step: function(state,barQuestion, attachment) {
      barQuestion.path.setAttribute('stroke', state.color);
      },
    });

      //Timer pour répondre à la question
      var barReponse = new ProgressBar.Line('#barReponse', {
      from: { color: '#97CE68'},
      to: { color: '#E3000E'},
      duration: $scope.time*1000,
      strokeWidth: 2.5,
      trailColor: '#818C8E',
      trailWidth: 2.5,
      step: function(state,barReponse, attachment) {
          barReponse.path.setAttribute('stroke', state.color);
      },
    });

      //Timer temps de réponse
        $scope.StopTimer = function () {
          //Cancel the Timer.
            if (angular.isDefined($scope.Timer)) {
              $interval.cancel($scope.Timer);
            }
        };

        $scope.StartTimer = function () {
        //Le timer tourne toute les secondes (1000 ms)
          $scope.Timer = $interval(function () {
              $scope.time = $scope.time - 1;
                   if ($scope.time == 0)
                   {
                     $scope.StopTimer();
                     $scope.openModal();
                     $scope.timeout = true;
                   }

               }, 1000);
           };

      //Timer temps de question
        $scope.StopTimerQst = function () {
            if (angular.isDefined($scope.TimerQst)) {
              $interval.cancel($scope.TimerQst);
            }
        };

        $scope.StartTimerQst = function () {
          $scope.TimerQst = $interval(function () {
              $scope.timeQst = $scope.timeQst - 1;
                   if ($scope.timeQst == 0)
                   {
                     $scope.StopTimerQst();
                   }

               }, 1000);
           };

        $scope.question = [];
        $scope.question.reponse = [];

          $scope.$on('$ionicView.enter', function(e) {

          // On remet le score à 0
          $scope.score = ManageScore.reset();

          // On lance le timer de la question et on anime la barre
          $scope.StartTimerQst();
          barQuestion.animate(1);

          // 5s plus tard on lance le timer de la réponse
          setTimeout(function()
          {
            $scope.StartTimer();
            barReponse.animate(1);
            $scope.viewReponse = true;
          },5000);

          //On récupere les questions de notre bdd en utilisant le service QuestionsDataService
          QuestionsDataService.getRandomQuestion($scope.nbQst,function(dataQ,dataR){

          //On rempli nos variables locales avec les questions de la base de donnée
          $scope.question = dataQ;
          $scope.question.reponse = dataR;

          //On stocke le nombre de questions dans size et on l'envoi dans le service ManageScore pour partager la valeur entre les controlleurs
          var size = dataQ.length;
          ManageScore.setTotal(size);

          //On gére le pourcentage de la barre en fonction du nombre de questions (100%/size)
          $scope.pourcentage = 100 / (size);

          //$scope.progression = la progression actuelle de la barre & $scope.pourcentage = le pas d'évolution entre chaque question
          $scope.progression = $scope.pourcentage;

          //On crée la barre de progression, on change sa couleur, son avancée, et l'affichage du texte à côté
          $scope.progressbar = ngProgressFactory.createInstance();
          $scope.progressbar.setColor($scope.color_bar.color);
          $scope.progressbar.set($scope.progression);
          $scope.spacingprogress = ($scope.progression*6.3)+"%";
          $scope.spacing = {"margin-left": $scope.spacingprogress, "width": '150px'};
        })
    })

      // Fonction qui charge la question suivante en incrémentant un compteur
      $scope.getNextQuestion = function() {
        $scope.toggleInactive();
        $scope.closeModal();

        setTimeout(function()
        {
          if ($scope.count < $scope.question.length - 1)
          {
              $scope.count = $scope.count + 1;
          }
          else
          {
              $location.path("form");
          }
        },250);
      };

      //**************Fonction pour les explications******************//

      //On genere notre modal à partir du template explications.html
      $ionicModal.fromTemplateUrl('explications.html', {
        scope: $scope,
        animation: 'slide-left-right'
        }).then(function(modal) {
          $scope.modal = modal;
        });

        //Ouvrir les explications
        $scope.openModal = function() {
          $scope.modal.show().then(function() {
            $scope.viewReponse = false; //une fois la modal ouverte on fait disparaitre les reponses
          })

          var ModalSelect = angular.element(document.getElementById('explication-modal'));
          //On remet les timers à 0
          $scope.StopTimer();
          barReponse.set(0);
          barQuestion.set(0);
          $scope.timeQst = 5;
        };

        //Fermer les explications
        $scope.closeModal = function() {

          barQuestion.animate(1);//On lance le premier timer
          $scope.StartTimerQst();
          setTimeout(function()
          {
            $scope.viewReponse = true;
            $scope.StartTimer();
            $scope.time = 20;
            barReponse.animate(1);

            //On remet nos booléen à false pour tester la prochaine réponse de l'utilisateur
            $scope.timeout = false;
            $scope.rightAnswer = false;

          },5000); // On lance le 2eme timer 5s aprés la fermeture de la question

            $scope.modal.hide().then(function() {
              //On augmente le pourcentage de la barre de progression
              $scope.progression = $scope.progression +$scope.pourcentage;
              $scope.spacingprogress = ($scope.progression*6.3)+"%"
              $scope.spacing = {"margin-left": $scope.spacingprogress, "width": '150px'};
              $scope.progressbar.set($scope.progression);

              //Si la progression est à 100% on doit faire disparaitre la barre.
              if (parseInt($scope.progression) > 100 )
              {
                  $scope.progressbar.complete();
              }
          });
        };

      // Fonction pour le changement de couleur des boutons
      $scope.toggleActive = function() {
        $scope.isActive = true;
      };

      $scope.toggleInactive = function() {
        $scope.isActive = false;
      };

      // Fonction qui teste si la réponse donnée est juste et incrémente le score de l'utilisateur en fonction
      $scope.getAnswer = function(chosenAnswer,currentQuest,index) {
        //On recupere le bouton sur lequel on a cliqué et on le change de couleur
        $scope.color_btn_normal[index]= $scope.color_btn;
        // si la réponse est juste
        if(chosenAnswer == currentQuest.bonneRep)
        {
          $scope.rightAnswer = true;
          // Dans le cas d'un bug, on empéche le score d'aller au dessus du nombre de question
          if($scope.score < $scope.question.length)
          {
            // On utilise le service ManageScore pour ajouter un point au score de l'utilisateur
            $scope.score =  ManageScore.add();
          }

        }
        // si la réponse est fausse
        else {
            $scope.rightAnswer = false;
        }

        //Dans tous les cas on doit changer la couleur des boutons en orange
        $scope.toggleActive();

        //Puis changer en vert ou rouge
        setTimeout(function()
        {
          // boutonSelect.removeClass('button-energized');
          if(!$scope.rightAnswer)
          {
            $scope.color_btn_normal[index]= $scope.false;
            $scope.background_explication = $scope.false;
          }

          else if ($scope.timeout)
          {
              $scope.color_btn_normal[index]= $scope.false;
              $scope.background_explication = $scope.false;
          }

          else
          {
              $scope.color_btn_normal[index] = $scope.true;
              $scope.background_explication = $scope.true
          }

        },200);

        //Puis afficher les explications quelques ms plus tard
        setTimeout(function()
        {
          $scope.openModal();

        },1100);

        //Et enfin enlever la couleur du bouton pour qu'il soit gris lorsque la prochaine question sera posée
        setTimeout(function()
        {
              ThemesDataService.getAll(function(data) {
                $scope.color_btn_normal = {"bakcground-color": data[ThemesDataService.getTheme()].color_btn_normal};
              });

        },2000);
      };
    });

    //Controller de la page wheel
     app.controller('WheelCtrl', function ($scope, $ionicModal,$location,$state,ThemesDataService,CadeauxDataService) {

       //Variables
       //On part sur une base de 3 lots pour calculer les angles d'arret
       //=> comment rendre dynamique le choix de ce nombre ?
       var nbLots = 3;
       var EcartAngle = 360/(nbLots+1);
       var TabAngle = new Array();
       TabAngle["Montre"] = EcartAngle/2;
       TabAngle["Stylo"] = TabAngle["Montre"]+EcartAngle;
       TabAngle["USB"] = TabAngle["Stylo"]+EcartAngle;
       TabAngle["Perdu"] = TabAngle["USB"]+EcartAngle;

       console.log(TabAngle["Montre"]);
       console.log(TabAngle["Stylo"]);
       console.log(TabAngle["USB"]);
       console.log(TabAngle["Perdu"]);

       $scope.cadeau = '';

       var now = new Date();
       var annee   = now.getFullYear();
       var mois    = ('0'+(now.getMonth()+1)).slice(-2);
       var jour    = ('0'+now.getDate()   ).slice(-2);
       var heure   = ('0'+now.getHours()  ).slice(-2);
       var minute  = ('0'+now.getMinutes()).slice(-2);
       var seconde = ('0'+now.getSeconds()).slice(-2);
       var date = annee+"-"+mois+"-"+jour+" "+heure+":"+minute+":"+seconde;
       var date2 = annee+"-"+mois+"-"+jour+" 23:59:59";
       console.log(date);


       $scope.$on('$ionicView.enter', function(e) {
         ThemesDataService.getAll(function(data){
         //***********************************Customisation dynamique************************************* //
             $scope.background_img = {"background-image": "url("+data[ThemesDataService.getTheme()].background+")"};
             $scope.text_color = {"color": data[ThemesDataService.getTheme()].color_text};
             $scope.text_font = {"font-family" :data[ThemesDataService.getTheme()].font};
             $scope.color_btn_normal = {"background-color": data[ThemesDataService.getTheme()].color_btn_normal};

           });

           CadeauxDataService.getCadeau(date,date2,function(data){
             console.log(data);

             var randomNb = Math.floor((Math.random() * 100) + 1);

             console.log(randomNb);
             console.log(data[0].Chances);

             if (randomNb > data[0].Chances)
             {
               $scope.cadeau = 'Perdu';
             }

             else
             {
               $scope.cadeau = data[0].CodeCadeau;
               CadeauxDataService.SubstrQuantite(data[0].Id);
               CadeauxDataService.setIdCadeau(data[0].Id)
             }
              console.log('mon cadeau : "'+$scope.cadeau+'"')
           })

           //Booléen pour savoir si l'utilisateur à déja lancée la roue
           $scope.canSpin = true;

         });

       $scope.margeStyleObj = function(objectList) {
         var obj = {};
           objectList.forEach(function(x) {
             angular.extend(obj,x);
           });
         return obj;
       }
       //*******************************Fin Customisation dynamique************************************* //

         //On utilise Winwheel.js (plugin javascript) pour parametrer une roue
         $scope.spinWheel = new Winwheel({
             'numSegments'    : nbLots+1, //Nombre de lots + 1 pour le quartier "perdu"
             'lineWidth'   : 3.5,
             'textFillStyle' : 'white',
             'textFontSize' : 35,
             'innerRadius'     : 20,
             'textAlignment' : 'center',
             'segments'       :
             [
                 {'fillStyle' : '#3498db', 'text' : 'Montre'}, // On indique à chaque fois la couleur du quartier et le texte qui s'affichera
                 {'fillStyle' : '#903288', 'text' : 'Stylo'},
                 {'fillStyle' : '#f1c40f', 'text' : 'USB'},
                 {'fillStyle' : '#2E2E2E', 'text' : 'Perdu'},
             ],
             'animation' :
             {
                 'type'     : 'spinToStop',
                 'duration' : 3, // durée de l'animation => parametre la vitesse de la roue
                 'spins'    : 5, //Nombre de tours que va faire la roue
             }
       });


       //on stocke le temps que va mettre la roue à s'arreter
       $scope.time = ($scope.spinWheel.animation.duration) * 1000;


       //Variables pour savoir si l'utilisateur a gagné ou perdu
       $scope.wheelWin = false;
       $scope.wheelLoose = false;

       //Variable qui stockera le prix gagné
       $scope.prize = "";

       //Fonction pour indiquer à l'utilisateur le quartier sur lequel la roue s'est arretée
       function alertPrize()
       {
         // On gere l'affichage rendu à l'utilisateur
         var winningSegment = $scope.spinWheel.getIndicatedSegment();

         setTimeout(function()
         {
           if (winningSegment.text == 'Perdu')
           {
            $state.go('wheelLoose');
           }
           else {
            $state.go('wheelWin');
           }
         },1000);
       }
       //Fonction pour faire tourner la roue
       $scope.spin = function()
       {
         //Si l'utilisateur n'a pas encore joué on appelle la fonction startAnimation du plugin Winwheel.js
         if($scope.canSpin)
         {
             $scope.spinWheel.animation.stopAngle = TabAngle[$scope.cadeau];
             $scope.spinWheel.startAnimation()
             $scope.canSpin = false;

             //Une fois l'animation terminée on appelle notre fonction alertPrize()
             setTimeout(function()
             {
               alertPrize();

             },$scope.time); //$scope.time contient la durée de l'animation. On veut que le prix soit indiqué une fois la roue arretée !

         }
       }

     });

     app.controller('WheelWinCtrl', function ($scope, $ionicModal,$state, CadeauxDataService) {
       var idCadeau = CadeauxDataService.getIdCadeau();
        CadeauxDataService.getInfoCadeau(idCadeau,function(data){
          $scope.cadeau = data;
        })
     });

    // Controller de la page form
    app.controller('FormCtrl', function ($scope, $ionicModal,$stateParams, $location, $state, ManageScore, $cordovaSQLite, $ionicPlatform,UsersDataService,ThemesDataService) {

      $scope.$on('$ionicView.enter', function(e) {
        ThemesDataService.getAll(function(data){
        //***********************************Customisation dynamique************************************* //
            $scope.background_img = {"background-image": "url("+data[ThemesDataService.getTheme()].background+")"};
            $scope.text_color = {"color": data[ThemesDataService.getTheme()].color_text};
            $scope.text_font = {"font-family" :data[ThemesDataService.getTheme()].font};
            $scope.color_btn = {"background-color": data[ThemesDataService.getTheme()].color_btn};
            $scope.input_color = {"color": data[ThemesDataService.getTheme()].color_btn};
          });
        });

        $scope.margeStyleObj = function(objectList) {
          var obj = {};
            objectList.forEach(function(x) {
              angular.extend(obj,x);
            });
          return obj;
        }
      //*******************************Fin Customisation dynamique************************************* //
    $scope.total = ManageScore.getTotal();
    $scope.datas = [];
    $scope.users = [];

      $scope.$on('$ionicView.enter', function(e) {

        $scope.score = ManageScore.init();
        console.log($scope.score)
        //On récuperer les utilisateurs déja en base de donnée
        UsersDataService.getAll(function(data){
          $scope.datas = data
        })
      })

    //Fonction pour sauver en base de donnée les informations entrées dans le formulaire
    $scope.save = function(form_user) {

      //On doit verifier que quelqu'un avec la même adresse mail n'est pas deja inscrit
      UsersDataService.getSameMail($scope.users.mail, function(item){
        $scope.user_exist = item;

       if (form_user.$valid)
       {
         if (!$scope.user_exist) {
         //Si le formulaire et valide et que c'est un nouveau mail : on fait appel au service UsersData pour rajouter une entrée dans la bdd
          UsersDataService.createUser($scope.users);
          //On charge la page suivante
          $location.path('wheel');
          $scope.error = '';
          $scope.users = {};
          form_user.$setPristine();
        }
        else
        {
          //Gestion de l'affichage dans le cas ou le mail existe déja
          $scope.error = "L'adresse mail que vous avez entrée est déja utilisée!";
        }
       }

     });
    }
      //Fonction utilie pour les test permettant de supprimer un utilisateur de la bdd
      $scope.delete = function(id) {
        //on fait appel au service UsersData
        UsersDataService.deleteUser(id);
        //On recharge la page
        $state.reload();
        }
  })

  //Controller pour la page Fin
  app.controller('FinCtrl', function ($scope, $ionicModal,$location,$state,ThemesDataService)
  {

    $scope.$on('$ionicView.enter', function(e) {
      ThemesDataService.getAll(function(data){
      //***********************************Customisation dynamique************************************* //
          $scope.background_img = {"background-image": "url("+data[ThemesDataService.getTheme()].background+")"};
          $scope.text_color = {"color": data[ThemesDataService.getTheme()].color_text};
          $scope.text_font = {"font-family" :data[ThemesDataService.getTheme()].font};
        });
      });

    $scope.margeStyleObj = function(objectList) {
      var obj = {};
        objectList.forEach(function(x) {
          angular.extend(obj,x);
        });
      return obj;
    }
    //*******************************Fin Customisation dynamique************************************* //

    $scope.links =[
    {
      addr:'www.univ-tlse3.fr'
    },
    {
      addr:'www.univ-paul-sabbatier.fr'
    },
    {
      addr:'www.rectorat-tls'
    }]
      //Aprés 5 secondes on retourne à la page home
    $scope.$on('$ionicView.enter', function(e) {
      setTimeout(function()
      {
        $state.go('wheel');
        console.log("retour à la page home !")

      },5000);

    })
  });
