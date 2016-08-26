//Controller général de l'application
quizAppControllers.controller('QuizCtrl', function ($scope, $ionicModal,$state,StatService,ThemesDataService) {
  $scope.$on('$ionicView.enter', function(e) {

    ThemesDataService.getAll(function(data){
      //Customisation avec les données de la base
      $scope.background_img = {"background-image": "url("+data[0].background+")"};
      $scope.text_color = {"color": data[0].color_text};
      $scope.text_font = {"font-family" :data[0].font};
      $scope.color_btn = {"background-color": data[0].color_btn};
      $scope.background_explication = {"background-color": data[0].color_false};
      $scope.true = {"background-color": data[0].color_right};
      $scope.false = {"background-color": data[0].color_false};
      $scope.color_btn_normal = [{"background-color": data[0].color_btn_normal},{"background-color": data[0].color_btn_normal},{"background-color": data[0].color_btn_normal},{"background-color": data[0].color_btn_normal}];
      $scope.color_bar = {"color": data[0].color_bar};
    });
  });
  $scope.margeStyleObj = function(objectList) {
    var obj = {};
    objectList.forEach(function(x) {
      angular.extend(obj,x);
    });
    return obj;
  }
  //Incrémente de 1 à chaque nouvelle session (clique sur "participer")
  $scope.newSession = function()
  {
    StatService.addNbJoueurs();

    if(GO_IG)
    {
      $state.go('wheel');
    }
    else {
      $state.go('question');
    }
  }
});

//Controller de la page de login
app.controller('LoginCtrl', function($scope,$state,$timeout) {
  $scope.data =[];
  $scope.wrong = false;
  $scope.login = function()
  {
    if($scope.data.mdp == ADMIN_PASS)
    {
      $state.go('data')
      $scope.wrong = false;
      $scope.data.mdp = '';
      $scope.loginForm.$setPristine();
    }
    else {
      $scope.wrong = true;
    }
  }
});

//Controller de la page load
quizAppControllers.controller('LoadCtrl', function ($scope, $ionicModal,$state) {
  //Avant de renvoyer vers la page home il faut laisser quelques ms à l'application pour charger la base de donnée
  //si on ouvre directement la page home il y aura des bugs
  console.log("Chargement de la base de donnée");
  setTimeout(function()
  {
    $state.go('home');
  },3000);
});

//Controller pour la derniere pas
quizAppControllers.controller('FinCtrl', function ($scope, $ionicModal,$location,$state,StatService)
{
  $scope.$on('$ionicView.enter', function(e) {
    //Incrémente de 1 le nombre de parties terminées
    StatService.addNbParties();
  });

  //Les liens des partenaires en local pour l'instant (csv?)
  $scope.links =[
    {
      addr:'www.univ-tlse3.fr'
    },
    {
      addr:'www.univ-paul-sabbatier.fr'
    },
    {
      addr:'www.rectorat-tls.fr'
    }]
    //Aprés 5 secondes on retourne à la page home
    $scope.$on('$ionicView.enter', function(e) {
      setTimeout(function()
      {
        $state.go('home');
      },5000);
    })
  });
