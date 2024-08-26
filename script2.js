/**
 *  CHANGELOG
 *
 *  22/08/2024 - https://app.clickup.com/t/86b0239dq
 *   - Se crea la AC para el ejercicio "Flujo dinámico con Acción de código".
 */

/**
 *  Esta AC recibe un nombre de usuario y busca la dirección correspondiente en una API pública.
 *
 *        - Variables de entrada:
 *          - NOMBRE = Nombre recibido por parte del usuario.
 *
 *          - Variables de salida de EXITO:
 *               1. Se obtiene exitosamente la dirección:
 *                  - GET_ADDRESS_RESULT = ADDRESS_OBTAINED
 *                  - DIRECCION = La dirección obtenida del servicio.
 *               2. No se encontró una dirección:
 *                  - GET_ADDRESS_RESULT = NO_ENCONTRADO
 *                  - DIRECCION = null
 *
 *          - Variables de salida de ERROR:
 *             1. Se produjo un error inesperado en el código:
 *                - GET_ADDRESS_RESULT = ERROR_INESPERADO
 *
 *             2. Faltan datos de entrada:
 *                - GET_ADDRESS_RESULT = FALTAN_DATOS
 *
 */

/* (1)
/*------------------------------------------------------------
        NOMBRES DE VARIABLES DE ENTRADA
------------------------------------------------------------*/
const NOMBRE_VAR_NAME = 'nombre';

/* (2)
/*------------------------------------------------------------
        NOMBRES DE VARIABLES DE SALIDA
------------------------------------------------------------*/
const GET_ADDRESS_RESULT_VAR_NAME = 'GET_ADDRESS_RESULT';
const DIRECCION_VAR_NAME = 'DIRECCION';

/*------------------------------------------------------------
        VALORES DE VARIABLES DE SALIDA
------------------------------------------------------------*/
const ADDRESS_OBTAINED_VAR_VALUE = 'ADDRESS_OBTAINED';
const NO_ENCONTRADO_VAR_VALUE = 'NO_ENCONTRADO';

/*------------------------------------------------------------
        VALORES DE VARIABLES DE SALIDA DE ERROR
------------------------------------------------------------*/
const ERROR_INESPERADO_VAR_VALUE = 'ERROR_INESPERADO';
const FALTAN_DATOS_VAR_VALUE = 'FALTAN_DATOS';

/* ----------------------------------------------------------------
                        SERVICE
---------------------------------------------------------------- */

const URL = 'https://627303496b04786a09002b27.mockapi.io/mock/sucursales';

/* ----------------------------------------------------------------
                        MAIN
---------------------------------------------------------------- */
const LOG = require('helper_logging_gcp');
const L = LOG.core({
    botName: 'demobleett',
    actionCode: 'get_user_address', // Agregar mi nombre
    debugEnabled: true,
});

const main = async () => {
    try {
        bmconsole.log(`Init`);
        const nombre = verifyEntryData();
        const response = await getAddress(nombre);
        const { direccion, found } = response;

        if (!found) {
            finalizarConExito(NO_ENCONTRADO_VAR_VALUE, 'No se encontró una dirección para el nombre dado');
            user.set(DIRECCION_VAR_NAME, null);
            return;
        }

        if (_.isEmpty(direccion)) {
            throwInternalErrorWithCustomLog(ERROR_INESPERADO_VAR_VALUE, 'No se obtuvo la dirección del servicio', direccion);
        }

        user.set(DIRECCION_VAR_NAME, direccion);
        finalizarConExito(ADDRESS_OBTAINED_VAR_VALUE, 'Se obtuvo la dirección del usuario');
    } catch (error) {
        L.error(error);
        chequearTipoDeError(error);
    }
};

/*------------------------------------------------------------
                        SERVICE
------------------------------------------------------------*/
const getAddress = async (nombre) => {
    try {
        const response = await fetch(`${URL}?nombre=${nombre}`);

        if (!response.ok) {
            const respText = await response.text();
            L.error(respText);
            throwInternalErrorWithCustomLog(ERROR_INESPERADO_VAR_VALUE, 'Error al hacer la solicitud a la API pública:', respText);
        }

        const data = await response.json();
        const filteredItem = data.find((item) => item.nombre.toLowerCase() === nombre.toLowerCase());

        if (!filteredItem) {
            return { found: false };
        }

        return { direccion: filteredItem.direccion, found: true };
    } catch (error) {
        bmconsole.log(error);
        L.error('Error en función "getAddress"', {
            status: error.statusCode,
            message: error.message,
        });

        throw error;
    }
};

/*------------------------------------------------------------
                        UTILS
------------------------------------------------------------*/
const verifyEntryData = () => {
    const nombre = user.get(NOMBRE_VAR_NAME);

    if (_.isEmpty(nombre)) {
        throwInternalErrorWithCustomLog(FALTAN_DATOS_VAR_VALUE, 'Falta el nombre', { nombre });
    }
    return nombre;
};

const throwInternalErrorWithCustomLog = (errorMsg, logValue, extraPayload) => {
    L.error(logValue, extraPayload);
    throw new Error(errorMsg);
};

const chequearTipoDeError = (error) => {
    let botValue = ERROR_INESPERADO_VAR_VALUE;
    let logValue = 'Error inesperado.';

    if (error.message === FALTAN_DATOS_VAR_VALUE) {
        botValue = FALTAN_DATOS_VAR_VALUE;
        logValue = 'Faltan datos de entrada.';
    }
    finalizarConError(botValue, `${botValue} | ${logValue}`, error);
};

const finalizarConError = (botValue) => {
    user.set(GET_ADDRESS_RESULT_VAR_NAME, botValue);
};

const finalizarConExito = (botValue, logValue) => {
    L.info(`${botValue} | ${logValue}`);
    user.set(GET_ADDRESS_RESULT_VAR_NAME, botValue);
};

main()
    .catch((error) => finalizarConError(ERROR_INESPERADO_VAR_VALUE, error.message || ERROR_INESPERADO_VAR_VALUE, error))
    .finally(result.done);
