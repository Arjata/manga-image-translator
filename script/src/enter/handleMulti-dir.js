import { v4 as uuidv4 } from "uuid";
import { execSync } from "node:child_process";
import { readFileSync, copyFileSync, unlinkSync } from "node:fs";
import { argv } from "node:process";
import path from "node:path";
import { fileURLToPath } from 'node:url';
import { ioUnit } from "../io/ioUnit.js";
import { perferWriteToLog } from "../globalFunctions.js";
const fileSign = "src/enter/handleMulti-dir.js:";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const config = JSON.parse(readFileSync(__dirname + "/../../config/handleMulti-dir.js.json").toString());
const handleDir_js_config = JSON.parse(readFileSync(__dirname + "/../../config/handleDir.js.json").toString());
perferWriteToLog(config.logDir.main);
const ioHead = new ioUnit(config.logDir.main + "/latest.log");
ioHead.dateType = "string";
var useCudaStr = "";
var translater = "google";
var NOA_Limit = 3;
var origenalDirPathSet = [];
const cache = {
    data: {},
    put(key, data) {
        this.data[key] = data;
    },
    get(key) {
        return this.data[key];
    }
}
function main() {
    let multirigenalDirPathConfig = process.cwd() + "/multiDir.json";
    /**
     * 标识阐述.
     * -m:文件夹json;
     * -use-cuda:使用cuda;
     * -t:翻译者,默认为google;
     * -a:signalExec()的尝试次数,默认为3;
     */
    for (let i = 0; i < argv.length; i++) {
        switch (argv[i]) {
            case "-m":
                multirigenalDirPathConfig = argv[i + 1];
                break;
            case "--use-cuda":
                useCudaStr = "--use-cuda";
                break;
            case "-t":
                translater = argv[i + 1];
                break;
            case "-a":
                NOA_Limit = parseInt(argv[i + 1]);
                break;
        }
    }
    ioHead.logPrint({
        "message": fileSign + "main():status.",
        "data": {
            "parameters": {
                "numberOfAttempts": NOA_Limit,
                "translater": translater,
                "multirigenalDirPathConfig": multirigenalDirPathConfig,
                "useCuda": (useCudaStr == "--use-cuda") ? true : false
            },
            "env": {
                "cwd": process.cwd(),
                "__DIR__": __dirname
            }
        }
    });
    origenalDirPathSet = JSON.parse(readFileSync(multirigenalDirPathConfig).toString());
    ioHead.logPrint({
        "message": fileSign + "main():dirSet.",
        "data": origenalDirPathSet
    });
    for (let i = 0; i < origenalDirPathSet.length; i++) {
        ioHead.logPrint({
            "message": fileSign + "main():handle dir:" + origenalDirPathSet[i]
        });
        cache.put(origenalDirPathSet[i], uuidv4());
        execSync(__dirname + "/../../bin/handleDir.bash -p \"" + origenalDirPathSet[i] + "\" -t " + translater + " -a " + NOA_Limit + " " + useCudaStr);
        copyFileSync(handleDir_js_config.logDir.main + "/latest.log", config.tmpDir + "/manga-image-translator." + cache.get(origenalDirPathSet[i]) + ".tmp");
    }
    let skipItemsSet = {};
    for (let i = 0; i < origenalDirPathSet.length; i++) {
        ioHead.logPrint({
            "message": fileSign + "main():read log:" + config.tmpDir + "/manga-image-translator." + cache.get(origenalDirPathSet[i]) + ".tmp"
        });
        let log = readFileSync(config.tmpDir + "/manga-image-translator." + cache.get(origenalDirPathSet[i]) + ".tmp").toString();
        let logLines = log.split("\n");
        let latestLine = JSON.parse(logLines[logLines.length - 2]);
        skipItemsSet[origenalDirPathSet[i]] = latestLine["data"];
        unlinkSync(config.tmpDir + "/manga-image-translator." + cache.get(origenalDirPathSet[i]) + ".tmp");
    }
    ioHead.logPrint({
        "message": fileSign + "main():skipItems.",
        "data": skipItemsSet
    });
}
main();