quizAppControllers.controller('DataCtrl', function ($scope, $ionicModal,$location,$state,$cordovaFile,UsersDataService,StatService,QuestionsDataService)
{
console.log("on est sur la page de visualisation des données");
$scope.$on('$ionicView.enter', function(e) {

  QuestionsDataService.getStatQuestion(function(dataQuest){
    var statQuest = Papa.unparse(dataQuest);
    $cordovaFile.writeFile(cordova.file.externalDataDirectory,"questions.csv",statQuest,true)
      .then(function (success) {
        console.log("Export LOGS QUESTIONS CSV OK!")
        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory +"questions.csv", gotFileQuest,fail);
      }, function (error) {
        console.log("Erreur dans la création du fichier d'export" +error.toString())
      });

  })

  $scope.dataStats = [{
    nombre_joueurs: StatService.getNbJoueurs(),
    nombre_parties_terminées:StatService.getNbParties(),
  }];

  var stats = Papa.unparse($scope.dataStats);
  $cordovaFile.writeFile(cordova.file.externalDataDirectory,"stats.csv",stats,true)
    .then(function (success) {
      console.log("Export STATS CSV OK!")
      window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory +"stats.csv", gotFileStats,fail);
    }, function (error) {
      console.log("Erreur dans la création du fichier d'export" +error.toString())
    });

  //On récuperer les utilisateurs déja en base de donnée
  UsersDataService.getAll(function(data){
    $scope.users = data;

    var csv = Papa.unparse(data);
    $cordovaFile.writeFile(cordova.file.externalDataDirectory,"users.csv",csv,true)
      .then(function (success) {
        console.log("Export utilisateurs CSV OK!")
        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory +"users.csv", gotFileUsers,fail);
      }, function (error) {
        console.log("Erreur dans la création du fichier d'export" +error.toString())
      });
    })


    function gotFileStats(fileEntry) {
      $scope.filePathStats = fileEntry.nativeURL.toString();
      fileEntry.file(function(file) {
        var reader = new FileReader();
        reader.onloadend = function(e) {
            console.log("My data: "+this.result);
        }
        reader.readAsText(file);
      });
    }

    function gotFileQuest(fileEntry) {
      $scope.filePathQuest = fileEntry.nativeURL.toString();
      fileEntry.file(function(file) {
        var reader = new FileReader();
        reader.onloadend = function(e) {
            console.log("My data: "+this.result);
        }
        reader.readAsText(file);
      });
    }

    function gotFileUsers(fileEntry) {
      $scope.filePathUsers = fileEntry.nativeURL.toString();
      fileEntry.file(function(file) {
        var reader = new FileReader();
        reader.onloadend = function(e) {
            console.log("My data: "+this.result);
        }
        reader.readAsText(file);
      });
    }

    function fail(e) {
      console.log("FileSystem Error");
      console.dir(e);
    }
})

  $scope.fin = function()
  {
    $state.go('home');
  }

  $scope.GetDatasUser = function()
  {
    window.plugins.socialsharing.shareViaEmail (
      'Ci joint les données des utilisateurs au format CSV', // can contain HTML tags, but support on Android is rather limited:  http://stackoverflow.com/questions/15136480/how-to-send-html-content-with-image-through-android-default-email-client
      'USER DATA',
      ['ccaseau@viralgames.fr'], // TO: must be null or an array
      null, // CC: must be null or an array
      null, // BCC: must be null or an array
      [$scope.filePathUsers], // FILES: can be null, a string, or an array
      onSuccess, // called when sharing worked, but also when the user cancelled sharing via email. On iOS, the callbacks' boolean result parameter is true when sharing worked, false if cancelled. On Android, this parameter is always true so it can't be used). See section "Notes about the successCallback" below.
      onError // called when sh*t hits the fan
    );
  }

  $scope.GetDatasStat = function()
  {
    window.plugins.socialsharing.shareViaEmail (
      'Ci joint les statistiques au format CSV', // can contain HTML tags, but support on Android is rather limited:  http://stackoverflow.com/questions/15136480/how-to-send-html-content-with-image-through-android-default-email-client
      'STATS DATA',
      ['ccaseau@viralgames.fr'], // TO: must be null or an array
      null, // CC: must be null or an array
      null, // BCC: must be null or an array
      [$scope.filePathStats], // FILES: can be null, a string, or an array
      onSuccess, // called when sharing worked, but also when the user cancelled sharing via email. On iOS, the callbacks' boolean result parameter is true when sharing worked, false if cancelled. On Android, this parameter is always true so it can't be used). See section "Notes about the successCallback" below.
      onError // called when sh*t hits the fan
    );
  }

  $scope.GetDatasQuest = function()
  {
    window.plugins.socialsharing.shareViaEmail (
      'Ci joint les données sur les réponses aux questions au format CSV', // can contain HTML tags, but support on Android is rather limited:  http://stackoverflow.com/questions/15136480/how-to-send-html-content-with-image-through-android-default-email-client
      'RÉPONSE DATA',
      ['ccaseau@viralgames.fr'], // TO: must be null or an array
      null, // CC: must be null or an array
      null, // BCC: must be null or an array
      [$scope.filePathQuest], // FILES: can be null, a string, or an array
      onSuccess, // called when sharing worked, but also when the user cancelled sharing via email. On iOS, the callbacks' boolean result parameter is true when sharing worked, false if cancelled. On Android, this parameter is always true so it can't be used). See section "Notes about the successCallback" below.
      onError // called when sh*t hits the fan
    );
  }
  var onSuccess = function(result) {
    console.log(result); // On Android apps mostly return false even while it's true
  }

  var onError = function(msg) {
    console.log("Sharing failed with message: " + msg);
  }
  });
