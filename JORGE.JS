function retrieveBranchDirection(branches, nameBranch) {
    debugMsg('Executing retrieveBranchDirection function');
    
    const RESULT_VAR_NAME = "GET_DIRECTION_RESULT";
    const SUCCESS_VAR_VALUE = "ONE_DIRECTION";
    const NOT_FOUND_VAR_VALUE = "DIRECTION_NOT_FOUND";
    const ERROR_VAR_VALUE = "ERROR_INESPERADO";

    if (!isEmpty(nameBranch)) {
        const branchInfo = branches.filter(branch => 
            branch.nombre.toLowerCase() === nameBranch.toLowerCase()
        );

        if (!isEmpty(branchInfo)) {
            setBotVar(RESULT_VAR_NAME, SUCCESS_VAR_VALUE);
            setBotVar("directionBranch", branchInfo[0].direccion);
            debugMsg('Branch direction found');
            goNext('success_branches');          
        } else {
            setBotVar(RESULT_VAR_NAME, NOT_FOUND_VAR_VALUE);
            setBotVar("directionBranch", "La sucursal no se encontro.");
            goNext('failure_branches');
        }
    } else {
        setBotVar(RESULT_VAR_NAME, ERROR_VAR_VALUE);
        setBotVar("directionBranch", "El nombre de la sucursal es requerido.");
        debugMsg('Branch name is empty');
        return false;
    }
}