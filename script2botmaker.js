/**  
 * Acción de Código encargada de obtener la dirección del usuario.
 *    - Recibe un nombre de usuario, buscar su dirección en una API externa y devuelve la dirección registrada si existe. 
 *    - En caso de que no se encuentre la dirección, se devuelve un estado indicando que no se encontró la dirección. 
 *    - Si no se proporciona un nombre, se devuelve un estado indicando que faltan datos.
 *   
 *
 * Variables de entrada:
 *    - NOMBRE_INGRESADO: El nombre proporcionado por el usuario.
 *
 * Variables de salida de ÉXITO:
 *    1. Se envía exitosamente la dirección del usuario:
 *       - DIRECCION_REGISTRADA: Dirección del usuario.
 *       - JORGE_E2_RESULT: DIRECCION_OBTENIDA.
 *
 *    2. No se encuentra la dirección del usuario:
 *       - JORGE_E2_RESULT: DIRECCION_NO_ENCONTRADA.
 *
 *    3. No se proporciona el nombre del usuario:
 *       - JORGE_E2_RESULT: FALTAN_DATOS.
 *
 * Variables de salida de ERROR:
 *    1. Se produce un error inesperado en el código:
 *       - JORGE_E2_RESULT: ERROR_INESPERADO.
 *       - ERROR_INESPERADO_VAR_VALUE: Detalle del error inesperado.
 *
 */

/*------------------------------------------------------------
        NOMBRE DE VARIABLES DE ENTRADA
------------------------------------------------------------*/
const USER_VAR_NAME = 'NOMBRE_INGRESADO';

/*------------------------------------------------------------
        NOMBRE DE VARIABLES DE SALIDA
------------------------------------------------------------*/
const DIRECCION_REGISTRADA_VAR_NAME = 'DIRECCION_REGISTRADA';
const JORGE_E2_RESULT_VAR_NAME = 'JORGE_E2_RESULT';

/*------------------------------------------------------------
        VALORES DE VARIABLES DE ÉXITO
------------------------------------------------------------*/
const DIRECCION_OBTENIDA_VAR_VALUE = 'DIRECCION_OBTENIDA';
const DIRECCION_NO_ENCONTRADA_VAR_VALUE = 'DIRECCION_NO_ENCONTRADA';

/*------------------------------------------------------------
        VALORES DE VARIABLES DE ERROR
------------------------------------------------------------*/
const ERROR_INESPERADO_VAR_VALUE = 'ERROR_INESPERADO';
const FALTAN_DATOS_VAR_VALUE = 'FALTAN_DATOS';

/* ----------------------------------------------------------------
                        CREDENCIALES
---------------------------------------------------------------- */
const API_URL = 'https://627303496b04786a09002b27.mockapi.io/mock/sucursales';

/*--------------------------------------------------------
                MAIN      
-------------------------------------------------------- */

const LOG = require('helper_logging_gcp');
const L = LOG.core({
    botName: 'demobleett',
    actionCode: 'testjorge',
    debugEnabled: true,
});

const main = async () => {
    try {
        L.info('Inicia la AC obtener direccion del usuario');
        const userName = verifyEntryData();
        const response = await obtenerDireccion(userName);
//Agregaria el filtro aca
        if (!response || !response.direccion) {
            finalizarConExito(DIRECCION_NO_ENCONTRADA_VAR_VALUE, 'No se encontró la dirección para el nombre ingresado');
            return;
        }

        user.set(DIRECCION_REGISTRADA_VAR_NAME, response.direccion);
        finalizarConExito(DIRECCION_OBTENIDA_VAR_VALUE, 'Dirección obtenida exitosamente');
    } catch (error) {
        L.error(error);
        manejarError(error);
    }
};

/* ----------------------------------------------------------------
                        FUNCIONES
---------------------------------------------------------------- */
const obtenerDireccion = async (userName) => {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            const respText = await response.text();
            L.error(`Error in 'obtenerDireccion' service request: ${respText}`);
            throw new Error(ERROR_INESPERADO_VAR_VALUE);
        }

        const data = await response.json();
        const filteredItem = data.find((item) => item.nombre.toLowerCase() === userName.toLowerCase()); //Este filtro
        return filteredItem;
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
    const nombre = user.get(USER_VAR_NAME);

    if (_.isEmpty(nombre)) {
        lanzarErrorInternoConLog(FALTAN_DATOS_VAR_VALUE, 'No se encontró el nombre', { nombre });
    }
    return nombre;
};

/* ----------------------------------------------------------------
                FUNCIONES DE CIERRE DE CA
---------------------------------------------------------------- */
const lanzarErrorInternoConLog = (codigoError, mensajeLog, datosExtra) => {
    L.error(mensajeLog, datosExtra);
    throw new Error(codigoError);
};

const manejarError = (error) => {
    let valorResultadoBot = ERROR_INESPERADO_VAR_VALUE;
    let mensajeLog = 'Error inesperado.';

    if (error.message === FALTAN_DATOS_VAR_VALUE) {
        valorResultadoBot = FALTAN_DATOS_VAR_VALUE;
        mensajeLog = 'Datos de entrada faltantes.';
    }

    finalizarConError(valorResultadoBot, mensajeLog, error);
};

const finalizarConError = (valorResultadoBot, mensajeLog, error) => {
    L.error(`${valorResultadoBot} | ${mensajeLog}`, error);
    user.set(JORGE_E2_RESULT_VAR_NAME, valorResultadoBot);
};

const finalizarConExito = (valorResultadoBot, mensajeLog) => {
    L.info(`${valorResultadoBot} | ${mensajeLog}`);
    user.set(JORGE_E2_RESULT_VAR_NAME, valorResultadoBot);
};

main()
    .catch((error) => manejarError(error))
    .finally(result.done);


    //tENER UN METODO QUE SOLO LLAME A LA api (get post) y despues y despues la regla de negocio a aplicar que este caso seria el filtro