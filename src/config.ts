export interface ConfigObject {
    editCommand: string;
    modules: any[];
    targets: any[];
};

export const defaultConfig: ConfigObject = {
    editCommand: '',
    modules: [],
    targets: []
}
