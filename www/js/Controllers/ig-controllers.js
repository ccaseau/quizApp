//Controller de la page wheel
quizAppControllers.controller('WheelCtrl', function ($scope, $ionicModal,$location,$state,ThemesDataService,CadeauxDataService,UsersDataService) {

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
    ThemesDataService.getAll(function(data){
      //***********************************Customisation dynamique************************************* //
      $scope.background_img = {"background-image": "url("+data[ThemesDataService.getTheme()].background+")"};
      $scope.text_color = {"color": data[ThemesDataService.getTheme()].color_text};
      $scope.text_font = {"font-family" :data[ThemesDataService.getTheme()].font};
      $scope.color_btn_normal = {"background-color": data[ThemesDataService.getTheme()].color_btn_normal};

    });

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
        UsersDataService.addGainUser($scope.cadeau,UsersDataService.getMail());
      }
    })

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
      'duration' : 3, // durée de l'animation =>3s
      'spins'    : 5, //Nombre de tours que va faire la roue => parametre la vitesse de la rotation
    }
  });


  //on stocke le temps que va mettre la roue à s'arreter
  $scope.time = ($scope.spinWheel.animation.duration) * 1000;


  //Variables pour savoir si l'utilisateur a gagné ou perdu
  $scope.wheelWin = false;
  $scope.wheelLoose = false;

  //Variable qui stockera le prix gagné
  $scope.prize = "";

  //Fonction pour indiquer à l'utilisateur le prix qu'il a gagné en le renvoyant soit sur la page win soit sur la page loose
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
    },800);

    setTimeout(function()
    {
      $scope.spinWheel.stopAnimation(false);
      $scope.spinWheel.rotationAngle = 0;
      $scope.spinWheel.draw();
      $scope.canSpin = true;

    },900);

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

quizAppControllers.controller('WheelWinCtrl', function ($scope, $ionicModal,$state,CadeauxDataService,ThemesDataService) {

  $scope.margeStyleObj = function(objectList) {
    var obj = {};
    objectList.forEach(function(x) {
      angular.extend(obj,x);
    });
    return obj;
  }

  $scope.$on('$ionicView.enter', function(e) {
    ThemesDataService.getAll(function(data){
      //***********************************Customisation dynamique************************************* //
      $scope.background_img = {"background-image": "url("+data[ThemesDataService.getTheme()].background+")"};
      $scope.text_color = {"color": data[ThemesDataService.getTheme()].color_text};
      $scope.text_font = {"font-family" :data[ThemesDataService.getTheme()].font};
      $scope.color_btn_normal = {"background-color": data[ThemesDataService.getTheme()].color_btn_normal};
    });

    var idCadeau = CadeauxDataService.getIdCadeau();

    CadeauxDataService.getInfoCadeau(idCadeau,function(data){
      $scope.cadeau = data;

    })
  });
});

quizAppControllers.controller('WheelLooseCtrl', function ($scope, $ionicModal,$state,ThemesDataService) {

  $scope.margeStyleObj = function(objectList) {
    var obj = {};
    objectList.forEach(function(x) {
      angular.extend(obj,x);
    });
    return obj;
  }

  $scope.$on('$ionicView.enter', function(e) {
    ThemesDataService.getAll(function(data){
      //***********************************Customisation dynamique************************************* //
      $scope.background_img = {"background-image": "url("+data[ThemesDataService.getTheme()].background+")"};
      $scope.text_color = {"color": data[ThemesDataService.getTheme()].color_text};
      $scope.text_font = {"font-family" :data[ThemesDataService.getTheme()].font};
    });

  });

  console.log("perdu");
});
