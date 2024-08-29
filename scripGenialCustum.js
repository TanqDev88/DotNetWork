/**
 *  Esta AC realiza la verificación de datos de entrada, consulta un servicio externo para obtener usuarios según el género y
 * extrae los nombres de los tres primeros usuarios.
 *
 *        - Variables de entrada:
 *          - GENERO = Género recibido por parte del usuario.
 *          - NOMBRE_SELECCIONADO = Nombre del usuario recibido para búsqueda.
 *
 *          - Variables de salida de EXITO:
 *               1. Se obtienen exitosamente los nombres de los primeros tres usuarios filtrados por género:
 *                  - NAME_1 = Nombre del primer usuario.
 *                  - NAME_2 = Nombre del segundo usuario.
 *                  - NAME_3 = Nombre del tercer usuario.
 *               2. Se obtiene exitosamente la información detallada del usuario:
 *                  - USER_NAME = Nombre del usuario encontrado.
 *                  - USER_COUNTRY = País del usuario encontrado.
 *                  - USER_ADDRESS = Dirección del usuario encontrado.
 *               3. El usuario no fue encontrado:
 *                  - USER_NOT_FOUND = Indica que no se encontró el usuario buscado.
 *
 *          - Variables de salida de ERROR:
 *             1. Se produjo un error inesperado en el código:
 *                - ERROR_INESPERADO = Error inesperado en el sistema.
 *
 *             2. Faltan datos de entrada:
 *                - FALTAN_DATOS = Falta alguno de los datos requeridos (género o nombre).
 *
 */

/*------------------------------------------------------------
        NOMBRES DE VARIABLES DE ENTRADA
------------------------------------------------------------*/
const GENERO_VAR_NAME = 'GENERO';
const NOMBRE_SELECCIONADO_VAR_NAME = 'NOMBRE_SELECCIONADO';

/*------------------------------------------------------------
        NOMBRES DE VARIABLES DE SALIDA
------------------------------------------------------------*/
const USUARIO_NO_ENCONTRADO_VAR_NAME = 'USER_NOT_FOUND';
const NAME_1_VAR_NAME = 'NAME_1';
const NAME_2_VAR_NAME = 'NAME_2';
const NAME_3_VAR_NAME = 'NAME_3';
const USER_NAME_VAR_NAME = 'USER_NAME';
const USER_COUNTRY_VAR_NAME = 'USER_COUNTRY';
const USER_ADDRESS_VAR_NAME = 'USER_ADDRESS';

/*------------------------------------------------------------
        VALORES DE VARIABLES DE SALIDA DE ERROR
------------------------------------------------------------*/
const ERROR_INESPERADO_VAR_VALUE = 'ERROR_INESPERADO';
const DATOS_FALTANTES_VAR_VALUE = 'FALTAN_DATOS';

/* ----------------------------------------------------------------
                        CREDENCIALES
---------------------------------------------------------------- */
const IS_TEST = user.get('botmakerEnvironment') === 'DEVELOPMENT';
const BASE_URL_DEV = 'https://627303496b04786a09002b27.mockapi.io';
const BASE_URL_PROD = BASE_URL_DEV; // Ajustar si hay una URL diferente para producción
const BASE_URL = IS_TEST ? BASE_URL_DEV : BASE_URL_PROD;
const API_URL = `${BASE_URL}/mock/sucursales`;

/* ----------------------------------------------------------------
                        MAIN
---------------------------------------------------------------- */
const LOG = require('helper_logging_gcp');
const L = LOG.core({
    botName: 'demobleett',
    actionCode: 'test_jorge_ejercicio3',
    debugEnabled: true,
});

const main = async () => {
    try {
        L.info('Inicia la AC obtener dirección del usuario');
        const { genero, userName } = validateInputData();

        const allData = await fetchUsersByGender(genero);
        await extractNames(allData);

        if (userName) {
            const userInfo = await fetchUserInfoByName(userName, allData);
            completeWithSuccess(USER_COUNTRY_VAR_NAME, userInfo.pais);
            completeWithSuccess(USER_ADDRESS_VAR_NAME, userInfo.direccion);
            completeWithSuccess(USER_NAME_VAR_NAME, userInfo.nombre);
        }
    } catch (error) {
        L.error(`Error en main: ${error.message}`);
        handleUnexpectedError(error);
    }
};

/*------------------------------------------------------------
                        SERVICES
------------------------------------------------------------*/
const fetchUsersByGender = async (genero) => {
    const config = {
        method: 'GET',
    };

    try {
        const response = await fetch(API_URL, config);

        if (!response.ok) {
            const responseText = await response.text();
            L.error(`Error en la solicitud de 'fetchUsersByGender': ${responseText}`, config);
            throw new Error(ERROR_INESPERADO_VAR_VALUE);
        }

        const data = await response.json();
        const filteredByGender = data.filter((user) => user.genero.toLowerCase() === genero.toLowerCase());

        if (_.isEmpty(filteredByGender)) {
            L.error('No se encontraron usuarios para el género seleccionado', { genero });
            throw new Error(USUARIO_NO_ENCONTRADO_VAR_NAME);
        }

        return filteredByGender;
    } catch (error) {
        L.error('Error en "fetchUsersByGender"', { message: error.message });
        throw error;
    }
};

const fetchUserInfoByName = async (name, users) => {
    try {
        const user = users.find((user) => user.nombre === name);

        if (!user) {
            completeWithSuccess(USUARIO_NO_ENCONTRADO_VAR_NAME, 'USER_NOT_FOUND');
            throw new Error('Usuario no encontrado');
        }

        return {
            nombre: user.nombre,
            pais: user.pais,
            direccion: user.direccion,
        };
    } catch (error) {
        L.error('Error en "fetchUserInfoByName"', { message: error.message });
        throw error;
    }
};

/*------------------------------------------------------------
                        UTILS
------------------------------------------------------------*/
const extractNames = (users) => {
    try {
        const names = users.slice(0, 3).map(user => user.nombre || 'N/A');
        completeWithSuccess(NAME_1_VAR_NAME, names[0]);
        completeWithSuccess(NAME_2_VAR_NAME, names[1]);
        completeWithSuccess(NAME_3_VAR_NAME, names[2]);
    } catch (error) {
        L.error('Error en "extractNames"', { message: error.message });
        throw error;
    }
};

const validateInputData = () => {
    const genero = user.get(GENERO_VAR_NAME);
    const userName = user.get(NOMBRE_SELECCIONADO_VAR_NAME);

    if (_.isEmpty(genero)) {
        L.error('Falta el dato de género.', { genero });
        throw new Error(DATOS_FALTANTES_VAR_VALUE);
    }

    return { genero, userName };
};

const handleUnexpectedError = (error) => {
    let errorType = ERROR_INESPERADO_VAR_VALUE;
    let logMessage = 'Error inesperado.';

    if (error.message === DATOS_FALTANTES_VAR_VALUE) {
        errorType = DATOS_FALTANTES_VAR_VALUE;
        logMessage = 'Faltan datos de entrada.';
    } else if (error.message === USUARIO_NO_ENCONTRADO_VAR_NAME) {
        errorType = USUARIO_NO_ENCONTRADO_VAR_NAME;
        logMessage = 'Usuario no encontrado.';
    }

    completeWithError(errorType, `${errorType} | ${logMessage}`);
};

const completeWithError = (errorType, logMessage) => {
    L.error(logMessage);
    user.set(errorType, errorType);
};

const completeWithSuccess = (outputVariable, outputValue) => {
    L.info(`${outputVariable} | ${outputValue}`);
    user.set(outputVariable, outputValue);
};

main()
    .catch((error) => completeWithError(ERROR_INESPERADO_VAR_VALUE, error.message || ERROR_INESPERADO_VAR_VALUE))
    .finally(result.done);
