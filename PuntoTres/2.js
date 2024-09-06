function retrieveBranchDirection(sucursales, nameBranch) {
    // Mensaje de debug para indicar que la función ha comenzado a ejecutarse
    debugMsg('corriendo');
    
    // Definición de valores constantes que se utilizarán para indicar el resultado
    var ONE_DIRECTION_VAR_VALUE = "ONE_DIRECTION";  // Para indicar que se encontró una dirección
    var DIRECTION_NOT_FOUND_VAR_VALUE = "DIRECTION_NOT_FOUND";  // Para indicar que no se encontró la sucursal
    var ERROR_INESPERADO_VAR_VALUE = "ERROR_INESPERADO";  // Para errores inesperados o entrada vacía

    // Verifica que el nombre de la sucursal no esté vacío
    if (!isEmpty(nameBranch)) {
        // Filtra el array de sucursales para encontrar una que coincida con el nombre proporcionado
        var direccion = sucursales.filter(function(sucursal) {
            return sucursal.nombre.toLowerCase() === nameBranch.toLowerCase();
        });

        // Si se encuentra al menos una coincidencia
        if (!isEmpty(direccion)) {
            // Se establece el resultado como "ONE_DIRECTION" y se guarda la dirección en una variable de bot
            setBotVar("GET_DIRECTION_RESULT", ONE_DIRECTION_VAR_VALUE);
            setBotVar("directionBranch", direccion[0].direccion);
            
            // Mensaje de debug para confirmar que se encontró la dirección
            debugMsg('DIREC ENCONTRADA');
            
            // Llama a la siguiente acción de éxito en el flujo del bot
            goNext('succes_branches');          
        } else {
            // Si no se encuentra la sucursal, establece el resultado como "DIRECTION_NOT_FOUND"
            setBotVar("GET_DIRECTION_RESULT", DIRECTION_NOT_FOUND_VAR_VALUE);
            setBotVar("directionBranch", "Sucursal no encontrada.");
            
            // Llama a la siguiente acción de fallo en el flujo del bot
            goNext('failure_branches');
        }
    } else {
        // Si el nombre de la sucursal está vacío, establece un error inesperado y un mensaje de advertencia
        setBotVar("GET_DIRECTION_RESULT", ERROR_INESPERADO_VAR_VALUE);
        setBotVar("directionBranch", "El nombre de la sucursal es requerido.");
        
        // Retorna false para indicar que la función no pudo ejecutarse correctamente
        return false;
    }
}
//Transform Result Script

var response = JSON.parse(getBotVar("api_retrieveBranchDirection").jsonData).api_retrieveBranchDirection;//Recupera la variable api_retrieve que contiene la respuesta de la API en formato JSON, Pasa la respuesta de la API a formato JSON Y EXTRAE EL array api_retrieveBranch de la respuesta
var nameBranch = getBotVar("nameBranch"); //Obtiene la variable de bot nameBranch, que contiene el nombre de la sucursal que el usuario está buscando.
retrieveBranchDirection(response, nameBranch); //llama ala global function pasando el array de sucursales (response) y nombre de la sucursal(nameBranch)

