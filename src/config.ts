export const PixelFormats = ['gray16', 'gray256', 'rgb332', 'rgb565be', 'rgb565le'];

export interface Module {
    name: string;
    description: string;
    debugFlag: boolean;
    makeFlag: boolean;
    isHost: boolean;
    folderPath: string;
}

export interface Target {
    name: string;
    description: string;
    platform: string;
    // formatFlag: boolean;
    // formatStr: string;
    // rotationFlag: boolean;
    // rotation: number;
    wipeCommand: string;
}

export interface ConfigObject {
    debug: boolean;
    modules: Module[];
    targets: Target[];
}

export const defaultConfig: ConfigObject = {
    "debug": false,
    "modules": [],
    "targets": [],
}

export const emptyModule: Module = {
    "name": "",
    "description": "",
    "isHost": false,
    "debugFlag": true,
    "makeFlag": true,
    "folderPath": "",
}

export const emptyTarget: Target = {
    "name": "",
    "description": "",
    "platform": "",
    // "formatFlag": false,
    // formatStr: '',
    // rotationFlag: false,
    // "rotation": 0,
    "wipeCommand": "",
}