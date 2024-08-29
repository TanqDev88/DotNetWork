/**
 *  Esta AC recibe un nombre de usuario y busca la dirección correspondiente en una API pública.
 *
 *        - Variables de entrada:
 *          - USER_NAME = Nombre recibido por parte del usuario.
 *
 *        - Variables de salida de ÉXITO:
 *             1. Se obtiene exitosamente la dirección:
 *                - RESULT_VAR_NAME = DIRECCION_USUARIO
 *                - DIRECCION_USUARIO = La dirección obtenida del servicio.
 *
 *             2. No se encuentra una dirección para el nombre dado:
 *                - RESULT_VAR_NAME = DIRECCION_NO_ENCONTRADA
 *                - DIRECCION_USUARIO = null;
 *
 *        - Variables de salida de ERROR:
 *             1. Se produjo un error inesperado en el código:
 *                - RESULT_VAR_NAME = ERROR_INESPERADO //No estaria cumpliendo con esto
 *
 *             2. Faltan datos de entrada:
 *                - RESULT_VAR_NAME = FALTAN_DATOS 
 *
 */

/*------------------------------------------------------------
        NOMBRE DE VARIABLES DE ENTRADA
------------------------------------------------------------*/
const USER_NAME = 'nombre';

/*------------------------------------------------------------
        NOMBRE DE VARIABLES DE SALIDA
------------------------------------------------------------*/
const DIRECCION_USUARIO = 'DIRECCION_USUARIO'; //Ojo las variables no cumplen con las buenas practicas de botmaker
const DIRECCION_NO_ENCONTRADA = 'DIRECCION_NO_ENCONTRADA';
const FALTAN_DATOS_VAR_NAME = 'FALTAN_DATOS';

const RESULT_VAR_NAME = 'RESULT_VAR_NAME';

/*------------------------------------------------------------
        VALORES DE VARIABLES DE ERROR
------------------------------------------------------------*/
const ERROR_INESPERADO_VAR_VALUE = 'ERROR_INESPERADO';

/*------------------------------------------------------------
        VARIABES DE ENTORNO
------------------------------------------------------------*/
const apiURL = 'https://627303496b04786a09002b27.mockapi.io/mock/sucursales';

/*--------------------------------------------------------
                MAIN      
-------------------------------------------------------- */

const LOG = require('helper_logging_gcp');
const L = LOG.core({
    botName: 'demobleett',
    actionCode: 'test_agustin_ejercicio2',
    debugEnabled: true,
});

const main = async () => {
    try {
        L.info('Inicia la AC obtener direccion del usuario');
        const userName = verifyEntryData();
        const userInfo = await obtenerDireccion(userName);

        const { direccion } = userInfo;

        if (direccion) {
            user.set(DIRECCION_USUARIO, direccion);
            finalizarConExito(DIRECCION_USUARIO, 'DIRECCION ENCONTRADA');
            return;
        }

        throw new Error(FALTAN_DATOS_VAR_NAME);
    } catch (error) {
        L.error(error);
        chequearTipoDeError(error);
    }
};

/* ----------------------------------------------------------------
                        SERVICE
---------------------------------------------------------------- */
const obtenerDireccion = async (userName) => {
    try {
        const urlConParametros = `${apiURL}?nombre=${encodeURIComponent(userName)}`;
        const response = await fetch(urlConParametros);

        if (!response.ok) {
            const respText = await response.text();
            L.error(`Error in 'obtenerDireccion' service request: ${respText}`);
            throw new Error(ERROR_INESPERADO_VAR_VALUE);
        }

        const data = await response.json();
        const filteredItem = data.find((item) => item.nombre.toLowerCase() === userName.toLowerCase());

        if (!filteredItem) {
            L.error(DIRECCION_NO_ENCONTRADA);
            finalizarConExito(RESULT_VAR_NAME, DIRECCION_NO_ENCONTRADA);
            return;
        }

        return { direccion: filteredItem.direccion };
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
    try {
        const nombre = user.get(USER_NAME);

        if (_.isEmpty(nombre)) {
            throwInternalErrorWithCustomLog(FALTAN_DATOS_VAR_NAME, 'Falta el nombre', { nombre });
            throw new Error(FALTAN_DATOS_VAR_NAME);
        }
        return nombre;
    } catch (error) {
        bmconsole.log(error);
        L.error('Error en función "verifyEntryData"', {
            status: error.statusCode,
            message: error.message,
        });

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
    let botValue = ERROR_INESPERADO_VAR_VALUE;
    let logValue = 'Error inesperado.';

    if (error.message === FALTAN_DATOS_VAR_NAME) {
        botValue = FALTAN_DATOS_VAR_NAME;
        logValue = 'Faltan datos de entrada.';
    } else if (error.message === DIRECCION_NO_ENCONTRADA) {
        botValue = DIRECCION_NO_ENCONTRADA;
        logValue = 'Direccion de usuario no encontrada.';
    }

    finalizarConError(botValue, `${botValue} | ${logValue}`, error);
};

const finalizarConError = (botValue) => {
    user.set(botValue, botValue);
};

const finalizarConExito = (botValue, logValue) => {
    L.info(`${botValue} | ${logValue}`);
    user.set(RESULT_VAR_NAME, logValue);
};

main()
    .catch((error) => finalizarConError(ERROR_INESPERADO_VAR_VALUE, error.message || ERROR_INESPERADO_VAR_VALUE, error))
    .finally(result.done);
