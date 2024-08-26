/**
 *  CHANGELOG
 *
 *  10/02/2023
 *      - Se añadió un log en bloque catch para mejorar el monitoreo y rastreo de bugs.
 *      - Se eliminó lógica de error de API de Newsan en la función "chequearTipoDeError", ya que nunca pasó por esa parte el código y modificó el log exitosamente.
 *      - Se modificó el criterio para SIN_ORDENES cuando no se encuentran órdenes en VTEX, no se loguea más como error.
 *      - Se filtran las órdenes que terminan en "-02" que corresponden a los seguros y no se muestran, y quedan las que terminan en "-01" que son del producto comprado.
 * 
 *  15/02/2023 - https://app.clickup.com/t/85zrmmj3w
 *      - Por un comentario en la card se recordó que no se había agregado el changelog correspondiente al filtrado de órdenes sin seguro (terminan en -02) 
 * 
 *  07/02/2024
 *      - Se actualizan credenciale vtex
 */

/**
 * Se consulta primeramente, a partir de los valores de entrada, el servicio Vtex, para corroborar que la orden a consultar exista y esté dentro de los últimos 30 días. Si el estado de la orden obtenido de Vtex no es * el deseado, se procede a consultar con Newsan. Esta CA se puede utilizar tanto para consultar por DNI como con número de orden (OrderId), en el caso que el usuario haya ingresado en la primera vez el número de orden
 * o haya elegido uno entre los que se encontraron en el primer llamado.
 *
 *       - Variables de entrada:
 *           - DNI o Número de orden.
 *
 *       - Variables de salida:
 *           1. Resultado obtenido:
 *               - ORDER_STATUS_RESULT = ORDEN_OBTENIDA
 *               - STATUS: status de cualquier servicio, tanto de VTEX como Newsan.
 *               - ITEMS_COMPRADOS: texto formateado listando los productos comprados.
 *               - ITEMS_QUANTITY = UNICO | MAS_DE_UNO || Esta variable sirve para determinar si en una orden existe más de un producto y enviar mensaje en BOT para ese caso.
 *               - TRACK_ID: solamente de Newsan, sólo si STATUS = DESPACHADO || EN DISTRIBUCIÓN || DISPONIBLE PARA RETIRAR EN SUCURSAL || ENTREGADO.
 *               - ORDER_ID_OBTENIDA: solamente cuando se consultó por DNI.
 *               - SHIPPING_COMPANY: MOOVA || ANDREANI || SIN_IDENTIFICAR
 *           2. Más de un resultado obtenido:
 *               - ORDER_STATUS_RESULT = MULTIPLES_ORDENES
 *               - ORDERS_LIST = JSON conteniendo un array con la información de las distintas órdenes obtenidas, parseado para poder generar lista/botón en botmaker.
 *               - ITEMS_COMPRADOS_LIST: Falta definir con implementación cómo mostrar, por ahora la solución es un array de textos con el número de pedido y los ítems comprados.
 *           3. Sin variables de entrada:
 *               - ORDER_STATUS_RESULT = FALTA_DATOS
 *           4. Sin resultado (404 o 200 sin resultados) o también sin los estados de las órdenes no son útiles según lo definido en CUX/Funcional:
 *               - ORDER_STATUS_RESULT = SIN_ORDENES
 *           5. Error interno (500 o de código):
 *               - ORDER_STATUS_RESULT = ERROR_INESPERADO
 *
 *
 */

/*------------------------------------------------------------
        NOMBRE DE VARIABLES DE ENTRADA
------------------------------------------------------------*/

/*------------------------------------------------------------
        NOMBRE DE VARIABLES DE SALIDA
------------------------------------------------------------*/


/*------------------------------------------------------------
        VALORES DE VARIABLES DE SALIDA DE ERROR
------------------------------------------------------------*/

/*------------------------------------------------------------
        VALORES DE VARIABLES DE SALIDA DE ÉXITO
------------------------------------------------------------*/



/*------------------------------------------------------------
                MAIN
------------------------------------------------------------*/
  
   
/*------------------------------------------------------------
                SERVICES
------------------------------------------------------------*/


/*------------------------------------------------------------
                UTILS
------------------------------------------------------------*/




-------------------------------------------------------------------------------------

/*------------------------------------------------------------
         DOCUMENTACION DEL SCRIPT
------------------------------------------------------------*/
/**
 * Se consulta primeramente, a partir de los valores de entrada, el servicio Vtex, para corroborar que la orden a consultar exista y esté dentro de los últimos 30 días. Si el estado de la orden obtenido de Vtex no es * el deseado, se procede a consultar con Newsan. Esta CA se puede utilizar tanto para consultar por DNI como con número de orden (OrderId), en el caso que el usuario haya ingresado en la primera vez el número de orden
 * o haya elegido uno entre los que se encontraron en el primer llamado.
 *
 *       - Variables de entrada:
 *           - DNI o Número de orden.
 *
 *       - Variables de salida:
 *           1. Resultado obtenido:
 *               - ORDER_STATUS_RESULT = ORDEN_OBTENIDA
 *               - STATUS: status de cualquier servicio, tanto de VTEX como Newsan.
 *               - ITEMS_COMPRADOS: texto formateado listando los productos comprados.
 *               - ITEMS_QUANTITY = UNICO | MAS_DE_UNO || Esta variable sirve para determinar si en una orden existe más de un producto y enviar mensaje en BOT para ese caso.
 *               - TRACK_ID: solamente de Newsan, sólo si STATUS = DESPACHADO || EN DISTRIBUCIÓN || DISPONIBLE PARA RETIRAR EN SUCURSAL || ENTREGADO.
 *               - ORDER_ID_OBTENIDA: solamente cuando se consultó por DNI.
 *               - SHIPPING_COMPANY: MOOVA || ANDREANI || SIN_IDENTIFICAR
 *           2. Más de un resultado obtenido:
 *               - ORDER_STATUS_RESULT = MULTIPLES_ORDENES
 *               - ORDERS_LIST = JSON conteniendo un array con la información de las distintas órdenes obtenidas, parseado para poder generar lista/botón en botmaker.
 *               - ITEMS_COMPRADOS_LIST: Falta definir con implementación cómo mostrar, por ahora la solución es un array de textos con el número de pedido y los ítems comprados.
 *           3. Sin variables de entrada:
 *               - ORDER_STATUS_RESULT = FALTA_DATOS
 *           4. Sin resultado (404 o 200 sin resultados) o también sin los estados de las órdenes no son útiles según lo definido en CUX/Funcional:
 *               - ORDER_STATUS_RESULT = SIN_ORDENES
 *           5. Error interno (500 o de código):
 *               - ORDER_STATUS_RESULT = ERROR_INESPERADO
 *
 *
 */

/*------------------------------------------------------------
        NOMBRE DE VARIABLES DE ENTRADA
------------------------------------------------------------*/
const DNI_VAR_NAME = 'tmp_dni';
const ORDER_ID_VAR_NAME = 'tmp_orderId';

/*------------------------------------------------------------
        NOMBRE DE VARIABLES DE SALIDA
------------------------------------------------------------*/
const ORDER_STATUS_RESULT_VAR_NAME = 'ORDER_STATUS_RESULT';
const STATUS_VAR_NAME = 'STATUS';
const TRACK_ID_VAR_NAME = 'TRACK_ID';
const ITEMS_COMPRADOS_VAR_NAME = 'ITEMS_COMPRADOS';
const ITEMS_QUANTITY_VAR_NAME = 'ITEMS_QUANTITY';
const ORDER_ID_OBTENIDA_VAR_NAME = 'ORDER_ID_OBTENIDA';
const SHIPPING_COMPANY_VAR_NAME = 'SHIPPING_COMPANY'; // ANDREANI || MOOVA || SIN_IDENTIFICAR;
const ORDERS_LIST_VAR_NAME = 'ORDERS_LIST';
const ITEMS_COMPRADOS_LIST_VAR_NAME = 'ITEMS_COMPRADOS_LIST';

/*------------------------------------------------------------
        VALORES DE VARIABLES DE SALIDA DE ERROR
------------------------------------------------------------*/
const FALTA_DATOS = 'FALTA_DATOS';
const SIN_ORDENES = 'SIN_ORDENES';
const ERROR_INESPERADO = 'ERROR_INESPERADO';
const ORDEN_REPETIDA = 'ORDEN_REPETIDA';

/*------------------------------------------------------------
        VALORES DE VARIABLES DE SALIDA DE ÉXITO
------------------------------------------------------------*/
const ORDEN_OBTENIDA = 'ORDEN_OBTENIDA';
const MULTIPLES_ORDENES = 'MULTIPLES_ORDENES';
const MAS_DE_UNO = 'MAS_DE_UNO'; // Constantes de salida para el campo "ITEMS_QUANTITY"
const UNICO = 'UNICO'; // Constantes de salida para el campo "ITEMS_QUANTITY"
const MOOVAA_VAR_NAME = 'MOOVA';
const ANDREANI_VAR_NAME = 'ANDREANI';
const SIN_IDENTIFICAR_VAR_NAME = 'SIN_IDENTIFICAR';

/*------------------------------------------------------------
                AMBIENTES Y CREDENCIALES
------------------------------------------------------------*/
const vtexCredentials = {
    accountName: 'armoto',
    environment: 'vtexcommercestable',
    X_VTEX_API_AppKey: 'vtexappkey-armoto-VBAGJW',
    X_VTEX_API_AppToken:
        'IVHSIYUVREUSXGDXGTCGIAFPWZQMTZLWDUATEHJAVYBUTVFGNGZQWKZTAJXOHZHGOBILYGSIITGEJHHVEQDKBTZPOFPSKXEENOPXAKOSLQXLTIDIDZTCWBHMEACJYXBT',
};

const VTEX_ORDERS_URL = `https://${vtexCredentials.accountName}.${vtexCredentials.environment}.com.br/api/oms/pvt/orders`;

const IS_TEST = user.get('botmakerEnvironment') === 'DEVELOPMENT';  //false;

const NEWSAN_URL_PROD = 'https://api.newsan.com.ar';
const NEWSAN_URL_TEST = 'https://apitest.newsan.com.ar';
const NEWSSAN_URL = IS_TEST ? NEWSAN_URL_TEST : NEWSAN_URL_PROD;

const NEWSAN_KEY_PROD = '3345d124ddca43633c2025f60af57187';
const NEWSAN_KEY_TEST = '028450faa154a7df0a69f15387b8a4f5';
const NEWSAN_KEY = IS_TEST ? NEWSAN_KEY_TEST : NEWSAN_KEY_PROD;

// Valores a matchear de status, para definir si se consulta a newsan o nos quedamos con la información de Vtex.
const vtexStatus = ['waiting-for-sellers-confirmation', 'waiting-for-seller-decision', 'payment-pending', 'canceled'];
const newsanStatus = [
    'PENDIENTE REGISTRACIÓN',
    'REGISTRADO',
    'EN PREPARACIÓN',
    'DESPACHADO',
    'EN DISTRIBUCIÓN',
    'DISPONIBLE PARA RETIRAR EN SUCURSAL',
    'ENTREGADO',
    'CANCELADO',
    'ANULADO',
    'DEVUELTO',
];

const andreaniShippingMethods = [
    '000001_DAB2C_T_EXP',
    '000001_ANDPUP_T_LTL',
    '000001_ANDSD_T_1DA',
    '000001_ACAMBA_T_D2D',
    '000001_ACINT_T_D2D',
    '000001_ALINT_T_D2D',
];
const moovaShippingMethod = '000001_MOOVA_T_D2D';

/*------------------------------------------------------------
                MAIN
------------------------------------------------------------*/

const LOG = require('helper_logging_gcp');
const L = LOG.core({
    botName: 'Motorola',
    actionCode: 'order_status',
    debugEnabled: true,
});

const main = async () => {
    try {
        const data = validateData(); // DNI o número de orden.
        // const data = mockData();
        const timeRange = get30DaysFromNow();
        const params = buildParams(timeRange, data);
        let vtexOrders = await callGetVTEXOrders(params);
        // let vtexOrders = mockVtexOrders();
        if (_.isEmpty(vtexOrders)) {
            finalizarConExito(SIN_ORDENES);
        } else {
            let botValue, logValue;
            if (vtexOrders.length > 1 && _.isEmpty(data.dni) && !_.isEmpty(data.orderId)) {
                L.warn(`Se encontraron ${vtexOrders.length} órdenes con el mismo orderId en VTEX.`, vtexOrders);
                vtexOrders = vtexOrders[0];
                await processOnlyOneOrder(vtexOrders, data);
                botValue = ORDEN_OBTENIDA;
                logValue = 'Flujo exitoso, orden obtenida.';
            }
            if (vtexOrders.length > 1) {
                const amountProcessed = await processMoreThanOneOrder(vtexOrders);
                if (amountProcessed === 1) {
                    botValue = ORDEN_OBTENIDA;
                    logValue = 'Flujo exitoso, orden obtenida.';
                } else {
                    botValue = MULTIPLES_ORDENES;
                    logValue = 'Flujo exitoso, ordenes obtenidas.';
                }
            } else {
                vtexOrders = vtexOrders[0];
                await processOnlyOneOrder(vtexOrders, data);
                botValue = ORDEN_OBTENIDA;
                logValue = 'Flujo exitoso, orden obtenida.';
            }
            finalizarConExito(botValue, logValue);
        }
    } catch (error) {
        L.error('Log de error previo a lógica de errores.', {
            ...error,
        });
        chequearTipoDeError(error);
        return;
    }
};

/*------------------------------------------------------------
                SERVICES
------------------------------------------------------------*/

const callGetVTEXOrders = async (params) => {
    const config = {
        method: 'GET',
        url: VTEX_ORDERS_URL + '?' + params,
        headers: {
            'X-VTEX-API-AppKey': vtexCredentials.X_VTEX_API_AppKey,
            'X-VTEX-API-AppToken': vtexCredentials.X_VTEX_API_AppToken,
        },
        json: true,
    };
    let result = await rp(config);
    L.info('callGetVTEXOrders result log.', result);
    result = result.list.filter((order) => order.orderId.split('-')[1] === '01');
    if (result.length > 0) {
        return result;
    } else {
        L.info('No se encontraron órdenes en VTEX.', {
            result: result,
            params: params,
        });
        return;
    }
};

const callGetVTEXOrderDetail = async (orderId) => {
    try {
        const config = {
            method: 'GET',
            url: VTEX_ORDERS_URL + '/' + orderId,
            headers: {
                'X-VTEX-API-AppKey': vtexCredentials.X_VTEX_API_AppKey,
                'X-VTEX-API-AppToken': vtexCredentials.X_VTEX_API_AppToken,
            },
            json: true,
        };
        const result = await rp(config);
        L.info('callGetVTEXOrderDetail result log.', result);
        return result;
    } catch (error) {
        throwInternalErrorWithCustomLog(error, 'No se pudo obtener el detalle de la orden.', {
            error: {
                name: error.name,
                statusCode: error.statusCode,
                message: error.message,
            },
            orderId: orderId,
        });
    }
};

const callGetNewsanOrders = async ({ orderId, dni }) => {
    let body = {
        source: 'B2CE_MOTOROLA',
        order_number: '',
    };
    if (_.isEmpty(dni)) body.order_number = orderId;
    else {
        body.document_type = '96';
        body.document_number = dni;
    }
    const config = {
        method: 'POST',
        url: NEWSSAN_URL + '/api/core-services/orderStatuses',
        headers: {
            'auth-key': NEWSAN_KEY,
        },
        body: body,
        json: true,
    };
    try {
        const result = await rp(config);
        L.info('callGetNewsanOrders result log.', result);
        if (result.lines.length > 0) {
            const uniqueValues = _.uniqBy(result.lines, 'order_id');
            if (uniqueValues.length > 1)
                L.warn('Más de una orden encontrada con un mismo orderId en Newsan.', uniqueValues);
            return uniqueValues;
        } else {
            throwInternalErrorWithCustomLog(SIN_ORDENES, 'No se encontró la orden en Newsan.', result);
        }
    } catch (error) {
        throwAPIErrorWithWarningLog(error, 'No se pudo obtener la orden en Newsan', {
            error: {
                name: error.name,
                statusCode: error.statusCode,
                message: error.message,
            },
            body,
        });
    }
};

/*------------------------------------------------------------
                UTILS
------------------------------------------------------------*/

const validateData = () => {
    const dni = user.get(DNI_VAR_NAME);
    const orderId = user.get(ORDER_ID_VAR_NAME);
    if (_.isEmpty(orderId)) {
        if (_.isEmpty(dni)) throw new Error(FALTA_DATOS);
        L.info('Búsqueda por DNI.');
        return { dni };
    }
    L.info('Búsqueda por número de orden.');
    return { orderId };
};
const get30DaysFromNow = () => {
    const now = new Date();
    // 1 segundo -> 1 minuto -> 1 hora -> 1 día -> 30 días.
    const thirtyDaysInMs = 1000 * 60 * 60 * 24 * 30;
    const startDate = new Date(now.getTime() - thirtyDaysInMs).toISOString();
   ...