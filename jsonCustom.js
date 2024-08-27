/**
 * Acción de código cuya finalidad es demostrar el uso de JSON Custom List en la plataforma. Realiza una request a un mock y toma una cantidad y elementos aleatorios de la respuesta para generar el JSON Custom List. El mismo será utilizado en la intención "JSON Custom List - Ejemplo -> Generación de menú dinámico y selección" cuyo disparador es "ejemplo menú dinámico".
 * 
 * 
 *  - Generación de menú dinámico:
 * 
 *      - Variables de entrada
 *          - Ninguna variable de entrada es necesaria para facilitar su testeo. El único requerimiento es que esta AC se ejecute con el parámetro '{ "action": "menu" }' para la generación del menú.
 * 
 *      - Variables de salida
 *          - El menú se genera exitosamente:
 *              - JSON_CUSTOM_LIST_EXAMPLE_RESULT = MENU_GENERADO
 *              - GENERATED_MENU = JSON Custom List que representa los botones del menú dinámico a mostrar.
 * 
 *          - Ocurrió un error inesperado al generar el menú:
 *              - JSON_CUSTOM_LIST_EXAMPLE_RESULT = ERROR_INESPERADO
 * 
 *  - Selección de un elemento del menú:
 * 
 *    - Variables de entrada
 *      - MENU_SELECTED_OPTION = Representación JSON del botón seleccionado por el usuario.
 *      - Esta AC se debe ejecutar con el parámetro '{ "action": "selection" }' para procesar la selección de un elemento del menú.
 * 
 *    - Variables de salida
 *          - Se selecciona exitosamente un elemento del menú:
 *              - JSON_CUSTOM_LIST_EXAMPLE_RESULT = SELECCION_EXITOSA
 *              - BRANCH_NAME = Nombre de la sucursal seleccionada.
 *              - BRANCH_ADDRESS = Dirección de la sucursal seleccionada.
 *              - BRANCH_COUNTRY = País de la sucursal seleccionada.
 * 
 *          - Ocurrió un error inesperado al procesar la selección:
 *             - JSON_CUSTOM_LIST_EXAMPLE_RESULT = ERROR_INESPERADO
 * 
 * En cualquier escenario, si el parámetro de acción falta:
 *      - JSON_CUSTOM_LIST_EXAMPLE_RESULT = FALTAN_DATOS 
 * 
 */

/*------------------------------------------------------------
        NOMBRES DE VARIABLES DE ENTRADA
------------------------------------------------------------*/
const MENU_SELECTED_OPTION_VAR_NAME = 'MENU_SELECTED_OPTION';
const MENU_ACTION_PARAM_VALUE = 'menu';
const SELECTED_ACTION_PARAM_VALUE = 'selection';
const MENU_ITEMS_LIMIT_VALUE = 10;

/*------------------------------------------------------------
        NOMBRES DE VARIABLES DE SALIDA
------------------------------------------------------------*/
const JSON_CUSTOM_LIST_EXAMPLE_RESULT_VAR_NAME = 'JSON_CUSTOM_LIST_EXAMPLE_RESULT';
const GENERATED_MENU_VAR_NAME = 'GENERATED_MENU';
const BRANCH_NAME_VAR_NAME = 'BRANCH_NAME';
const BRANCH_ADDRESS_VAR_NAME = 'BRANCH_ADDRESS';
const BRANCH_COUNTRY_VAR_NAME = 'BRANCH_COUNTRY';

/*------------------------------------------------------------
        VALORES DE VARIABLES DE ÉXITO
------------------------------------------------------------*/
const MENU_GENERADO_VAR_VALUE = 'MENU_GENERADO';
const SELECCION_EXITOSA_VAR_VALUE = 'SELECCION_EXITOSA';

/*------------------------------------------------------------
        VALORES DE VARIABLES DE SALIDA DE ERROR
------------------------------------------------------------*/
const ERROR_INESPERADO_VAR_VALUE = 'ERROR_INESPERADO';
const FALTAN_DATOS_VAR_VALUE = 'FALTAN_DATOS';

/*------------------------------------------------------------
                AMBIENTES Y CREDENCIALES
------------------------------------------------------------*/
const IS_TEST = user.get('botmakerEnvironment') === 'DEVELOPMENT';
const BASE_URL_DEV = 'https://627303496b04786a09002b27.mockapi.io';
const BASE_URL_PROD = BASE_URL_DEV;
const BASE_URL = IS_TEST ? BASE_URL_DEV : BASE_URL_PROD;


/* ----------------------------------------------------------------
                        MAIN
---------------------------------------------------------------- */

const LOG = require("helper_logging_gcp");
const L = LOG.core({
    botName: "demobleett",
    actionCode: "json_custom_list_example",
    debugEnabled: true,
});

const main = async () => {
    try {
        // Obtenemos el parametro de entrada
        let action = context.params.action;

        if (_.isEmpty(action)) {
            L.error("El parámetro 'action' es requerido.", context.params);
            throw new Error(FALTAN_DATOS_VAR_VALUE);
        }

        action = action.toLowerCase();

        // Chequeamos la acción a realizar
        if (action === MENU_ACTION_PARAM_VALUE) {
            const branches = await getBranches();
            if (_.isEmpty(branches)) { // No suele ser una casuística de error, pero en este caso sí porque siempre esperamos que traiga sucursales.
                L.error(`No branches found: ${branches}`);
                throw new Error(ERROR_INESPERADO_VAR_VALUE);
            }

            const branchesToShowQty = Math.floor(Math.random() * MENU_ITEMS_LIMIT_VALUE) + 1;
            const generatedMenu = generateMenu(3, branches);
            user.set(GENERATED_MENU_VAR_NAME, JSON.stringify(generatedMenu));
            finalizarConExito(MENU_GENERADO_VAR_VALUE, 'Menú generado exitosamente.');
            return;
        }

        if (action === SELECTED_ACTION_PARAM_VALUE) {
            const branchData = parseSelectedOption();
            setBranchData(branchData);
            finalizarConExito(SELECCION_EXITOSA_VAR_VALUE, 'Los datos de la sucursal seleccionada se han guardado correctamente.');
            return;
        }

        // Si no se reconoce la acción, se finaliza con error.
        L.error(`Invalid action param: ${action}`);
        throw new Error(FALTAN_DATOS_VAR_VALUE); // Puede ser ERROR_INESPERADO también
    } catch (error) {
        L.error(`Catched error in main: ${error.message}`);
        chequearTipoDeError(error);
    }
};

/* ----------------------------------------------------------------
                SERVICES
---------------------------------------------------------------- */
const getBranches = async () => {
    const config = {
        method: 'GET',
    }
    const url = `${BASE_URL}/mock/sucursales`;

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const responseText = await response.text();
            L.error(`Error in 'getBranches' service request: ${responseText}`, config);
            throw new Error(ERROR_INESPERADO_VAR_VALUE);
        }

        return await response.json();
    } catch (error) {
        L.error(`Error in 'getBranches' service: ${error.message}`, config);
        throw error;
    }
}


/* ----------------------------------------------------------------
                UTILS
---------------------------------------------------------------- */
const generateMenu = (elemQty, branches) => {
    L.debug(`Generating menu with ${elemQty} elements...`, branches);
    const selectedBranches = [];
    let count = 1;
    while (count <= elemQty) {
        const randomIndex = Math.floor(Math.random() * branches.length);
        const selectedBranch = branches[randomIndex];
        if (!selectedBranches.includes(selectedBranch)) {
            selectedBranches.push(selectedBranch);
            count++;
        }
    }

    L.debug('Branches to show in the menu:', selectedBranches);

    // NOTE: lo importante es setear un JSON que contenga obligatoriamente los campos id y name.
    // Los JSONs no deben ser muy grandes, si se sabe que el servicio devuelve mucha info, probablemente tengamos que aplicar DTO o dividir en variables. 
    // Existe un límite de tamaño para las variables y es de:
    // const MAX_USER_VAR_SIZE = 100 * 1024; // 100 kb
    // Referencia: C:\Users\<user>\AppData\Roaming\npm\node_modules\@botmaker.org\botmaker-cli\src\caRunner.js aprox línea 177

    return selectedBranches.map((branch) => {
        return {
            id: branch.id, // Podría omitirse ya que el objeto ya tiene propiedad id, pero por claridad lo dejamos
            name: branch.nombre.slice(0,20),
            ...branch,
        };
    });
}

const parseSelectedOption = () => {
    const selectedOption = user.get(MENU_SELECTED_OPTION_VAR_NAME);

    if (_.isEmpty(selectedOption)) {
        L.error(`Input variable ${MENU_SELECTED_OPTION_VAR_NAME} is missing or its value is invalid: ${selectedOption}`);
        throw new Error(FALTAN_DATOS_VAR_VALUE);
    }

    try {
        return JSON.parse(selectedOption);
    } catch (error) {
        L.error(`Error while parsing selected option: ${error.message}`, { selectedOption: selectedOption });
    }
}

const setBranchData = (branch) => {
    user.set(BRANCH_NAME_VAR_NAME, branch.nombre);
    user.set(BRANCH_ADDRESS_VAR_NAME, branch.direccion);
    user.set(BRANCH_COUNTRY_VAR_NAME, branch.pais);
}

/* ----------------------------------------------------------------
                FUNCIONES DE CIERRE DE CA
---------------------------------------------------------------- */

const chequearTipoDeError = (error) => {
    let botValue = ERROR_INESPERADO_VAR_VALUE;
    let logValue = "Error inesperado.";

    if (error.message === FALTAN_DATOS_VAR_VALUE) {
        botValue = FALTAN_DATOS_VAR_VALUE;
        logValue = "Faltan datos de entrada.";
    }
    finalizarConError(botValue, `${botValue} | ${logValue}`, error);
};

const finalizarConError = (botValue, logValue) => {
    L.error(logValue);
    user.set(JSON_CUSTOM_LIST_EXAMPLE_RESULT_VAR_NAME, botValue);
};

const finalizarConExito = (botValue, logValue) => {
    L.info(`${botValue} | ${logValue}`);
    user.set(JSON_CUSTOM_LIST_EXAMPLE_RESULT_VAR_NAME, botValue);
};

main()
    .catch((error) =>
        finalizarConError(
            ERROR_INESPERADO_VAR_VALUE,
            error.message || ERROR_INESPERADO_VAR_VALUE,
            error
        )
    )
    .finally(result.done);