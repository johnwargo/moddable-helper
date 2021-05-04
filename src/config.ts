export const PixelFormats = ['gray16', 'gray256', 'rgb332', 'rgb565be', 'rgb565le'];

export interface Module {
    name: string;
    description: string;
    debugFlag: boolean;
    makeFlag: boolean;
    platformFlag: boolean;
    isHost: boolean;
    folderPath: string;
}

export interface Target {
    name: string;
    description: string;
    platform: string;
    // format: string;
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
    "platformFlag": true,
    "folderPath": "",
}

export const emptyTarget: Target = {
    "name": "",
    "description": "",
    "platform": "",
    // "format": "",
    // "rotation": 0,
    "wipeCommand": "",
}