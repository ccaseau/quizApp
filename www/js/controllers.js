var app = angular.module('quizApp.controllers', []);

    // Controller de la page home
    app.controller('HomeCtrl', function ($scope, $ionicModal) {

    console.log("vous êtes sur la page home");
    });

    // Controller de la page question
    app.controller('QstCtrl', function ($scope, $ionicModal,$location,$state,ManageScore, $state, $ionicPopover) {
      $scope.question = [
        {
          id: 1,
          path:'img/norvege.png',
          intitule: 'Quel pays n’a pas adhéré à l’Union Européenne ?',
          bonneRep: "Norvege",
          reponse: nom = [
                  "Suede",
                  "Angleterre",
                  "France",
                  "Norvege"
            ],
              explication :"Par deux fois, en 1972 et 1994 et par voie référendaire, le peuple norvégien a refusé l'adhésion du pays à l'Union européenne. La première fois, elle aurait pu adhérer à l'Union en même temps que le Danemark, l'Irlande et le Royaume-Uni, la deuxième fois en même temps que l'Autriche, la Finlande et la Suède. La Norvège est avec l'Islande le seul pays scandinave à ne pas faire partie de l’Union européenne."
        },

        {
          id: 2,
          intitule: "Combien de pays compte l'Union Européenne ?",
          path:'img/europe.png',
          bonneRep: "28 pays",
          reponse: nom = [
                "18 pays",
                "20 pays",
                "28 pays",
                "21 pays"
          ],
          explication :"L'Union européenne compte 28 pays (Etats membres) : l'Allemagne, l'Autriche, la Belgique, la Bulgarie, Chypre, la Croatie, le Danemark, l'Espagne, l'Estonie, la Finlande, la France, la Grèce, la Hongrie, l'Irlande, l'Italie, la Lituanie, la Lettonie, le Luxembourg, Malte, les Pays-Bas, la Pologne, le Portugal, la République tchèque, la Roumanie, le Royaume-Uni, la Slovaquie, la Slovénie et la Suède."
        },
        {
          id: 3,
          intitule: "Quel est le point culminant de l'Europe ?",
          path:'img/elbrouz.png',
          bonneRep: "Elbrouz",
          reponse: nom = [
                "Le Mont Kenya",
                "Elbrouz",
                "Le Mont-Blanc",
                "Les Pyrénées"
          ],
          explication: "L’Elbrouz, ou Elbrous, situé dans le nord du Caucase, en Russie, est le point culminant de cette chaîne de montagnes ; avec ses 5 642 mètres, plus élevé que le mont Blanc, il est donc le plus haut sommet en Europe. Il s'agit d'un volcan ayant connu des éruptions jusqu'au début de notre ère"
        }

      ]

      $scope.count = 0; //Variable pour incrémenter l'id de la question qui doit s'afficher
      $scope.score = ManageScore.init(); //On utilise le service ManageScore pour que le score de l'utilisateur soit accessible de toute les pages
      $scope.isActive = false;
      $scope.rightAnswer = false; //variable pour savoir si l'utilisateur à répondu juste ou faux


      // Fonction qui charge la question suivante en incrémentant un compteur
      $scope.getNextQuestion = function() {
        $scope.toggleInactive();

        if ($scope.count < $scope.question.length - 1){
            $scope.count = $scope.count + 1;
        }

        else {
            $location.path("form");
        }

          $scope.closeModal();

      };

      //Fonction pour les explications

      //On genere notre modal à partir du template explications.html
      $ionicModal.fromTemplateUrl('explications.html', {
        scope: $scope,
        animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.modal = modal;
        });

        //Ouvrir les explications
        $scope.openModal = function() {
          $scope.modal.show();
        };

        //Fermer les explications
        $scope.closeModal = function() {
          $scope.modal.hide();
        };

      // Fonction pour le changement de couleur des boutons
      $scope.toggleActive = function() {
        $scope.isActive = true;
      };

      $scope.toggleInactive = function() {
        $scope.isActive = false;
      };

      // Fonction qui test si la réponse donnée est juste et incrémente le score de l'utilisateur en fonction
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

        //Dans tous les cas on doit changer la couleur des boutons
        $scope.toggleActive();

        //Puis afficher les explications
        setTimeout(function()
        {
          $scope.openModal();

        },300);

      };

    });

    //Controller de la page wheel
    app.controller('WheelCtrl', function ($scope, $ionicModal,$location,$state) {

        //On utilise Winwheel.js (plugin javascript) pour parametrer une roue
        $scope.spinWheel = new Winwheel({
            'numSegments'    : 21, //Nombre de quartiers => permet de parametrer le nombre de prix
            'lineWidth'   : 0.000001,
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
                {'fillStyle' : '#FFCC01', 'text' : '500'},
                {'fillStyle' : '#2E2E2E', 'text' : '0'},
                {'fillStyle' : '#EB7008', 'text' : '300'},
                {'fillStyle' : '#BF1E2E', 'text' : '30'},
                {'fillStyle' : '#2E2E2E', 'text' : '0'},
                {'fillStyle' : '#903288', 'text' : '20'},
                {'fillStyle' : '#675CA1', 'text' : '200'},
                {'fillStyle' : '#2E2E2E', 'text' : '0'},
                {'fillStyle' : '#B7D06B', 'text' : '100'},
                {'fillStyle' : '#FFCC01', 'text' : '500'},
                {'fillStyle' : '#2E2E2E', 'text' : '0'},
                {'fillStyle' : '#EB7008', 'text' : '300'},
                {'fillStyle' : '#BF1E2E', 'text' : '30'},

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

        var winningSegment = $scope.spinWheel.getIndicatedSegment();
        var winningSegmentNb = $scope.spinWheel.getIndicatedSegmentNumber();
        var color = $scope.spinWheel.segments[winningSegmentNb].fillStyle;

        // On gere l'affichage rendu à l'utilisateur (graçe à ng-show) => 'Perdu' si il tombe sur 0, 'Gagné' sinon
        if (winningSegment.text == 0)
        {
          $scope.wheelLoose = true;
        }

        else {
          $scope.wheelWin = true;
        }

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
              $state.reload();//On recharge la page avec le nouvel affichage

            },$scope.time); //$scope.time contient la durée de l'animation

        }
      }

    });

    // Controller de la page form
    app.controller('FormCtrl', function ($scope, $ionicModal,$stateParams, $location, $state, ManageScore, $cordovaSQLite, $ionicPlatform,UsersDataService) {

    $scope.score = ManageScore.init();
    $scope.datas = [];
    $scope.users = [];

    $scope.$on('$ionicView.enter', function(e) {
         UsersDataService.getAll(function(data){
           $scope.datas = data
         })
      })

    $scope.save = function(form_user) {

      console.log(UsersDataService.getByMail($scope.users.mail));

        if (form_user.$valid) {
          //on fait appel au service UsersData
          UsersDataService.createUser($scope.users);
          //On recharge la page
          $state.reload();
        }

    }

      $scope.delete = function(id) {
        //on fait appel au service UsersData
        UsersDataService.deleteUser(id);
        //On recharge la page
        $state.reload();
        }
  })
