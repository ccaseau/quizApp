//Controller pour l'instant gagnant
quizAppControllers.controller('WheelCtrl', function ($scope, $ionicModal,$location,$state,CadeauxDataService,UsersDataService) {
  //Variables
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
    $scope.canSpin = true;
    CadeauxDataService.getCadeau(date,date2,function(data){
      console.log(data);
      //On tire un nombre aléatoire entre 0 et 100
      var randomNb = Math.floor((Math.random() * 100) + 1);
      console.log(randomNb);
      console.log(data[0].Chances);
      if (randomNb > data[0].Chances)
      {
        $scope.cadeau = 'Perdu';
        UsersDataService.addGainUser('Perdu',UsersDataService.getMail());
      }
      else
      {
        $scope.cadeau = data[0].CodeCadeau;
        CadeauxDataService.SubstrQuantite(data[0].id);
        CadeauxDataService.setIdCadeau(data[0].id);
        CadeauxDataService.AddDateGain(data[0].id,date);
        UsersDataService.addGainUser($scope.cadeau,UsersDataService.getMail());
      }
    })
  });
  //On utilise Winwheel.js (plugin javascript) pour parametrer une roue
  //On charge l'image de la roue qui sera utilisée
  var loadedImg = new Image();
  loadedImg.onload = function()
  {
    $scope.wheel.wheelImage = loadedImg;
    $scope.wheel.draw();//dés que l'image est disponible on peut la dessiner
  }
  loadedImg.src = CREA_WHEEL;
  $scope.wheel = new Winwheel({
    //L'image utilisée doit mesurer 350*350, être en .png avec fond transparent
    'drawMode' : 'image',
    'animation' :
    {
      'type'     : 'spinToStop',
      'duration' : 3, //durée de l'animation =>3s
      'spins'    : 5, //Nombre de tours que va faire la roue => parametre la vitesse de la rotation
    }
  });
  //on stocke le temps que va mettre la roue à s'arreter
  $scope.time = ($scope.wheel.animation.duration) * 1000;
  //Variables pour savoir si l'utilisateur a gagné ou perdu
  $scope.wheelWin = false;
  $scope.wheelLoose = false;
  //Variable qui stockera le prix gagné
  $scope.prize = "";
  //Fonction pour indiquer à l'utilisateur le prix qu'il a gagné en le renvoyant soit sur la page win soit sur la page loose
  function alertPrize()
  {
    // On gere l'affichage rendu à l'utilisateur
    var winningSegment = $scope.wheel.getIndicatedSegment();
    setTimeout(function()
    {
      if (winningSegment.text == 'Perdu')
      {
        $state.go('wheelLoose');
      }
      else {
        $state.go('wheelWin');
      }
    },800);
    setTimeout(function()
    {
      $scope.wheel.stopAnimation(false);
      $scope.wheel.rotationAngle = 0;
      $scope.wheel.draw();
      $scope.canSpin = true;
    },900);

  }
  //Fonction pour faire tourner la roue
  $scope.spin = function()
  {
    //Si l'utilisateur n'a pas encore joué on appelle la fonction startAnimation du plugin Winwheel.js
    if($scope.canSpin)
    {
      $scope.wheel.animation.stopAngle = TABANGLE[$scope.cadeau];
      $scope.wheel.startAnimation()
      $scope.canSpin = false;
      //Une fois l'animation terminée on appelle notre fonction alertPrize()
      setTimeout(function()
      {
        alertPrize();

      },$scope.time); //$scope.time contient la durée de l'animation. On veut que le prix soit indiqué une fois la roue arretée !
    }
  }

});

quizAppControllers.controller('WheelWinCtrl', function ($scope, $ionicModal,$state,CadeauxDataService) {
  $scope.margeStyleObj = function(objectList) {
    var obj = {};
    objectList.forEach(function(x) {
      angular.extend(obj,x);
    });
    return obj;
  }
  var idCadeau = CadeauxDataService.getIdCadeau();
  CadeauxDataService.getInfoCadeau(idCadeau,function(data){
    $scope.cadeau = data;
  })
});

quizAppControllers.controller('WheelLooseCtrl', function ($scope, $ionicModal,$state) {
  $scope.margeStyleObj = function(objectList) {
    var obj = {};
    objectList.forEach(function(x) {
      angular.extend(obj,x);
    });
    return obj;
  }
  console.log("perdu");
});
