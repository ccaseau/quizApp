quizAppControllers.controller('QuizCtrl', function ($scope, $ionicModal,$state,StatService) {

  $scope.newSession = function()
  {
    StatService.addNbJoueurs();
  }

});

quizAppControllers.controller('FirstCtrl', function ($scope, $ionicModal,$state) {
  //Avant de renvoyer vers la page home il faut laisser quelques ms à l'application pour charger la base de donnée
  //si on ouvre directement la page home il y aura des bugs
  console.log("Chargement de la base de donnée");
  setTimeout(function()
  {
    $state.go('home');
  },3000);

});


// Controller de la page home
quizAppControllers.controller('HomeCtrl', function ($scope, $ionicModal,ThemesDataService,$cordovaFileTransfer) {

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
//Controller pour la page Fin
quizAppControllers.controller('FinCtrl', function ($scope, $ionicModal,$location,$state,ThemesDataService,StatService)
{

  $scope.$on('$ionicView.enter', function(e) {
    StatService.addNbParties();
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
