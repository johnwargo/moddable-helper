export const PixelFormats = ['gray16', 'gray256', 'rgb332', 'rgb565be', 'rgb565le'];

export interface Module {
    name: string;
    description: string;
    folderPath: string;
}

export interface Target {
    name: string;
    platform: string;
    format: string;
    rotation: number;
}

export interface ConfigObject {
    editCommand: string;
    modules: Module[];
    targets: Target[];
}

export const defaultConfig: ConfigObject = {
    editCommand: '',
    modules: [],
    targets: []
}

export const emptyModule: Module = {
    name: '',
    description: '',
    folderPath: ''
}

export const emptyTarget: Target = {
    name: '',
    platform: '',
    format: '',
    rotation: 0
}