/**
 *  Esta AC realiza la verificación de datos de entrada, consulta un servicio externo para obtener usuarios según el género y
 * genera un menú con las sucursales filtradas, permitiendo la selección de una de ellas.
 *
 *        - Variables de entrada:
 *          - INPUT_USER_GENDER = Género recibido por parte del usuario.
 *          - INPUT_MENU_OPTION_VAR_NAME = Opción de menú seleccionada por el usuario.
 *
 *          - Variables de salida de ÉXITO:
 *               1. Se genera exitosamente un menú con los primeros tres usuarios filtrados por género:
 *                  - OUTPUT_GENERATE_MENU_VAR_NAME = Menú generado en formato JSON con las sucursales filtradas. (Variable intermedia para generar el menú dinámico)
 *                  - JORGE_E3_RESULT_VAR_NAME = MENU_CREATION_SUCCESS_VAR_VALUE
 *
 *               2. Los datos de la sucursal seleccionada se almacenan exitosamente:
 *                  - EJERCICIO3_NAME_VAR_NAME = Nombre de la sucursal seleccionada.
 *                  - EJERCICIO3_COUNTRY_VAR_NAME = País de la sucursal seleccionada.
 *                  - EJERCICIO3_ADDRESS_VAR_NAME = Dirección de la sucursal seleccionada.
 *                  - JORGE_E3_RESULT_VAR_NAME = BRANCH_SELECTION_SUCCESS_VAR_VALUE
 *
 *           - Variables de salida de ERROR:
 *              1. Se produjo un error inesperado en el código:
 *                  - JORGE_E3_RESULT_VAR_NAME = UNEXPECTED_ERROR_VAR_VALUE
 *
 *              2. Faltan datos de entrada:
 *                  - JORGE_E3_RESULT_VAR_NAME = MISSING_REQUIRED_DATA_VAR_VALUE
 */
/*------------------------------------------------------------
        NOMBRES DE VARIABLES DE ENTRADA
------------------------------------------------------------*/
const INPUT_USER_GENDER = 'GENERO';
const INPUT_MENU_OPTION_VAR_NAME = 'INPUT_MENU_OPTION';
const MENU_ACTION_PARAM_VALUE = 'menu';
const SELECTED_ACTION_PARAM_VALUE = 'selection';
const MENU_ITEMS_LIMIT_VALUE = 3;

/* 
/*------------------------------------------------------------
        NOMBRES DE VARIABLES DE SALIDA
------------------------------------------------------------*/
const EJERCICIO3_NAME_VAR_NAME = 'EJE3_USER_NAME';
const EJERCICIO3_ADDRESS_VAR_NAME = 'EJE3_USER_ADDRESS';
const EJERCICIO3_COUNTRY_VAR_NAME = 'EJE3_USER_COUNTRY';
const JORGE_E3_RESULT_VAR_NAME = 'JORGE_E3_RESULT';
const OUTPUT_GENERATE_MENU_VAR_NAME = 'OUTPUT_GENERATE_MENU';

/*------------------------------------------------------------
        VALORES DE VARIABLES DE ÉXITO
------------------------------------------------------------*/
const MENU_CREATION_SUCCESS_VAR_VALUE = 'MENU_CREATION_SUCCESS';
const BRANCH_SELECTION_SUCCESS_VAR_VALUE = 'BRANCH_SELECTION_SUCCESS';

/*------------------------------------------------------------
        VALORES DE VARIABLES DE SALIDA DE ERROR
------------------------------------------------------------*/
const UNEXPECTED_ERROR_VAR_VALUE = 'UNEXPECTED_ERROR';
const MISSING_REQUIRED_DATA_VAR_VALUE = 'MISSING_REQUIRED_DATA';

/* ----------------------------------------------------------------
                        VARIABES DE ENTORNO
---------------------------------------------------------------- */
const APIURL = 'https://europe-central2-demobleett.cloudfunctions.net/TestJorgefunction2';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MjQ5NTQ4MTJ9.XfbLn6kmQp2Kf6ANsz5xJRJpnVXkdOtlGOLAAwU5rcs';

/* ----------------------------------------------------------------
                        MAIN
---------------------------------------------------------------- */
const LOG = require('helper_logging_gcp');
const L = LOG.core({
    botName: 'demobleett',
    actionCode: 'test_codigo_jorge',
    debugEnabled: true,
});

const main = async () => {
    try {
        L.info('Inicia la AC obtener dirección del usuario');
        const verifiedData = verifyEntryData();
        const genero = mapGender(verifiedData);

        let action = context.params.action;

        if (_.isEmpty(action)) {
            L.error("El parámetro 'action' es requerido.", context.params);
            throw new Error(MISSING_REQUIRED_DATA_VAR_VALUE);
        }

        action = action.toLowerCase();

        if (action === MENU_ACTION_PARAM_VALUE) {
            const users = await getUsersbyGender(genero);
            if (_.isEmpty(users)) {
                L.error(`No branches found: ${users}`);
                throw new Error(UNEXPECTED_ERROR_VAR_VALUE);
            }

            const generatedMenu = generateMenu(users);
            user.set(OUTPUT_GENERATE_MENU_VAR_NAME, JSON.stringify(generatedMenu));
            finalizarConExito(MENU_CREATION_SUCCESS_VAR_VALUE, 'Menú generado exitosamente.');
            return;
        }

        if (action === SELECTED_ACTION_PARAM_VALUE) {
            const branchData = parseSelectedOption();
            setBranchData(branchData);
            finalizarConExito(BRANCH_SELECTION_SUCCESS_VAR_VALUE, 'Los datos del usuario se han guardado correctamente.');
            return;
        }

        L.error(`Invalid action param: ${action}`);
        throw new Error(MISSING_REQUIRED_DATA_VAR_VALUE);
    } catch (error) {
        L.error(error);
        chequearTipoDeError(error);
    }
};
/*------------------------------------------------------------
                        SERVICE
------------------------------------------------------------*/

const getUsersbyGender = async (genero) => {
    const config = {
        method: 'GET',
        headers: {
            'x-token': TOKEN,
        },
    };

    try {
        const response = await fetch(APIURL, config);

        if (!response.ok) {
            const responseText = await response.text();
            L.error(`Error en la solicitud del servicio 'getUsersbyGender': ${responseText}`, config);
            throw new Error(UNEXPECTED_ERROR_VAR_VALUE);
        }

        const datos = await response.json();
        const usuariosFiltrados = filtrarUsuariosPorGenero(datos, genero);
        return obtenerPrimerosTresUsuarios(usuariosFiltrados);
        
    } catch (error) {
        L.error(`Error en el servicio 'getUsersbyGender': ${error.message}`, config);
        throw error;
    }
};

const filtrarUsuariosPorGenero = (usuarios, genero) => {
    return usuarios.filter((usuario) => usuario.genero.toLowerCase() === genero.toLowerCase());
};

const obtenerPrimerosTresUsuarios = (usuarios) => {
    return usuarios.slice(0, 3);
};

/*------------------------------------------------------------
                        UTILS
------------------------------------------------------------*/
const generateMenu = (branches) => {
    L.debug('Generando menú con un máximo de 3 elementos...', branches);
    const branchesSeleccionadas = seleccionarBranches(branches);
    L.debug('Branches seleccionadas para mostrar en el menú:', branchesSeleccionadas);
    return transformarBranchesEnOpciones(branchesSeleccionadas);
};

const parseSelectedOption = () => {
    const opcionSeleccionada = obtenerOpcionSeleccionada();
    return parsearOpcion(opcionSeleccionada);
};

const setBranchData = (branch) => {
    user.set(EJERCICIO3_NAME_VAR_NAME, branch.nombre);
    user.set(EJERCICIO3_ADDRESS_VAR_NAME, branch.direccion);
    user.set(EJERCICIO3_COUNTRY_VAR_NAME, branch.pais);
};

const verifyEntryData = () => {
    const genero = user.get(INPUT_USER_GENDER);
    if (_.isEmpty(genero)) {
        throwInternalErrorWithCustomLog(MISSING_REQUIRED_DATA_VAR_VALUE, 'Falta el genero', { genero });
    }
    return genero;
};

const mapGender = (genero) => {
    const genderMap = {
        Hombre: 'male',
        Mujer: 'female',
    };
    return genderMap[genero] || null;
};

const seleccionarBranches = (branches) => {
    return branches.slice(0, MENU_ITEMS_LIMIT_VALUE);
};

const transformarBranchesEnOpciones = (branches) => {
    return branches.map((branch) => ({
        id: branch.id,
        name: branch.nombre,
        ...branch,
    }));
};

const obtenerOpcionSeleccionada = () => {
    const selectedOption = user.get(INPUT_MENU_OPTION_VAR_NAME);
    if (_.isEmpty(selectedOption)) {
        L.error(`Variable de entrada ${INPUT_MENU_OPTION_VAR_NAME} está ausente o su valor es inválido: ${selectedOption}`);
        throw new Error(MISSING_REQUIRED_DATA_VAR_VALUE);
    }
    return selectedOption;
};

const parsearOpcion = (opcionSeleccionada) => {
    try {
        return JSON.parse(opcionSeleccionada);
    } catch (error) {
        L.error(`Error al parsear la opción seleccionada: ${error.message}`, { opcionSeleccionada });
        throw error;
    }
};

/* ----------------------------------------------------------------
                FUNCIONES DE CIERRE DE CA
---------------------------------------------------------------- */
const throwInternalErrorWithCustomLog = (errorMsg, logValue, extraPayload) => {
    L.error(logValue, extraPayload);
    throw new Error(errorMsg);
};

const chequearTipoDeError = (error) => {
    let botValue = UNEXPECTED_ERROR_VAR_VALUE;
    let logValue = 'Error inesperado.';

    if (error.message === MISSING_REQUIRED_DATA_VAR_VALUE) {
        botValue = MISSING_REQUIRED_DATA_VAR_VALUE;
        logValue = 'datos de entrada faltantes.';
    }
    finalizarConError(botValue, `${botValue} | ${logValue}`, error);
};

const finalizarConError = (botValue) => {
    user.set(JORGE_E3_RESULT_VAR_NAME, botValue);
};

const finalizarConExito = (botValue, logValue) => {
    L.info(`${botValue} | ${logValue}`);
    user.set(JORGE_E3_RESULT_VAR_NAME, botValue);
};

main()
    .catch((error) => finalizarConError(UNEXPECTED_ERROR_VAR_VALUE, error.message || UNEXPECTED_ERROR_VAR_VALUE, error))
    .finally(result.done);
