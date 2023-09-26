import React, { useEffect } from "react";
import './style.css';

// Error name x error description Lookup table
const error_description = [
    { name: 'hardwareFault1',                   description: 'hardware fault',                              ID: 0},
    { name: 'motorSensor',                      description: 'motor sensor error',                          ID: 1},
    { name: 'overVoltage',                      description: 'over voltage',                                ID: 2},
    { name: 'underVoltage',                     description: 'under voltage ',                              ID: 3},
    { name: 'overTemperature',                  description: 'over temperatue',                             ID: 4},
    { name: 'overCurrent',                      description: 'over current',                                ID: 5},
    { name: 'overLoad',                         description: 'over load',                                   ID: 6},
    { name: 'motorLock',                        description: 'motor lock protection',                       ID: 7},
    { name: 'hardwareFault2',                   description: 'dware fault',                                 ID: 8},
    { name: 'hardwareFault3',                   description: 'dware fault',                                 ID: 9},
    { name: 'motorSensorNotConnected',          description: 'motor sensor not connect',                    ID: 10},
    { name: 'hardwareFault4',                   description: 'dware fault',                                 ID: 11},
    { name: 'hardwareFault5',                   description: 'dware fault',                                 ID: 12},
    { name: 'motorTempSensShort',               description: 'motor temperature sensor short',              ID: 13},
    { name: 'motorTempSensOpen',                description: 'motor temperature sensor open',               ID: 14},
    { name: 'W_cell_chg',                       description: 'cell over charge warning',                    ID: 15},
    { name: 'E_cell_chg',                       description: 'cell over charge error',                      ID: 16},
    { name: 'W_pkg_overheat',                   description: 'pack charge over heat warning',               ID: 17},
    { name: 'E_pkg_chg_overheat',               description: 'pack charge over heat error',                 ID: 18},
    { name: 'W_pkg_chg_undertemp',              description: 'pack charge low temperatue warning',          ID: 19},
    { name: 'E_pkg_chg_undertemp',              description: 'pack charge low temperatue error',            ID: 20},
    { name: 'W_pkg_chg_overcurrent',            description: 'pack chare over current warning',             ID: 21},
    { name: 'E_pkg_chg_overcurrent',            description: 'pack chare over current error',               ID: 22},
    { name: 'W_pkg_overvoltage',                description: 'pack over voltage warning',                   ID: 23},
    { name: 'E_pkg_overvoltage',                description: 'pack over voltage error',                     ID: 24},
    { name: 'E_charger_COM',                    description: 'communication error with charger',            ID: 25},
    { name: 'E_pkg_chg_softstart',              description: 'pack charge soft start error',                ID: 26},
    { name: 'E_chg_relay_stuck',                description: 'charging relay stuck',                        ID: 27},
    { name: 'W_cell_dchg_undervoltage',         description: 'cell discharge under voltage warning',        ID: 28},
    { name: 'E_cell_dchg_undervoltage',         description: 'cell discharge under voltage error',          ID: 29},
    { name: 'E_cell_deep_undervoltage',         description: 'cell deep under voltage',                     ID: 30},
    { name: 'W_pkg_dchg_overheat',              description: 'pack discharge over heat warning',            ID: 31},
    { name: 'E_pkg_dchg_overheat',              description: 'pack discharge over heat error',              ID: 32},
    { name: 'W_pkg_dchg_undertemp',             description: 'discharge low temperature warning',           ID: 33},
    { name: 'E_pkg_dchg_undertemp',             description: 'pack discharge low temperature error',        ID: 34},
    { name: 'W_pkg_dchg_overcurrent',           description: 'pack dischage over current waning',           ID: 35},
    { name: 'E_pkg_dchg_overcurrent',           description: 'pack dischage over current error',            ID: 36},
    { name: 'W_pkg_undervoltage',               description: 'pack under voltage warning',                  ID: 37},
    { name: 'E_pkg_undervoltage',               description: 'pack under voltage  error',                   ID: 38},
    { name: 'E_VCU_COM',                        description: 'Communication error to VCU',                  ID: 39},
    { name: 'E_pkg_dchg_softstart',             description: 'pack discharge soft start error',             ID: 40},
    { name: 'E_dchg_relay_stuck',               description: 'discharging relay stuck',                     ID: 41},
    { name: 'E_pkg_dchg_short',                 description: 'pack discharge short',                        ID: 42},
    { name: 'E_pkg_temp_diff',                  description: 'pack excessive temperature differentials',    ID: 43},
    { name: 'E_cell_voltage_diff',              description: 'cell excessive voltage differentials',        ID: 44},
    { name: 'E_AFE',                            description: 'AFE Error',                                   ID: 45},
    { name: 'E_MOS_overtemp',                   description: 'MOS over temperature',                        ID: 46},
    { name: 'E_external_EEPROM',                description: 'external EEPROM failure',                     ID: 47},
    { name: 'E_RTC',                            description: 'RTC failure',                                 ID: 48},
    { name: 'E_ID_conflict',                    description: 'ID conflict',                                 ID: 49},
    { name: 'E_CAN_msg_miss',                   description: 'CAN message miss',                            ID: 50},
    { name: 'E_pkg_voltage_diff',               description: 'pack excessive voltage differentials',        ID: 51},
    { name: 'E_chg_dchg_current_conflict',      description: 'charge and discharge current conflict',       ID: 52},
    { name: 'E_cable_abnormal',                 description: 'cable abnormal',                              ID: 53}
]

const ErrorList = ({ list }) => {
    const outLis = Object.keys(list)
        .flatMap(
            device => Object.keys(list[device])
                .filter( deviceKeys => list[device][deviceKeys] === 1 )
                .map( filteredDeviceList => ({
                    device,
                    errorName:
                        filteredDeviceList
                            .replace("BMS1_", "")
                            .replace("BMS2_", ""),
                    errorDescription:
                        error_description
                            .find( item =>
                                item.name === filteredDeviceList
                                                .replace("BMS1_", "")
                                                .replace("BMS2_", "")
                            )
                            .description,
                    id:
                        error_description
                            .find( item =>
                                item.name === filteredDeviceList
                                                .replace("BMS1_", "")
                                                .replace("BMS2_", "")
                            )
                            .ID
                }))
        );

    useEffect( () => console.log(outLis), [outLis] );
    return(
        <div className="ErrorList">
            <h3> Error list </h3>

            {(outLis.length > 0) &&
                <ul>{
                    outLis
                        .map( item => (
                            <li key={item.id} style={{ background: (item.errorName[0] === 'E')?'rgba(255, 105, 97, 0.5)':(item.errorName[0] === 'W')?'rgba(223, 216, 128, 0.5)':'rgba(255, 105, 97, 0.5)' }}>
                                <h5>{ item.device }</h5>
                                <h5>{ item.errorName }</h5>
                                <p>{ item.errorDescription }</p>
                            </li>
                        ))
                }</ul>
            }

            {(outLis.length === 0) &&
                <div className="errorPLaceholder"> No CAN error </div>
            }
        </div>
    );
};

export default ErrorList;