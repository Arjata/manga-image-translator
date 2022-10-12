import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
/**
 * 遍历指定文件夹下的所有文件.
 * @param {String} currentDirPath 文件夹的路径.
 * @param {Function} callback 回调函数.(文件名称,文件状态)=>{}.
 */
export function walkSync(currentDirPath = process.cwd(), callback) {
    fs.readdirSync(currentDirPath, { withFileTypes: true }).forEach(function (dirent) {
        let filePath = path.join(currentDirPath, dirent.name);
        if (dirent.isFile()) {
            callback(filePath.split(currentDirPath + "/")[1], dirent);
        }
    });
}
/**
 * 获取两个数组的差集.
 * @sample array0=["a","c","d"],
 * array1=["b","c","e"].
 * 返回:["a","d","b","e"].
 * @notes 仅能对单层数组进行处理.
 * @param {Array} array0 数组0.
 * @param {Array} array1 数组1.
 * @returns {Array} 差集.
 */
export function getArrDS(array0, array1) {
    var buffer = [];//缓冲数组.
    for (var i = 0; i < array0.length; i++) {
        var array0Value = array0[i];
        var pushArray0Value = true;//将array0Value添加至buffer数组.
        var pushArray0ValueCD = false;//已更改pushArray0Value的值.
        for (var j = 0; j < array1.length; j++) {
            //判断array0中的值是否存在于array1数组中.
            if (array0Value != array1[j]) {
                var haveElement = false;
                //判断array1中的值是否存在于缓冲数组中.
                var elementInbuffer = false;
                for (var k = 0; k < buffer.length; k++) {
                    if (buffer[k] == array1[j]) {
                        elementInbuffer = true;
                        break;
                    }
                }
                //判断array1中的值是否存在于array0数组中.
                var elementInarray0 = false;
                for (var k = 0; k < array0.length; k++) {
                    if (array0[k] == array1[j]) {
                        elementInarray0 = true;
                    }
                }
                if (elementInbuffer || elementInarray0) {
                    haveElement = true;
                }
                if (!haveElement) {
                    buffer.push(array1[j]);
                }
            } else if (!pushArray0ValueCD) {
                pushArray0ValueCD = true;
                pushArray0Value = false;
            }
        }
        if (pushArray0Value) {
            buffer.push(array0Value);
        }
    }
    return buffer;
}
// http://www.onicos.com/staff/iz/amuse/javascript/expert/utf.txt

/* utf.js - UTF-8 <=> UTF-16 convertion
 *
 * Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0
 * LastModified: Dec 25 1999
 * This library is free.  You can redistribute it and/or modify it.
 */

export function Utf8ArrayToStr(array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while (i < len) {
        c = array[i++];
        switch (c >> 4) {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
            case 12: case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
        }
    }

    return out;
}
/**
 * 对异常的抛出讯息进行格式化.
 * @param {object} errorObj 错误讯息对象.
 * @returns 格式化后的错误讯息对象.
 */
export function errorFormat(errorObj) {
    let buffer = {};
    for (let i in errorObj) {
        switch (i) {
            case "stdout": case "stderr":
                buffer[i] = Utf8ArrayToStr(JSON.parse(JSON.stringify(errorObj[i]))["data"]);
                break;
            case "output":
                let array = [];
                array[0] = errorObj[i][0];
                for (let j = 1; j < 3; j++) {
                    array[j] = Utf8ArrayToStr(JSON.parse(JSON.stringify(errorObj[i][j]))["data"]);
                }
                buffer[i] = array;
                break;
            default:
                buffer[i] = errorObj[i];
                break;
        }
    }
    return buffer;
}
/**
 * @example array0=[0,1];array1=[1,2];return [2]
 * @param {Array} array0 
 * @param {Array} array1 
 */
export function getArrDS_S(array0, array1) {
    let resultArr = [];
    let sameArr = [];
    for (let i = 0; i < array0.length; i++) {
        for (let j = 0; j < array1.length; j++) {
            if (array0[i] == array1[j]) {
                sameArr.push(array0[i]);
                break;
            }
        }
    }
    for (let i = 0; i < array1.length; i++) {
        let isSame = false;
        for (let j = 0; j < sameArr.length; j++) {
            if (sameArr[j] == array1[i]) {
                isSame = true;
                break;
            }
        }
        if (!isSame) {
            resultArr.push(array1[i]);
        }
    }
    return resultArr;
}
/**
 * 获取当前时间.
 * @returns {String} 时间.
 */
export function getTimeUsF() {
    let result = execSync("/userroot/mbin/getTimeUs -f");
    return Utf8ArrayToStr(result);
}
/**
 * 日志写入前准备.
 * @param {String} logDir 日志文件夹.
 * @returns {Number} 函数执行状态.
 */
export function prepareWriteToLog(logDir) {
    if (!fs.existsSync(logDir)) execSync("mkdir -p " + logDir);
    if (!fs.existsSync(logDir + "/latest.log")) return -1;
    let command = "tar -czvf " + logDir + "/" + getTimeUsF() + ".tar.gz -C " + logDir + " latest.log";
    execSync(command);
    fs.unlinkSync(logDir + "/latest.log");
    return 0;
}