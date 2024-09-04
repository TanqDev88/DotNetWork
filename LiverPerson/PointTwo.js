function getUserDirection(payload, userName){
    if (!isEmpty(userName) && !isEmpty(payload) && Array.isArray(payload)) {
      debugMsg("El nombre del usuario es: "+ userName);
      var userInfo = payload.filter(function(user) {
        return user.nombre.toLowerCase() == userName.toLowerCase(); 
      });
      if (!isEmpty(userInfo)) {
        debugMsg("User direction: " + userInfo[0].direccion);
        setBotVar("userDirection", userInfo[0].direccion);
      }
    }
  }

  function retrieveUserAddress(userPayload, userName) {
    if (!isEmpty(userName) && !isEmpty(userPayload) && Array.isArray(userPayload)) {
        
        debugMsg("Username: " + userName);
        
        var userInfo = userPayload.filter(function(user) {
            return user.nombre.toLowerCase() === userName.toLowerCase(); 
        });
        if (!isEmpty(userInfo)) {
            var userAddress = userInfo[0].direccion;
            debugMsg("User address found: " + userAddress);
            setBotVar("USER_ADDRESS", userAddress); 
        } else {
            debugMsg("User not found");
        }
    } else {
        debugMsg("Invalid input: either userName or userPayload is empty");
    }
}


mi metodo|retrieveBranchDirection
ganga getDirectionBranch

function retrieveBranchDirection(sucursales, nameBranch) {
    debugMsg('corriendo');
    var GET_DIRECTION_RESULT_VAR_NAME = "GET_DIRECTION_RESULT";
    var ONE_DIRECTION_VAR_VALUE = "ONE_DIRECTION";
    var DIRECTION_NOT_FOUND_VAR_VALUE = "DIRECTION_NOT_FOUND";
    var ERROR_INESPERADO_VAR_VALUE = "ERROR_INESPERADO";

    if (!isEmpty(nameBranch)) {
        var direccion = sucursales.filter(function(sucursal) {
            return sucursal.nombre.toLowerCase() === nameBranch.toLowerCase();
        });

        if (!isEmpty(direccion)) {
            setBotVar("GET_DIRECTION_RESULT", ONE_DIRECTION_VAR_VALUE);
            setBotVar("directionBranch", direccion[0].direccion);
            debugMsg('DIREC ENCONTRADA');
            goNext('succes_branches');          
        } else {
            setBotVar("GET_DIRECTION_RESULT", DIRECTION_NOT_FOUND_VAR_VALUE);
            setBotVar("directionBranch", "No se encontró la sucursal.");
            goNext('failure_branches');
        }
    } else {
        setBotVar("GET_DIRECTION_RESULT", ERROR_INESPERADO_VAR_VALUE);
        setBotVar("directionBranch", "El nombre de la sucursal no puede estar vacío.");
        return false;
    }
}


METODO QUE FUNCIONA

function retrieveBranchDirection(sucursales, nameBranch) {
    debugMsg('corriendo');
    var GET_DIRECTION_RESULT_VAR_NAME = "GET_DIRECTION_RESULT";
    var ONE_DIRECTION_VAR_VALUE = "ONE_DIRECTION";
    var DIRECTION_NOT_FOUND_VAR_VALUE = "DIRECTION_NOT_FOUND";
    var ERROR_INESPERADO_VAR_VALUE = "ERROR_INESPERADO";

    if (!isEmpty(nameBranch)) {
        var direccion = sucursales.filter(function(sucursal) {
            return sucursal.nombre.toLowerCase() === nameBranch.toLowerCase();
        });

        if (!isEmpty(direccion)) {
            setBotVar("GET_DIRECTION_RESULT", ONE_DIRECTION_VAR_VALUE);
            setBotVar("directionBranch", direccion[0].direccion);
            debugMsg('DIREC ENCONTRADA');
            goNext('succes_branches');          
        } else {
            setBotVar("GET_DIRECTION_RESULT", DIRECTION_NOT_FOUND_VAR_VALUE);
            setBotVar("directionBranch", "No se encontró la sucursal.");
            goNext('failure_branches');
        }
    } else {
        setBotVar("GET_DIRECTION_RESULT", ERROR_INESPERADO_VAR_VALUE);
        setBotVar("directionBranch", "El nombre de la sucursal no puede estar vacío.");
        return false;
    }
}

SCRIPT DE INTEGRACION QUE FUNCIONA:
var response = JSON.parse(getBotVar("api_retrieveBranchDirection").jsonData).api_retrieveBranchDirection;
var nameBranch = getBotVar("nameBranch");
retrieveBranchDirection(response, nameBranch);
