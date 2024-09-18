//******************************************************************************************************/
//******                                     CHANGELOG                                            ******/
//******************************************************************************************************/
/**
 * 05/10/23 logs for wakeUpCall added
 * 18/12/23 error 401 handler
 * 22/01/24 400 error handler added
 * 22/02/24 Logs - only for DEV - added
 * 04/06/24 Nuevo comportamiento de la biometria
 *           -Add handler error code 403
 *           -Unify FaaS responses
 */
//*********************************************************************************************************/
//******                              GLOBAL VARIABLES                                               ******/
//*********************************************************************************************************/

/************************************************/
/*                 LIBRARIES                    */
/************************************************/

const { Toolbelt } = require('lp-faas-toolbelt');
const _ = require('lodash');
const secretClient = Toolbelt.SecretClient();

/************************************************/
/*                 CONFIGURATION                */
/************************************************/

const configAll = {
    DEV: {
        url_base: 'https://servicios-test.macro.com.ar:3632',
        env: 'test',
        envCb: 'DEV',
    },
    PREP: {
        url_base: 'https://servicios-prep.macro.com.ar:3632',
        env: 'prep',
        envCb: 'PREP',
    },
    PRD: {
        url_base: 'https://servicios.macro.com.ar:3632',
        env: 'prod',
        envCb: 'PRD',
    },
};

/************************************************/
/*            CACHED SECRET VARIABLES           */
/************************************************/
/* Las credenciales se guardan en el secret storage.
Son variables para que puedan ser cacheadas*/
let credentials = {
    DEV: {
        cert: undefined,
        key: undefined,
        username: undefined,
        password: undefined,
        oauthToken: undefined,
    },
    PREP: {
        cert: undefined,
        key: undefined,
        username: undefined,
        password: undefined,
        oauthToken: undefined,
    },
    PRD: {
        cert: undefined,
        key: undefined,
        username: undefined,
        password: undefined,
        oauthToken: undefined,
    },
};

//*********************************************************************************************************/
//******                                     FUNCTIONS                                               ******/
//*********************************************************************************************************/

/************************************************/
/*              MAIN LAMBDA FUNCTION            */
/************************************************/

async function lambda(input, callback) {
    try {
        if (!_.isEmpty(input.payload.wakeUp)) {
            console.info('wake up call');
            return callback(null, `I'm up`);
        }
        // input.payload = getMockInput(); // COMENTAR PARA SACAR MOCK

        validarDatosDeEntrada(input.payload);

        const { token, hash_cuenta, cuenta, type } = input.payload;

        let config = configAll[input.payload.env];

        if (_.isEmpty(config)) throw new Error('400.Bad request - Sin parametro env o no machea con DEV PREP PRD');

        const queryParam = { alias: `alias=${cuenta}`, cbu: `CBU=${cuenta}` };

        let response = await callApiConsultaTitularidad(config, token, hash_cuenta, queryParam[type]);
        // let response = buildOkResponses(getResponseMock(cuenta)); // MOCK

        loggerDEV(`Consulta titularidad response `, response, config);
        console.info(`Consulta titularidad end for env`, config.envCb);

        return callback(null, response);
    } catch (err) {
        console.error('Warn', err.message);
        console.error('Stack', err.stack);
        console.error('Name', err.name);
        return callback(err, null);
    }
}

/************************************************/
/*        SERVICE INTERACTION FUNCTIONS         */
/************************************************/

async function callApiConsultaTitularidad(config, token, hash_cuenta, queryParam) {
    const [clientCert, clientKey] = await lazyLoadClientBundle(config);
    const client = Toolbelt.MTLSClient({ cert: clientCert, key: clientKey });

    const auth = 'Bearer ' + token;
    const url = `${config.url_base}/clientes/cuentas/${hash_cuenta}/titularidad?${queryParam}`;
    const headers = { Accept: 'application/json', Authorization: auth };

    console.debug('url', url);
    console.debug('headers', headers);

    const { statusCode, body } = await client.get(url, headers, '', {
        allowSelfSigned: true,
        timeout: 30000,
    });

    // const {statusCode, body} = getMockErrorPrisma();
    // const { statusCode, body } = { statusCode: 403, body: '' };

    console.info('Status Code', statusCode);
    loggerDEV('Response', body, config);

    if (statusCode == 200) {
        return buildOkResponses(JSON.parse(body));
    }
    if (statusCode == 400) {
        return buildErrorResponses(statusCode, 'Bad request');
    }
    if (statusCode == 401) {
        return buildErrorResponses(statusCode, 'Access Token inválido');
    }
    if (statusCode == 403) {
        return buildErrorResponses(statusCode, 'Refresh Token expirado');
    }
    if (statusCode == 412) {
        console.info('Error Prisma', body);
        return buildErrorResponses(statusCode, 'Error prisma al consultar titularidad', body);
    }

    throw new Error(`Error ${statusCode} al intentar consultar titularidad de la cuenta`);
}

/************************************************/
/*             VALIDATIONS FUNCTIONS            */
/************************************************/

function validarDatosDeEntrada(payload) {
    if (_.isEmpty(payload.env)) throw new Error('Falta campo env');
    if (_.isEmpty(payload.hash_cuenta)) throw new Error('Falta campo hash_cuenta');
    //if (_.isEmpty(payload.token)) throw new Error('Falta campo token');
    if (_.isEmpty(payload.cuenta)) throw new Error('Falta cbu o alias');
    if (_.isEmpty(payload.type)) throw new Error('Falta campo type');
}

/************************************************/
/*         LAZY LOADS SECRETS FUNCTIONS         */
/************************************************/

async function lazyLoadClientBundle(config) {
    console.debug('lazyLoadClientBundle for  ', config.env);
    const ENV = config.env;
    let crd = credentials[config.envCb];

    if (crd.cert && crd.key) {
        console.info('lazyLoadClientBundle cache ');
        return [crd.cert, crd.key];
    }

    if (crd.cert === undefined) {
        const { value } = await secretClient.readSecret('macro_cert_' + ENV);
        crd.cert = value;
    }

    if (crd.key === undefined) {
        const { value } = await secretClient.readSecret('macro_key_' + ENV);
        crd.key = value;
    }

    credentials[ENV] = crd;

    return [crd.cert, crd.key];
}

/********************************************** */
/*               UTILS FUNCTIONS                */
/********************************************** */

function getErrorResponses(statusCode) {
    const errorCodes = {
        400: 'BAD_REQUEST',
        401: 'NOT_AUTHORIZED',
        403: 'NOT_AUTHENTICATED',
        404: 'NO_MATCH',
        412: 'ERROR_PRISMA',
    };
    return errorCodes[statusCode];
}

function loggerDEV(title, description, config) {
    if (typeof title !== 'string') {
        title = JSON.stringify(title);
    }
    if (config.envCb === 'DEV') {
        console.info(title, description);
    }
}
function buildOkResponses(data) {
    return { success: true, data: data, error: null };
}

function buildErrorResponses(code_http, message, details) {
    const code_info = getErrorResponses(code_http);
    console.warn(code_http, code_info);
    return {
        success: false,
        data: null,
        error: {
            code_http,
            code_info,
            message,
            details,
        },
    };
}

/********************************************** */
/*               MOCK FUNCTIONS                 */
/********************************************** */

function getMockErrorPrisma() {
    return {
        statusCode: 412,
        body: JSON.stringify({
            error_code: 'RequestException',
            message: 'klkhgjvlha vencida',
        }),
    };
}

function getMockInput() {
    return {
        token: 'ZXlKbGJtTWlPaUpCTWpVMlEwSkRMVWhUTlRFeUlpd2lZV3huSWpvaVpHbHlJaXdpWTNSNUlqb2lTbGRVSW4wLi5NM1NXd25vR0xZOGdQVzE5blpvbWZRLjNsR1c3RzZRWTZmaDRjbmZZdllYME1JOTFiSVhzRlhFZnNteHl0ZU55QUs0NkdqVTRoR2JYdkwxVGVnRTdxakhTMkVObWxXb1FOV0Y3NEJDMlUtR3VKTEpyUjNEOXFVMHJTT2xvVUpxcDZaT24ydFlKVVR0dVNFanhNRmVaV0xHS05COUtteVV2ZkJ5WU1RZHBQRGJRb0c0TV9jUFNPVU00YVhKZkZPQnFSZjZPREQwWTN6OEpCbVNPQnFEekZDZklVaTVaZWpwRXNWbmpMSV8yaG9oYnN4Wmp2OWN2eXJXVV9JdDdWS3F4cVpMeGF2SHZHZUFTbDN1OGZ6N284TTlfTk00ODRiV1d1NmZDdUlHNWE4LVp4b0JqT05LZWdkZjU3OVJSZVp6NEVtTENtczhuSWhfZkpQTFd5TEVnSGFOM0RTendIZldQTWtndHcxTkVlSXVhb3A4ZUl5OW5XNTdVRWt4THhDblh6alBtbWJHZFF0Mk92R0JueVhKQnpVa1Y5OC0tZlotQVczbm1RbDFuSWZ3YlhJYnJZSnJsOTZVeDJDZGtLdGo5dDV2VGhfcHl2OFUtdy1INEtFRENNRi05UTJBSU5ScERCYkZLNV9sNnFGekpCUGlDX0thOVFGaTlmNndieXo3U2F5T1JNZzVZQ0dXcHJPbHQ2d04xRXRfTWl5TUJIUmRWckMxMlhGM3RrNllxa09fdURwQ3ZHYjhuUlBIMzRJWVBod1VOYmZGSmpWVlFILWlzWVpSREpTOGFYaXBhZ0Z4VDh1M21ia0x6WnlralFFOUZlOXNrQV9TRERfNVljaWEteFRNbkVRWmFEZjBhZFhMbG1ad0tNeVJ0UXhHUE05Q0NXVWZjb18wejhjaHVjdkJwZkYtWi0zcS03SUVkNnhyMDM3T1FLaEtadVVwTXZyMS1PTzlLMGhMQ1RSU3JQSHBNcFVZQXBVSG9YbnlBUEVMOF9yMTlRTVhLUEYxMjd2aUIyaXZiSzVBcW9RNE9vZ1B0NGlJTWhlV21fU3JCc01sZlhTdDdhaEs5RDAxOWtRb29KdE11NG9hU2dFY3BaZVRIZjNzcFRJdHE4cldldmJKNGJRUjE1NGx2NnBsTFJnMndxdWlnb21lR1B2bnJiQXA1bDQzQjdqak1qOW8wMFRFeW03NjVLWDZPSlY2UjVPdkhtVldfTWJsM1VVeVAyU1pzZ2hPRXlpM2pybkFJdXMtejJiQzAyVXBXV1ZhZUVzemRXYmM5QjZ4TEk3YV8yY1NCckpXQjdpUTREcXJPNHV2UDI0MXdscEdPSngwUWhaQm43UlpyXzNzaW5GYkdTVDVyNVZJQVhNSVVhZHRiV3I0a21qX3pGMWRrN2kweGZoMk1SZmxCTGR1VWpoZXBJM01VZElKcG5rTXdjdl9XUEV3cFRhS2F0dWcwdVhOX29ZYlg0N0Vfc0h2aDVCQng3ZFBYM1MzY0lNVGl3eVZLVGoydXVjbDZLc2N5dkg2S012MG45bl8yUEpuXzZjMVpiXzZjaXVzT2U2eWhTMVdodjdiSDk3SUM5YjJCRy1DRVVOWWpCdVdFNVEzanNZRkdBaXR6WDZ0alU3SncweEEzQ0dkR3hmSko1RUY5ZlN4My0xdjJxZXlubVBjbDNoUGQxTjBIZkg0QkVtakwzVF9lelRRT3FadzBfUFprZVFsQTluZG1KWHJkcEJCWVVZWE1sMXZZeldzbVdFRUNwUGJRbDRBVHdlSjBMV0RzbG8yUW5vT0pWTHFUc056TnQ0TkVXbEVkM0tXUFdrUGJUdmNNR1JLX1JPS29ld3hkS2FFMXg0LWVvRTU5emtpUER5RXN6LS1FSEo1dFMyd2NfajZGc096eV9hVGtEZExoUTVRel83VlRRY1V0RTJiYTlHbkdlVXBXbFJjQXNhLWJzUTU5czRKSjd4eGw2clVnVzRfWGtObHZJazVMWFdKbmxrWjFySWFrNHU2d1FXQkh3UE5vLUVJRE5reE9SVUJ6aTVDT180MEdMYkNsSXBXcnVOM2I2RzJUcktYcThuMWJidWJDdFBTbFBJeHRNc29mV3pEMTU3OWl3QmxXc2hWejd0dWJpdEo3Q2RxX0locEJuSl9DdkN3OWZNc09FTFljcTdIMlFOSXdNUm5NX3UyTEJmUGR1V25Ma09oNzRLeTk0eVI2M0tvQkF2T096RjF0aXZOSV9qcVZXdVpPdEFkVU56dmlGYk80M1dzR0xJRHREX00wcUZocUNubjZieUlCcUZRcllrU2Z1Z2xqTWdTQnRBOG9mT1ZURjhGd2xYM01IMTF1V25QNkl4M0lsa3NITlBuRS1MUV9JOV9NbkZ6MEktUEUtUklnWG5XYTM1eWltSnEtQmNwUWtEWnFqTmVmZGIwM0l2RVFZazlOaFdVNmxrWXRCX2FXRmRDUzlid3lLMldNdXZ5eEo5MlhYT0FJeGxydzd1QTltNWUxTjNobWxuMUU2WVNJZWZMNTlRRS1oYW1TQXNkS1kzeVdzU2lDY2tUZjZmMGZYOU1LSjRsbWgwNjVYREllRHBmMEN6VWJRdW1FeDlQMVVoWl9LaVR6OTQ1cWVnRk9UczRUSGJaLTNpXzJQVG9qRWYwelRBamZWb0V0ODBlNHlWN3FWX3J4S0dtS3k5U19BenVJdVQtLWZGZkRJdEVkSVdLcTVDYVZRX1RaZmVuV1VCbVNiVHoya3BNSTBPM3pBUjh5WldVMHZyN3piSWR6T25nRlZnVWlrdEtnc0hxSmY3d3YwbVJqTUcwaTJ0Ym1WNDVsXzFoS0U5NU1faVNteXFlMzQ3MlVkQi14VFQxalB3WWdCOHowY3RvWHFaOU83UnJVNktZSkpQZW4xendOdVhrMXo0UnZJbkozM2o0MmRlV0xpOGhIZVFXd2ppczJEWlRaYjlHdzR3VnR2dDlYUnA1bDlvcnVTUDBwc283V0xCbGZLUXZmbDkxUlZ2Y0hZdTd0VjJXM3phZHRXbXJQX2Y2YmJpR0FHaExtZUZXbGZkOXI0eG9Fek9vbzRNenJ5RzRoQzhoMTU0eDFnR3pNcUtoYmV6MUZIQ3ZrSFgzVnY1RU5HM3BiRlMyOXcyUmhjbklua19Sc2pYZFZ6Y2ZBRE50YlE4ZjByaDBZdmRGUGlMbWw2VzNGV1ZTQmtpdjloTEduV05GbUpiNXZwWEZEbm1lQW4zbmJ1YTdnbHM3V0ZuQkJmYnNoeFkxQU00ZHYyakM1RzduSHdfb295M1A4dDlMMnI3TmduempJc2ZSR2NobGNwclppdXpmTzhaVEZlT3lBOGxPeU1mOC1uS1BXWVJTTlJ6Z0Z1ZkY1Y21XbU9ocmVqT0UzTXlEMmRRQUN4V18wd3lzZ1lLNUlKUWdmazgydEdfVkxQUVdCaFR1REtjV0dxSHRDcnUwU1psNl9RTGJjQTE2N2J5b0UtVWtTNVlMSU1mM3hadzlhNjVBMENZZTVaZGZ6U2tISXhZT2ZXalJjbDhiQ0ZBOUtxWUVxZUQzQm0yRlhlNGpGM3JralpsRTlBSjJZSGh2dFdZR2ZYemU3YU0wUnZlQjZwOFU3VlhHcWRMV1lGam1YWGpTZXhuRHY5M1YwcWlFM2VFdGRrYU9DV0R3dEE0SGJpck52bjl1eHJmOG0ycDhtc0tWaWhWMm5BNUFNZzVraWZiVFgyUjRCdi14dzJRb2pENVVSVDdMTkhMdnk1NGIydlBNVW5ZM1oxWF8xU1VYOGtWOHVpazFxMG9COVdpaWdYS2hzUVAwRnBEWFRDT0xWbU52aWRYTU1oem5OUEJZYlRMZkVtSVBYS0k3THRzVUhjMS0wdDBnaXhuY1BVMGxpTXRBcGVmNnROcHdDRk9WNnU0d0wyTUp5cW0tWm85V3ctQkJ1T1ROUGhtbG5wQzA3cU5MZlg3MnJlaUF3WFpsV014NG04ZkxkRFllRTU2c2lwSmlEU3hmV1REMjVSNERDWlRKSUZPVFUzTFEzOWpkWjB6RDV2cER2VmJ6VXZ1MjFfWkxBX3JEdXprWHF3bzFTWWxjMk5kTS1kZTZsdzIxeHVrVy1YQmFhSlRwcTJQNG1pMXF0UXM0Zk1VajZ5VlBJUjFxZDJ2aXJKWUo2VGxuNmRTTXhjSkd0SVpSNWs2aWxhS2hScmVudW0zZDZUcXQ3aUtGSmJTa3N2ak8zWERDUG9FZng4Z2lrVTFnVlVBVW92V1gweWhBdTNRNm93LWJMSnl2Mlk5d0dFLTZfTGhxV005c0xwRjQ4VDh2TjVHZDRrbll1b0gxbzZVc3NiWEU4T3R5UExXa2VXZVlPWTNGdnVyTGVMVklEOWVWUU9aNE1CT0dUY25BdWNGZExmMXJPQzl0bF91alJkZ05hS0VHTHFjUzlFYmZLYjRQRWprOHA1cE5LN2U2Z2pscktOVmFxa0YwSmtSbUM4dTBGcHJMdDBSdjgzT3F0TUpnMlN3cVJSOUEzSTNOeklWdFRHekdBQ2dIQnFoMi1xeERCRTdQZnhpb0NJcXRVckNLTjlwa19HQU9GR3I4aW9NV2NyMUJOYTQwVnlBM1gyMW84cE80LUo5dTBad1ZTV3M3ajJ5VkZ0VWU1YUtWLVlidkxBdDVidnA2anAwZFFTNlgxeVpaU195TXJDbHlmVjU1YWZDdHJTcm12QXBkdExNOTctUWxad1l2QzczQVlxLVByTUdwclFNOXBSLU93LV9QS1F1TTVyOGs5QnlRdTZsb1B6V1VkczZGZFYzWjdqeWd0NWVndy1BZXM2Z1BGalk2NHN6VXZCalQwNlM2M3VTSHZNcDFzLUFqRWMyRkp0R3dOSU8xendjaUlhcy1HSlE3RncxYmJJdEYxV0JUbWpBY1JnNGRwbTYtMGh1STQwRFpORFJlemFJWEc5cWtjbnRoMTU2OTFvcENRMEdBX0N4WEU1OGJ1NHBrRzJBelRTTGJXRDlIQmNwYmhDaW9RdTdybk9fbHotNGF3Wm9OZlRnc1kzOW1aMXgzSl9vaUxJQzJVeTNoSk96TFdVQUEtX09vc2sxcEs5Z29rbllvTXRTb25NdGdFaXBoT0VCcDVkcGYtcTIzZWRKSGNVLVE2Qy1jTE5RWUpoZkQtVlFUbExGZXNBaFRqNjI3NmNMZmp5dlpTc29LVUpjbVBYVEpjSWZxZWF0TFNNNGw1NFpmdGE4aUtfazZFbWNKUWFPWjJDblBybkI0VVViX3JYQi05SFRqeHBsR1lFcEhtVWpzYU5QbHg4TGJzNWZBUjBFdmNlU2hSS1dOa0Q4VVozZGpTWjhzNjN1ei1CYXdtLWl1UE1jS1l0WGZ1bVJFbVlQYXJmUXc5OXZFZWlLQWRiYURIS1UtWWZsRGNqWVpYald2UDBNenlqRm42Mnp3U1hSbG53MXU2T1duZXhiOV9WOE1lQVk1VDcwNUM0SFoyd1dDQkNBT3NUYm5PenQ5a0R1cWRmbkg3UXFNdUlLYUNBdmprQUUxVm5XaGk3Vm5OV21rYUVNdnVpakVFMUU4b09JdElLVDZReDZBWUpJenM1UXRXZnFrWTdjWXNRVGtNN1duaDZYU2hqZW1vVUZEQVVtUm01RzBxNDIzRmUtTkJfYXUxYkE4S2h5QTVpWktXVlhKRkJvZlBCZFczelIwbDhNUEpJcy0zN1NmbFg1b0Z4T3kwV2N4LXpvV3pGY3NLSHlnUEdpQWI4M0pmSTFoLTktS0ZXR1kuSllyYUpjSnNuNHZPeFFMOFo0bk90Q1VmQ1ZHaGd2M2FfaDV5ZzE1MGJYRQ==',
        hash_cuenta:
            'Mjg1MDAwMDU2RFo3ZElEUFBXaXRLOVF5QXFmK1BoSUYzaU0rNXdCaVoyRWtKb2Zoa2x6bU8rbHZXMXQ0QUhBPT1RUjA1MlltNVNiR1ZJVVN0UVNGSndZbGRXVkdSSFJuUmpSRFI0VG1wcmVFNVVRVFJPYW10NVVFTTVNR0ZYTVd4Vk0xSm9ZbGhCSzFCSVRteGpNMDV3WWpJMEswMVVUWGROVkVrMFRWZE5kRTU2YXpKYWFUQXdUbXBuZVV4VVozZFBWMUYwVFRKRk1VMVVUbTFaVjBacVRrUkJlRkJET1hwYVdFNTZZVmM1ZFZCcWQzWlpNamwxWkVkV05HUkVORGhaTTFac1ltNVNhRkJxZUhWa1Z6RnNZMjA0SzAxNll6RlBWRUYzVFVSQmQwMXFZelZPUkd0NFVFTTVkV1JYTVd4amJUZ3JVRWN4ZG1KdFZtdFpWRFEwVFVSM2RtSlhPWFZhVjFKb1VHcDRkMk50T1d0a1YwNHdZbm8wZWxCRE9YZGpiVGxyWkZkT01HSjZORGhNTWs0eFdsYzFNRmxVTkRoTU1taG9ZekpuS3cuZ0RYdXQ0QXQwMzE4ZVFQdlIwZ0ViakxQNHduZERXMUpZTDNlQTM3RGhzYk5jTWhJcktqblJBUExwNkNKM0JQQXZ3Y1dYR3NxRG9ZRXVVUmgzaEVGUmc=',
        env: 'DEV',
        cuenta: '123456',
        type: 'cbu',
    };
}

function getResponseMock(cuenta) {
    const res = {
        '1234567891234567891234': {
            code: 200,
            data: {
                cuenta_destino_moneda_codigo: '80',
                cuenta_destino_moneda_descripcion: '$',
                cuenta_destino_numero: '',
                cuenta_destino_numero_CBU: '1234567891234567891234',
                cuenta_destino_tipo_codigo: '2',
                cuenta_destino_tipo_descripcion: 'CA',
                cuits: ['27178203989'],
                banco_codigo: 'BANCO DE VALORES',
                banco_nombre: 'BBVA FRANCES',
                titular_nombre: 'DE MARIA ARANZAZU',
            },
        },
        aliastest: {
            code: 200,
            data: {
                cuenta_destino_moneda_codigo: '80',
                cuenta_destino_moneda_descripcion: '$',
                cuenta_destino_numero: '',
                cuenta_destino_numero_CBU: '0170118640000000383822',
                cuenta_destino_tipo_codigo: '2',
                cuenta_destino_tipo_descripcion: 'CC',
                cuits: ['32123211232'],
                banco_codigo: 'BANCO DE VALORES',
                banco_nombre: 'ICBC',
                titular_nombre: 'SONIA',
            },
        },
        aliastest2: {
            code: 200,
            data: {
                cuenta_destino_moneda_codigo: '80',
                cuenta_destino_moneda_descripcion: '$',
                cuenta_destino_numero: '',
                cuenta_destino_numero_CBU: '0170118640000000383111',
                cuenta_destino_tipo_codigo: '2',
                cuenta_destino_tipo_descripcion: 'CC',
                cuits: ['32123211232'],
                banco_codigo: 'BANCO DE VALORES',
                banco_nombre: 'ICBC2',
                titular_nombre: 'SONIA2',
            },
        },
    };

    if (_.isEmpty(res[cuenta])) throw new Error('404.Mock not found');

    return res[cuenta];
}
