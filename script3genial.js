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

/* (1)
/*------------------------------------------------------------
        NOMBRES DE VARIABLES DE ENTRADA
------------------------------------------------------------*/
const GENERO = 'GENERO';
const NOMBRE_SELECCIONADO = 'USER';

/*------------------------------------------------------------
        NOMBRES DE VARIABLES DE SALIDA
------------------------------------------------------------*/
const USUARIO_NO_ENCONTRADO = 'USER_NOT_FOUND';
const NAME_1 = 'NAME_1';
const NAME_2 = 'NAME_2';
const NAME_3 = 'NAME_3';
const USER_NAME = 'USER';
const USER_COUNTRY = 'USER_COUNTRY';
const USER_ADDRESS = 'USER_ADDRESS';

/*------------------------------------------------------------
        VALORES DE VARIABLES DE SALIDA DE ERROR
------------------------------------------------------------*/
const ERROR_INESPERADO_VALOR = 'ERROR_INESPERADO';
const DATOS_FALTANTES_VALOR = 'FALTAN_DATOS';

/* ----------------------------------------------------------------
                        CREDENCIALES
---------------------------------------------------------------- */
const ApiURL = 'https://627303496b04786a09002b27.mockapi.io/mock/sucursales';

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
        const verifiedData = validateInputData();
        const allData = await fetchUsersByGender(verifiedData.genero);

        await extractNames(allData);

        if (verifiedData.userName) {
            const userInfo = await fetchUserInfoByName(verifiedData.userName, allData);
            completeWithSuccess(USER_COUNTRY, userInfo.pais);
            completeWithSuccess(USER_ADDRESS, userInfo.direccion);
            completeWithSuccess(USER_NAME, userInfo.nombre);
        }
    } catch (error) {
        L.error(error);
        handleUnexpectedError(error);
    }
};

/*------------------------------------------------------------
                        SERVICE
------------------------------------------------------------*/

const fetchUsersByGender = async (genero) => {
    try {
        const response = await fetch(ApiURL);
        const data = await response.json();

        // Filtrar por género
        const filteredByGender = data.filter((user) => user.genero.toLowerCase() === genero.toLowerCase());
        const firstThreeUsers = filteredByGender.slice(0, 3);

        if (firstThreeUsers.length === 0) {
            throw new Error('No users found for the selected gender');
        }

        return firstThreeUsers;
    } catch (error) {
        console.error(error);
        L.error('Error in function "fetchUsersByGender"', {
            status: error.statusCode,
            message: error.message,
        });

        throw error;
    }
};

const extractNames = async (users) => {
    try {
        if (users.length >= 3) {
            completeWithSuccess(NAME_1, users[0].nombre || 'N/A');
            completeWithSuccess(NAME_2, users[1].nombre || 'N/A');
            completeWithSuccess(NAME_3, users[2].nombre || 'N/A');
        } else {
            throw new Error('Not enough users found to display three names');
        }
    } catch (error) {
        console.error(error);
        L.error('Error in function "extractNames"', {
            status: error.statusCode,
            message: error.message,
        });

        throw error;
    }
};

const fetchUserInfoByName = async (name, users) => {
    try {
        const user = users.find((user) => user.nombre === name);
        if (!user) {
            completeWithSuccess(USUARIO_NO_ENCONTRADO, 'USER_NOT_FOUND');
        }

        return {
            nombre: user.nombre,
            pais: user.pais,
            direccion: user.direccion,
        };
    } catch (error) {
        console.error(error);
        L.error('Error in function "fetchUserInfoByName"', {
            status: error.statusCode || 500,
            message: error.message,
        });

        throw error;
    }
};

/*------------------------------------------------------------
                        UTILS
------------------------------------------------------------*/
const validateInputData = () => {
    const userName = user.get(NOMBRE_SELECCIONADO);
    const genero = user.get(GENERO);

    if (!genero) {
        logAndThrowInternalError(DATOS_FALTANTES_VALOR, 'Gender is missing', {
            genero,
        });
    }

    return { genero: genero, userName: userName };
};

const logAndThrowInternalError = (errorMessage, logMessage, additionalData) => {
    L.error(logMessage, additionalData);
    throw new Error(errorMessage);
};

const handleUnexpectedError = (error) => {
    let errorType = ERROR_INESPERADO_VALOR;
    let logMessage = 'Unexpected error.';

    if (error.message === DATOS_FALTANTES_VALOR) {
        errorType = DATOS_FALTANTES_VALOR;
        logMessage = 'Input data is missing.';
    }

    completeWithError(errorType, `${errorType} | ${logMessage}`, error);
};

const completeWithError = (errorType) => {
    user.set(errorType, errorType);
};

const completeWithSuccess = (outputVariable, outputValue) => {
    L.info(`${outputVariable} | ${outputValue}`);
    user.set(outputVariable, outputValue);
};

main()
    .catch((error) => completeWithError(ERROR_INESPERADO_VALOR, error.message || ERROR_INESPERADO_VALOR, error))
    .finally(result.done);
