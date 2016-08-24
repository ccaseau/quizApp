// Controller de la page form
quizAppControllers.controller('FormCtrl', function ($scope, $ionicModal,$stateParams, $location, $state, ManageScore, $cordovaSQLite, $ionicPlatform,UsersDataService,ThemesDataService) {

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

  var now = new Date();
  var annee   = now.getFullYear();
  var mois    = ('0'+(now.getMonth()+1)).slice(-2);
  var jour    = ('0'+now.getDate()   ).slice(-2);
  var heure   = ('0'+now.getHours()  ).slice(-2);
  var minute  = ('0'+now.getMinutes()).slice(-2);
  var seconde = ('0'+now.getSeconds()).slice(-2);
  var date_fin_quiz = annee+"-"+mois+"-"+jour+" "+heure+":"+minute+":"+seconde;

  $scope.users.score = ManageScore.init();
  $scope.users.date = date_fin_quiz;
  $scope.users.temps = '05:25';
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
    UsersDataService.setMail($scope.users.mail);
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
