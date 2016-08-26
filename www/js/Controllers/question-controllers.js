// Controller de la page question
quizAppControllers.controller('QstCtrl', function ($scope,$interval,$filter,$ionicModal,$location,$state,ManageScore, $state, $ionicPopover,QuestionsDataService,ThemesDataService) {
  //Variables
  $scope.count = 0; //Variable pour incrémenter l'id de la question qui doit s'afficher
  $scope.rightAnswer = false; //variable pour savoir si l'utilisateur à répondu juste ou faux
  $scope.timeout = false; //variable pour savoir si l'utilisateur n'a pas répondu a temps
  $scope.viewReponse = false; //variable pour n'afficher les 4 propositions qu'aprés 5 secondes de timer
  $scope.timeQst = TIMEQST;
  $scope.time = TIMEREP;
  
  //Timer pour lire la question
  var barQuestion = new ProgressBar.Line('#barQuestion', {
    from: { color: '#97CE68'},
    to: { color: '#97CE68'},
    duration: $scope.timeQst * 1000,
    strokeWidth: 3.5,
    trailColor: '#818C8E',
    trailWidth: 3.5,
    step: function(state,barQuestion, attachment) {
      barQuestion.path.setAttribute('stroke', state.color);
    },
  });

  //Timer pour répondre à la question
  var barReponse = new ProgressBar.Line('#barReponse', {
    from: { color: '#97CE68'},
    to: { color: '#E3000E'},
    duration: $scope.time*1000,
    strokeWidth: 3.5,
    trailColor: '#818C8E',
    trailWidth: 3.5,
    step: function(state,barReponse, attachment) {
      barReponse.path.setAttribute('stroke', state.color);
    },
  });

  //Barre de progression
  var progressBar = new ProgressBar.Line('#progressBar', {
    from: { color:'#3D8EB9'},
    to: { color: '#3D8EB9'},
    duration: 1000,
    strokeWidth: 5,
    step: function(state,barReponse, attachment) {
      barReponse.path.setAttribute('stroke', state.color);
    },
  });

  //Données à remplir
  $scope.question = [];
  $scope.question.reponse = [];

  //à l'ouverture de la page :
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
    QuestionsDataService.getRandomQuestion(NBQUESTIONS,function(dataQ,dataR){
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
      progressBar.set($scope.progression/100);
      $scope.spacingprogress = (((89*$scope.progression)/100)+1)+"%";
      $scope.spacing = {"margin-left": $scope.spacingprogress};
    })
  })

  //Gestions des timers
  //Timer temps de pour répondre
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
  //Timer temps pour poser la question
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
  // Fonction qui charge la question suivante en incrémentant un compteur
  $scope.getNextQuestion = function() {
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
        $scope.modal.remove();//On detruit la modal
      }
    },250);
  };
  // Fonction qui teste si la réponse donnée est juste et incrémente le score de l'utilisateur en fonction
  $scope.getAnswer = function(chosenAnswer,currentQuest,index) {
    QuestionsDataService.IncrementNbRep(currentQuest.id);
    //On recupere le bouton sur lequel on a cliqué et on le change de couleur
    $scope.color_btn_normal[index]= $scope.color_btn;
    // si la réponse est juste
    if(chosenAnswer == currentQuest.bonneRep)
    {
      $scope.rightAnswer = true;
      if($scope.score < $scope.question.length)
      {
        // On utilise le service ManageScore pour ajouter un point au score de l'utilisateur
        $scope.score =  ManageScore.add();
        QuestionsDataService.IncrementNbRepJuste(currentQuest.id);
      }
    }
    // si la réponse est fausse
    else {
      $scope.rightAnswer = false;
    }
    //Puis changer en vert ou rouge
    setTimeout(function()
    {
      // boutonSelect.removeClass('button-energized')
      //Si c'est faux on change le style du bouton et du fond en rouge (la couleur rouge est stockée dans $scope.false)
      if(!$scope.rightAnswer)
      {
        $scope.color_btn_normal[index]= $scope.false; //[index] nous permet de ne changer le style que du bouton sur lequel on a cliqué et pas celui des 3 autres
        $scope.background_explication = $scope.false;
      }
      //Si on ne répond pas assez vite il faut aussi que le bouton puis le fond soient rouge
      else if ($scope.timeout)
      {
        $scope.color_btn_normal[index]= $scope.false;
        $scope.background_explication = $scope.false;
      }
      //Si c'est juste on change le style du bouton et du fond en vert (la couleur verte est stockée dans $scope.true)
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
        $scope.color_btn_normal[index] = {"background-color": data[0].color_btn_normal};
      });
    },2000);
  };

  //Fonctions pour l'affichage des explications dans une modal popup
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
    $scope.modal.hide()
    //On augmente le pourcentage de la barre de progression
    if($scope.progression < 100)
    {
      $scope.progression = $scope.progression +$scope.pourcentage;
      progressBar.set($scope.progression/100);
      $scope.spacingprogress = (((89*$scope.progression)/100)+1)+"%";
      $scope.spacing = {"margin-left": $scope.spacingprogress};
    }
  };
});
