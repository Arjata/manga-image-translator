import path from "node:path";
import { ioUnit } from "../io/ioUnit.js";
import { fileURLToPath } from 'node:url';
import { exec, execSync } from "node:child_process";
import { walkSync, getArrDS, Utf8ArrayToStr, errorFormat, getArrDS_S } from "../globalFunctions.js";
import { unlinkSync, readFileSync, copyFileSync } from "node:fs";
import { v4 as uuidv4 } from 'uuid';
import { argv } from "node:process";
function signalExec(file, select) {
    let signalCmd = "python ./translate_demo.py " + useCudaStr + " --verbose --use-inpainting --translator=" + translater + " --target-lang=CHS --image \"" + file + "\"";
    ioHead.logPrint({
        "message": fileSign + "signalExec():running cmd:" + signalCmd
    });
    try {
        let programSTDOUT = execSync(signalCmd, { cwd: __dirname + "/../../../" });
        ioHead.logPrint({
            "message": fileSign + "signalExec():done.this is program STDOUT.",
            "data": Utf8ArrayToStr(JSON.parse(JSON.stringify(programSTDOUT))["data"])
        });
        let formatImageOutFile = config["tmpDir"] + "/manga-image-translator." + uuidv4() + ".tmp";
        let formatImageCmd = "python " + __dirname + "/../format/transfromImageFormat.py " + formatImageOutFile + " " + fileFormat;
        ioHead.logPrint({
            "message": fileSign + "signalExec():runnning command:" + formatImageCmd
        });
        execSync(formatImageCmd);
        ioHead.logPrint({
            "message": fileSign + "signalExec():copy " + formatImageOutFile + " to " + translatedDirPath + "/" + itemDS[select]
        })
        let toFile = translatedDirPath + "/" + itemDS[select];
        copyFileSync(formatImageOutFile, toFile);
        unlinkSync(formatImageOutFile);
        ioHead.logPrint({
            "message": fileSign + "signalExec():deleted file:" + formatImageOutFile
        });
        unlinkSync(__dirname + "/../../../result/final.png");
        ioHead.logPrint({
            "message": fileSign + "signalExec():deleted file:" + __dirname + "/../../../result/final.png"
        });
        return 0;
    } catch (error) {
        console.warn(error);
        ioHead.warnPrint({
            "state": false,
            "message": fileSign + "signalExec():happen a error when executed execSync().",
            "data": errorFormat(JSON.parse(JSON.stringify(error)))
        });
        return -1;
    }
}
function loop() {
    for (; ;) {
        origenalDirItem = [];
        translatedDirItem = [];
        itemDS = [];
        //获取原,翻译文件夹中的所有项目.
        walkSync(origenalDirPath, function (filePath, stat) {
            origenalDirItem.push(filePath);
        });
        walkSync(translatedDirPath, function (filePath, stat) {
            translatedDirItem.push(filePath);
        });
        let buffer = origenalDirItem[0].split(".");
        fileFormat = buffer[buffer.length - 1];
        let perferItemDS = getArrDS(origenalDirItem, translatedDirItem);
        itemDS = getArrDS_S(skipItems, perferItemDS);
        ioHead.logPrint({
            "message": fileSign + "loop():items.",
            "data": {
                "origenalItems": origenalDirItem,
                "translatedItems": translatedDirItem,
                "skipItems": skipItems,
                "differentItems": itemDS
            }
        });
        ioHead.logPrint({
            "message": fileSign + "loop():different file's size:" + itemDS.length
        });
        if (itemDS.length == 0) break;
        for (let i = 0; i < itemDS.length; i++) {
            ioHead.logPrint({
                "message": fileSign + "loop():handling file:" + origenalDirPath + "/" + itemDS[i]
            });
            let returnCode = signalExec(origenalDirPath + "/" + itemDS[i], i)
            if (returnCode != 0) {
                i--;
                NOA++;
                if (NOA >= NOA_Limit) {
                    i++;
                    skipItems.push(itemDS[i]);
                    NOA = 0;
                    ioHead.warnPrint({
                        "message": fileSign + "loop():try " + NOA_Limit + " times,skip.",
                        "annix": {
                            "item": itemDS[i]
                        }
                    });
                } else {
                    ioHead.logPrint({
                        "message": fileSign + "loop():try again,times is " + (NOA + 1),
                        "annix": {
                            "item": itemDS[i + 1]
                        }
                    });
                }
            }
        }
    }
}
//初始化.
const fileSign = "src/enter/handleDir.js:";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const config = JSON.parse(readFileSync(__dirname + "/../../config.json"));
const ioHead = new ioUnit(config["logDir"] + "/" + "latest.log");
ioHead.dateType = "string";
var origenalDirPath = path.resolve("./");
var origenalDirItem = [];
var useCudaStr = "";
var translater = "google";
var NOA = 0;
var NOA_Limit = 3;
/**
 * 标识阐述.
 * -p:文件夹路径;
 * -use-cuda:使用cuda;
 * -t:翻译者,默认为google;
 * -a:signalExec()的尝试次数,默认为3;
 */
for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
        case "-p":
            origenalDirPath = argv[i + 1];
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
var translatedDirPath = origenalDirPath + "-translated";
var translatedDirItem = [];
var fileFormat = "";
var itemDS = [];
var skipItems = [];
//打印当前状态.
ioHead.logPrint({
    "message": fileSign + "main():status.",
    "data": {
        "parameters": {
            "numberOfAttempts": NOA_Limit,
            "translater": translater,
            "origenalDirPath": origenalDirPath,
            "useCuda": (useCudaStr == "--use-cuda") ? true : false
        },
        "env": {
            "cwd": process.cwd(),
            "__DIR__": __dirname
        }
    }
});
//初次执行.
let fristCmd = "python ./translate_demo.py " + useCudaStr + " --verbose --mode batch --use-inpainting --translator=" + translater + " --target-lang=CHS --image \"" + origenalDirPath + "\"";
ioHead.logPrint({
    "message": fileSign + "main():running cmd:" + fristCmd
});
try {
    let programSTDOUT = execSync(fristCmd, { cwd: __dirname + "/../../../" });
    ioHead.logPrint({
        "message": fileSign + "main():done.this is program STDOUT.",
        "data": Utf8ArrayToStr(JSON.parse(JSON.stringify(programSTDOUT))["data"])
    });
} catch (error) {
    ioHead.warnPrint({
        "state": false,
        "message": fileSign + "main():happen a error when executed execSync().",
        "data": errorFormat(JSON.parse(JSON.stringify(error)))
    });
}
loop();
ioHead.logPrint({
    "message": fileSign + "main():skipItems",
    "data": skipItems
});