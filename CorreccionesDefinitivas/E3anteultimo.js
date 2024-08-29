/**
 * TODO 1: Actualizar la documentacion LISTO!.
 *  Esta AC realiza la verificación de datos de entrada, consulta un servicio externo para obtener usuarios según el género y
 * genera un menú con las sucursales filtradas, permitiendo la selección de una de ellas.
 *
 *        - Variables de entrada:
 *          - INPUT_GENDER = Género recibido por parte del usuario.
 *          - MENU_SELECTED_OPTION = Opción de menú seleccionada por el usuario.
 *
 *          - Variables de salida de ÉXITO:
 *               1. Se genera exitosamente un menú con los primeros tres usuarios filtrados por género:
 *                  - GENERATED_MENU = Menú generado en formato JSON con las sucursales filtradas. // TODO 1: No esta una variable de exito si no una variable que se va a usar en el menu dinamico

 *               2. Los datos de la sucursal seleccionada se almacenan exitosamente:
 *                  - BRANCH_NAME = Nombre de la sucursal seleccionada.
 *                  - BRANCH_COUNTRY = País de la sucursal seleccionada.
 *                  - BRANCH_ADDRESS = Dirección de la sucursal seleccionada.
 *               3. El menú se generó con éxito:
 *                  - MENU_GENERADO = Indica que el menú se ha generado exitosamente.
 *               4. La selección se realizó con éxito:
 *                  - SELECCION_EXITOSA = Indica que los datos de la sucursal seleccionada se han guardado correctamente.
 *
 *          - Variables de salida de ERROR:
 *             1. Se produjo un error inesperado en el código:
 *                - ERROR_INESPERADO = Error inesperado en el sistema. //TODO 2: modificar esta variable por - JORGE_EJERCICIO_3_ERROR_INESPERADO = Error inesperado en el sistema.
 *
 *             2. Faltan datos de entrada:
 *                - FALTAN_DATOS = Falta alguno de los datos requeridos (género o acción).
 *
 */

/*------------------------------------------------------------
        NOMBRES DE VARIABLES DE ENTRADA
------------------------------------------------------------*/
const INPUT_GENDER = 'GENERO';
const MENU_SELECTED_OPTION = 'MENU_SELECTED_OPTION';
const MENU_ACTION_PARAM_VALUE = 'menu';
const SELECTION_ACTION_PARAM_VALUE = 'selection';
const MENU_ITEMS_LIMIT = 3;

/*------------------------------------------------------------
        NOMBRES DE VARIABLES DE SALIDA
------------------------------------------------------------*/
// TODO 3: sumar variable de resultado, como en el ejercicio 2 utilizando "RESULT_VAR_NAME"
const BRANCH_NAME = 'BRANCH_NAME';
const BRANCH_ADDRESS = 'BRANCH_ADDRESS';
const BRANCH_COUNTRY = 'BRANCH_COUNTRY';
const OUTPUT_RESULT = 'OUTPUT_RESULT'; 
const GENERATED_MENU = 'GENERATED_MENU';

/*------------------------------------------------------------
        VALORES DE VARIABLES DE ÉXITO
------------------------------------------------------------*/
const MENU_GENERADO = 'MENU_GENERADO';
const SELECCION_EXITOSA = 'SELECCION_EXITOSA';

/*------------------------------------------------------------
        VALORES DE VARIABLES DE SALIDA DE ERROR
------------------------------------------------------------*/
const ERROR_INESPERADO = 'ERROR_INESPERADO';
const FALTAN_DATOS = 'FALTAN_DATOS';

/* ----------------------------------------------------------------
                        CREDENCIALES
---------------------------------------------------------------- */
const API_URL = 'https://627303496b04786a09002b27.mockapi.io/mock/sucursales';

/* ----------------------------------------------------------------
                        MAIN
---------------------------------------------------------------- */
const LOG = require('helper_logging_gcp');
const logger = LOG.core({
    botName: 'demobleett',
    actionCode: 'get_by_gender',
    debugEnabled: true,
});

const main = async () => {
    try {
        logger.info('Inicia la AC obtener dirección del usuario');
        const verifiedGender = verifyEntryData();
        const gender = mapGender(verifiedGender);

        let action = context.params.action;

        if (_.isEmpty(action)) {
            logger.error("El parámetro 'action' es requerido.", context.params);
            throw new Error(FALTAN_DATOS);
        }

        action = action.toLowerCase();

        if (action === MENU_ACTION_PARAM_VALUE) {
            const users = await getUsersByGender(gender);
            if (_.isEmpty(users)) {
                logger.error(No branches found: ${users});
                throw new Error(ERROR_INESPERADO);
            }

            const generatedMenu = generateMenu(users);
            user.set(GENERATED_MENU, JSON.stringify(generatedMenu));
            finalizeWithSuccess(MENU_GENERADO, 'Menú generado exitosamente.');
            return;
        }

        if (action === SELECTION_ACTION_PARAM_VALUE) {
            const branchData = parseSelectedOption();
            setBranchData(branchData);
            finalizeWithSuccess(SELECCION_EXITOSA, 'Los datos del usuario se han guardado correctamente.');
            return;
        }

        logger.error(Invalid action param: ${action});
        throw new Error(FALTAN_DATOS);
    } catch (error) {
        logger.error(error);
        checkErrorType(error);
    }
};

/*------------------------------------------------------------
                        SERVICE
------------------------------------------------------------*/

const getUsersByGender = async (gender) => {
    const config = {
        method: 'GET',
    };

    try {
        const response = await fetch(API_URL, config);

        if (!response.ok) {
            const responseText = await response.text();
            logger.error(Error in 'getBranches' service request: ${responseText}, config);
            throw new Error(ERROR_INESPERADO);
        }

        const data = await response.json();
        const filteredByGender = data.filter((user) => user.genero.toLowerCase() === gender.toLowerCase());
        const firstThree = filteredByGender.slice(0, 3);

        return firstThree;
    } catch (error) {
        logger.error(Error in 'getUsersByGender' service: ${error.message}, config);
        throw error;
    }
};

/*------------------------------------------------------------
                        UTILS
------------------------------------------------------------*/
const generateMenu = (branches) => {
    logger.debug('Generating menu with 3 elements...', branches);
    const selectedBranches = branches.slice(0, MENU_ITEMS_LIMIT);

    logger.debug('Branches to show in the menu:', selectedBranches);

    return selectedBranches.map((branch) => {
        return {
            id: branch.id,
            name: branch.nombre,
            ...branch,
        };
    });
};

const parseSelectedOption = () => {
    const selectedOption = user.get(MENU_SELECTED_OPTION);
    if (_.isEmpty(selectedOption)) {
        logger.error(Input variable ${MENU_SELECTED_OPTION} is missing or its value is invalid: ${selectedOption});
        throw new Error(FALTAN_DATOS);
    }

    try {
        return JSON.parse(selectedOption);
    } catch (error) {
        logger.error(Error while parsing selected option: ${error.message}, { selectedOption });
    }
};

const setBranchData = (branch) => {
    user.set(BRANCH_NAME, branch.nombre);
    user.set(BRANCH_ADDRESS, branch.direccion);
    user.set(BRANCH_COUNTRY, branch.pais);
};

const verifyEntryData = () => {
    const gender = user.get(INPUT_GENDER);
    if (_.isEmpty(gender)) {
        throwInternalErrorWithCustomLog(FALTAN_DATOS, 'Falta el género', {
            gender,
        });
    }

    return gender;
};

const mapGender = (gender) => {
    const genderMap = {
        Hombre: 'male',
        Mujer: 'female',
    };

    return genderMap[gender] || null;
};

/* ----------------------------------------------------------------
                FUNCIONES DE CIERRE DE AC
---------------------------------------------------------------- */
const finalizeWithSuccess = (successCode, logMessage) => {
    logger.info(${successCode} | ${logMessage});
    user.set(OUTPUT_RESULT, successCode);
};

const finalizeWithError = (errorCode) => {
    user.set(errorCode, errorCode);
};

const handleErrorType = (error) => {
    let errorCode = ERROR_INESPERADO;
    let logMessage = 'Error inesperado.';

    if (error.message === FALTAN_DATOS) {
        errorCode = FALTAN_DATOS;
        logMessage = 'Faltan datos de entrada.';
    }
    finalizeWithError(errorCode, ${errorCode} | ${logMessage}, error);
};

const throwCustomInternalError = (errorMessage, logDetails, additionalInfo) => {
    logger.error(logDetails, additionalInfo);
    throw new Error(errorMessage);
};

main()
    .catch((error) => finalizeWithError(ERROR_INESPERADO, error.message || ERROR_INESPERADO, error))
    .finally(result.done);
