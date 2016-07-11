// COMMENTER ET NETTOYER LE CODE INUTILE

var app = angular.module('quizApp.controllers', []);

    app.controller('MainCtrl', function ($scope, $ionicModal,$state) {
      //Avant de charger la page home on laisse quelques ms à l'application pour ouvrir la base de donnée
      console.log("Chargement de la bdd");
      setTimeout(function()
      {
          $state.go('home');
      },150);

    });
    // Controller de la page home
    app.controller('HomeCtrl', function ($scope, $ionicModal,ThemesDataService,$http) {
      console.log("vous êtes sur la page home");

      $scope.$on('$ionicView.enter', function(e) {
          ThemesDataService.getAll(function(data){
            //On charge le theme de la base de donnée
            $scope.themes = data;
            console.log(data);
          });
        });
      });

    // Controller de la page question
    app.controller('QstCtrl', function ($scope,$interval,$filter, $ionicModal,$location,$state,ManageScore, $state, $ionicPopover,QuestionsDataService,ReponsesDataService,ngProgressFactory) {

      //Variables
      $scope.count = 0; //Variable pour incrémenter l'id de la question qui doit s'afficher
      $scope.score = ManageScore.init(); //On utilise le service ManageScore pour que le score de l'utilisateur soit accessible de toute les pages
      $scope.isActive = false;
      $scope.rightAnswer = false; //variable pour savoir si l'utilisateur à répondu juste ou faux
      $scope.timeout = false; //variable pour savoir si l'utilisateur n'a pas répondu a temps
      $scope.viewReponse = false; //variable pour n'afficher les 4 propositions qu'aprés 5 secondes de timer

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

      //Timer temps de réponse ****
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
      //***********

      //Timer temps de question ****
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
      //************

      $scope.question = [];
      $scope.question.reponse = [];

      $scope.$on('$ionicView.enter', function(e) {

          $scope.StartTimerQst();
          barQuestion.animate(1);

          setTimeout(function()
          {
            $scope.StartTimer();
            barReponse.animate(1);
            $scope.viewReponse = true;
          },5000);

          QuestionsDataService.getAll(function(data){
          //On rempli nos $scope avec les questions de la base de donnée
          $scope.question = data;
          var size = data.length;
          ManageScore.setTotal(size);
          //On gére le pourcentage de la barre en fonction du nombre de questions (100% divisé par le nombre de question dans notre bdd)
          $scope.pourcentage = 100 / (size);
          $scope.progression = $scope.pourcentage;
          $scope.progressbar = ngProgressFactory.createInstance();
          $scope.progressbar.set($scope.progression);
        })

        ReponsesDataService.getAll(function(data){
        //On rempli nos $scope avec les reponses de la base de donnée
        $scope.question.reponse = data;
      })
    })

      // Fonction qui charge la question suivante en incrémentant un compteur
      $scope.getNextQuestion = function() {
        $scope.toggleInactive();

        if ($scope.count < $scope.question.length - 1)
        {
            $scope.count = $scope.count + 1;
        }

        else
        {
            $location.path("form");
        }

          $scope.closeModal();
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
          //On gere la couleur de fond des explications : rouge si c'est faux ou trop tard, vert ci c'est juste
          var ModalSelect = angular.element(document.getElementById('explication-modal'));
          if ($scope.rightAnswer)
          {
            ModalSelect.addClass('ModalTrue');
            ModalSelect.removeClass('ModalFalse');
          }

          else
          {
            ModalSelect.addClass('ModalFalse');
            ModalSelect.removeClass('ModalTrue');
          }
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

          },5000); // On lance le 2eme timer 5s aprés la fermeture de la question

            $scope.modal.hide().then(function() {
              //On augmente le pourcentage de la barre de progression
              $scope.progression = $scope.progression +$scope.pourcentage;
              $scope.progressbar.set($scope.progression);

              //Si la progression est à 100% on doit faire disparaitre la barre.
              if (parseInt($scope.progression) > 100 )
              {
                  $scope.progressbar.complete();
              }
              //On remet nos booléen à 0 pour tester la prochaine réponse de l'utilisateur
              $scope.timeout = false;
              $scope.rightAnswer = false;
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
        var boutonSelect = angular.element( document.querySelector( '#bouton'+index ) );
        boutonSelect.removeClass('button-dark');
        boutonSelect.addClass('button-energized');
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
          boutonSelect.removeClass('button-energized');

          if ($scope.rightAnswer)
          {
            boutonSelect.addClass('button-balanced');
          }

          else
          {
            boutonSelect.addClass('button-assertive');
          }
        },600);

        //Puis afficher les explications quelques ms plus tard
        setTimeout(function()
        {
          $scope.openModal();

        },1100);

        //Et enfin enlever la couleur du bouton pour qu'il soit gris lorsque la prochaine question sera posée
        setTimeout(function()
        {
          boutonSelect.removeClass('button-balanced');
          boutonSelect.removeClass('button-assertive');
          boutonSelect.addClass('button-dark');
        },2000);
      };
    });

    //Controller de la page wheel
    app.controller('WheelCtrl', function ($scope, $ionicModal,$location,$state) {

        //On utilise Winwheel.js (plugin javascript) pour parametrer une roue
        $scope.spinWheel = new Winwheel({
            'numSegments'    : 8, //Nombre de quartiers => permet de parametrer le nombre de prix
            'lineWidth'   : 1,
            'textFillStyle' : 'white',
            'textFontSize' : 35,
            'innerRadius'     : 20,
            'textAlignment' : 'center',
            'segments'       :
            [
                {'fillStyle' : '#2E2E2E', 'text' : '0'}, // On indique à chaque fois la couleur du quartier et le texte qui s'affichera
                {'fillStyle' : '#903288', 'text' : '20'},
                {'fillStyle' : '#675CA1', 'text' : '200'},
                {'fillStyle' : '#2E2E2E', 'text' : '0'},
                {'fillStyle' : '#019FDC', 'text' : '1000'},
                {'fillStyle' : '#B7D06B', 'text' : '100'},
                {'fillStyle' : '#2E2E2E', 'text' : '0'},
                {'fillStyle' : '#B7D06B', 'text' : '100'},
            ],
            'animation' :
            {
                'type'     : 'spinToStop',
                'duration' : 5, // durée de l'animation => parametre la vitesse de la roue
                'spins'    : 4, //Nombre de tours que va faire la roue
            }
      });

      //on stocke le temps que va mettre la roue à s'arreter
      $scope.time = ($scope.spinWheel.animation.duration) * 1000;

      //Booléen pour savoir si l'utilisateur à déja lancée la roue
      $scope.canSpin = true;

      //Variables pour savoir si l'utilisateur a gagné ou perdu
      $scope.wheelWin = false;
      $scope.wheelLoose = false;

      //Variable qui stockera le prix gagné
      $scope.prize = "";

      //Fonction pour indiquer à l'utilisateur le quartier sur lequel la roue s'est arretée
      function alertPrize()
      {
        // On gere l'affichage rendu à l'utilisateur
        setTimeout(function()
        {
          if (winningSegment.text == 0)
          {
            $scope.wheelLoose = true;
            $state.go('wheelLoose');
          }
          else {
            $scope.wheelWin = true;
            $state.go('wheelWin');
          }
        },500);

        var winningSegment = $scope.spinWheel.getIndicatedSegment();
        var winningSegmentNb = $scope.spinWheel.getIndicatedSegmentNumber();
        var color = $scope.spinWheel.segments[winningSegmentNb].fillStyle;

       // On transforme la couleur des quartiers non gagnant en gris
       for (var x = 1; x < $scope.spinWheel.segments.length; x ++)
       {
           $scope.spinWheel.segments[x].fillStyle = '#34495e';
       }

       $scope.spinWheel.segments[winningSegmentNb].fillStyle = color;

       //On stocke le prix gagné
       $scope.prize =  winningSegment.text +" !";

       //On redessine la roue pour que les changements de couleurs soit pris en compte
       $scope.spinWheel.draw();
      }

      //Fonction pour faire tourner la roue
      $scope.spin = function()
      {
        //Si l'utilisateur n'a pas encore joué on appelle la fonction startAnimation du plugin Winwheel.js
        if($scope.canSpin)
        {
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

    // Controller de la page form
    app.controller('FormCtrl', function ($scope, $ionicModal,$stateParams, $location, $state, ManageScore, $cordovaSQLite, $ionicPlatform,UsersDataService) {

    $scope.score = ManageScore.init();
    $scope.total = ManageScore.getTotal();
    $scope.datas = [];
    $scope.users = [];

      $scope.$on('$ionicView.enter', function(e) {
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
  app.controller('FinCtrl', function ($scope, $ionicModal,$location,$state)
  {
    //Apés 5 secondes on retourne à la page home
    $scope.$on('$ionicView.enter', function(e) {
      setTimeout(function()
      {
        $state.go('home');
        console.log("retour à la page home !")

      },5000);

    })
  });
