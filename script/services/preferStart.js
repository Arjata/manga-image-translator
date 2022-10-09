import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from 'node:url';
import path from "node:path";
import { exit } from "node:process";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
if (!existsSync(__dirname + "/tmp/state.json")) exit(9100000000);
const state = JSON.parse(readFileSync(__dirname + "/tmp/state.json").toString()).state;
if (state) {
    exit(9200000001);
} else {
    exit(9200000002);
}