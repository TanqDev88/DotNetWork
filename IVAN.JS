function getDirectionBranch(sucursales, nameBranch) {
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