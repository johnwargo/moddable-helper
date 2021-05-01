"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyTarget = exports.emptyModule = exports.defaultConfig = exports.PixelFormats = void 0;
exports.PixelFormats = ['gray16', 'gray256', 'rgb332', 'rgb565be', 'rgb565le'];
exports.defaultConfig = {
    "debug": false,
    "editCommand": "",
    "modules": [],
    "targets": [],
};
exports.emptyModule = {
    "name": "",
    "description": "",
    "isHost": false,
    "folderPath": "",
};
exports.emptyTarget = {
    "name": "",
    "description": "",
    "platform": "",
    "format": "",
    "rotation": 0,
    "wipeCommand": "",
};
