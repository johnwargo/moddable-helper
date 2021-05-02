export const PixelFormats = ['gray16', 'gray256', 'rgb332', 'rgb565be', 'rgb565le'];

export interface Module {
    name: string;
    description: string;
    // debugBuild: boolean;
    // runMake: boolean;
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
    editCommand: string;
    modules: Module[];
    targets: Target[];
}

export const defaultConfig: ConfigObject = {
    "debug": false,
    "editCommand": "",
    "modules": [],
    "targets": [],
}

export const emptyModule: Module = {
    "name": "",
    "description": "",
    //  "debugBuild": true,
    //  "runMake": true,
    "isHost": false,
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