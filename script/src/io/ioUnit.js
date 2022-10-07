import { LOG_LEVEL_SELECT, LOG_LEVEL_INFO, LOG_LEVEL_NORMAL, LOG_LEVEL_WARN, LOG_LEVEL_ERROR } from "../constants.js"
import { writeFileSync } from "node:fs"
//code:9,00
class ioUnit {
    latestResult = {};
    dateType = "object";
    writeToFileState = false;
    writeToFilePath = ""
    constructor(writeToFilePath) {
        if (typeof writeToFilePath == "string" && writeToFilePath != "") {
            this.writeToFileState = true;
            this.writeToFilePath = writeToFilePath;
        }
    }
    /**
     * @param {object}input 输入.
     * {
     * {bool}(默认:null)"state":状态,
     * {string}(默认:this.getTime())"time":时间,
     * {string|number}(默认:"")"code":状态码,
     * {string}(默认:"")data":数据,
     * {string}(默认:"")message":消息,
     * {any}(默认:null)annix":附加信息
     * }
     * @return {object}
     */
    stdReturn(input = {}) {
        let result = {};
        let nowTime;
        switch (this.dateType) {
            case "object":
                nowTime = this.getTime();
                break;
            case "string":
                nowTime = this.getTimeString();
                break;
            default:
                nowTime = "unknown type.";
                break;
        }
        (input["state"] === undefined) ? result["state"] = null : result["state"] = input["state"];
        (input["time"] === undefined) ? result["time"] = nowTime : result["time"] = input["time"];
        (input["code"] === undefined) ? result["code"] = "" : result["code"] = input["code"];
        (input["message"] === undefined) ? result["message"] = "" : result["message"] = input["message"];
        (input["data"] === undefined) ? result["data"] = "" : result["data"] = input["data"];
        (input["annix"] === undefined) ? result["annix"] = null : result["annix"] = input["annix"];
        this.latestResult = result;
        return result;
    }
    /**
     * 获取时间.
     * @returns {object} 时间.
     */
    getTime() {
        return new Date();
    }
    /**
     * 获取格式化的时间.
     * @returns {String} 时间.
     */
    getTimeString() {
        let date = new Date();
        let year = date.getFullYear(); //获取当前年份.
        let month = date.getMonth() + 1; //获取当前月份.
        let dat = date.getDate(); //获取当前日.
        let hour = date.getHours(); //获取小时.
        let minutes = date.getMinutes(); //获取分钟.
        let second = date.getSeconds(); //获取秒.
        let millisecond = date.getMilliseconds(); //获取毫秒.
        //格式化并返回.
        return year + '-' + month + '-' + dat + ' ' + hour + ':' + minutes + ':' + second + "." + millisecond;
    }
    /**
     * 将内容打印至控制台.
     * @param {object} data 参数集.
     * @param {Number} logLevel 日志等级.
     * @param {Boolean} returnResult 是否返回报告.
     * @returns {object|undefined} 报告.
     */
    print(data = {}, logLevel = LOG_LEVEL_NORMAL, returnResult = true) {
        let stdResult = this.stdReturn(data);
        switch (logLevel) {
            case LOG_LEVEL_INFO:
                if (LOG_LEVEL_SELECT <= LOG_LEVEL_INFO) {
                    console.info(stdResult);
                }
                break;
            case LOG_LEVEL_NORMAL:
                if (LOG_LEVEL_SELECT <= LOG_LEVEL_NORMAL) {
                    console.log(stdResult);
                }
                break;
            case LOG_LEVEL_WARN:
                if (LOG_LEVEL_SELECT <= LOG_LEVEL_WARN) {
                    console.warn(stdResult);
                }
                break;
            case LOG_LEVEL_ERROR:
                if (LOG_LEVEL_SELECT <= LOG_LEVEL_ERROR) {
                    console.error(stdResult);
                }
                break;
            default:
                console.error(this.stdReturn({
                    "state": false,
                    "code": "100900000",
                    "message": "ioUnit.print():unknown parameter.",
                    "annix": {
                        "parameter": {
                            "data": data,
                            "logLevel": logLevel
                        }
                    }
                }));
                break;
        }
        if (this.writeToFileState) {
            writeFileSync(this.writeToFilePath, JSON.stringify(stdResult) + "\n", { flag: "a" });
        }
        if (returnResult) {
            return stdResult;
        }
    }
    /**
     * 打印日志到控制台.
     * @param {object} data 参数集.
     * @param {Boolean} returnResult 是否返回报告.
     * @returns {object|undefined} 报告.
     */
    infoPrint(data = {}, returnResult = true) {
        let result = this.print(data, LOG_LEVEL_INFO, returnResult);
        if (returnResult) return result;
    }
    /**
     * 打印日志到控制台.
     * @param {object} data 参数集.
     * @param {Boolean} returnResult 是否返回报告.
     * @returns {object|undefined} 报告.
     */
    logPrint(data = {}, returnResult = true) {
        let result = this.print(data, LOG_LEVEL_NORMAL, returnResult);
        if (returnResult) return result;
    }
    /**
     * 打印日志到控制台.
     * @param {object} data 参数集.
     * @param {Boolean} returnResult 是否返回报告.
     * @returns {object|undefined} 报告.
     */
    warnPrint(data = {}, returnResult = true) {
        let result = this.print(data, LOG_LEVEL_WARN, returnResult);
        if (returnResult) return result;
    }
    /**
    * 打印日志到控制台.
    * @param {object} data 参数集.
    * @param {Boolean} returnResult 是否返回报告.
    * @returns {object|undefined} 报告.
    */
    errorPrint(data = {}, returnResult = true) {
        let result = this.print(data, LOG_LEVEL_ERROR, returnResult);
        if (returnResult) return result;
    }
}
export { ioUnit }