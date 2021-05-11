#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./config");
var chalk = require('chalk');
var fs = require('fs');
var logger = require('cli-logger');
var os = require('os');
var path = require('path');
var program = require('commander');
var Select = require('enquirer').Select;
var cp = require("child_process");
var packageDotJSON = require('./package.json');
var APP_NAME = '\nModdable Helper (mddbl)';
var APP_AUTHOR = 'by John M. Wargo (https://johnwargo.com)';
var CONFIG_FILE_NAME = 'mddbl.json';
var CHECK_CONFIG_STRING = "not defined, please check the module configuration (" + CONFIG_FILE_NAME + ")";
var WORKING_PATH = process.cwd();
var appConfig;
var configFilePath;
var log = logger();
function checkDirectory(filePath) {
    log.debug("Locating " + filePath);
    if (fs.existsSync(filePath)) {
        try {
            var stats = fs.statSync(filePath);
            if (stats)
                return stats.isDirectory;
        }
        catch (err) {
            log.error("checkDirectory error: " + err);
        }
    }
    return false;
}
function showObjectProperties(itemName, type) {
    log.debug("showObjectValues(" + itemName + ", " + type + ")");
    configRead();
    var theArray = type === 'Module' ? appConfig.modules : appConfig.targets;
    var obj = theArray.find(function (item) { return item.name === itemName; });
    if (!obj) {
        log.error(type + " '" + itemName + "' " + CHECK_CONFIG_STRING);
        return;
    }
    log.info("Configuration for the '" + obj.name + "' " + type + ":");
    console.dir(obj);
}
function listArrayNames(listStr, theList) {
    log.debug('listArray()');
    if (theList.length > 0) {
        log.info("\nConfigured " + listStr + ":");
        for (var item in theList) {
            var outputStr = "- " + theList[item].name;
            if (theList[item].description) {
                outputStr += " - " + theList[item].description;
            }
            log.info(outputStr);
        }
    }
    else {
        log.info("\nNo " + listStr + " configured");
        process.exit(1);
    }
}
function deleteArrayItem(typeStr, theArray, compareStr) {
    var idx = -1;
    for (var i = 0; i < theArray.length; i++) {
        if (idx < 0) {
            log.debug(i + ": " + theArray[i].name);
            if (theArray[i].name == compareStr) {
                log.debug("Found match at index " + idx);
                idx = i;
            }
        }
    }
    if (idx > -1) {
        theArray.splice(idx, 1);
    }
    else {
        log.error(typeStr + " '" + compareStr + "' " + CHECK_CONFIG_STRING);
        process.exit(1);
    }
    return theArray;
}
function configEdit() {
    log.info('Editing module configuration');
    console.log(configFilePath);
    var cmdStr = (os.type().indexOf('Win') === 0)
        ? "start " + CONFIG_FILE_NAME
        : "open -e ./" + CONFIG_FILE_NAME;
    cp.exec(cmdStr, function (error, stdout, stderr) {
        if (error) {
            log.error('Unable to edit configuration');
            log.error(error);
            process.exit(1);
        }
        if (stdout) {
            log.info(stdout);
        }
        if (stderr) {
            log.error(stderr);
        }
    });
}
function configInit() {
    log.info('Initializing project folder...');
    appConfig = Object.assign({}, config_1.defaultConfig);
    if (configWrite()) {
        log.info("Successfully created configuration file (" + CONFIG_FILE_NAME + ")");
    }
    else {
        process.exit(1);
    }
}
function configRead() {
    log.info('Reading configuration file');
    if (fs.existsSync(configFilePath)) {
        try {
            var rawData = fs.readFileSync(configFilePath);
            appConfig = JSON.parse(rawData);
        }
        catch (err) {
            log.error("readConfig error: " + err);
            process.exit(1);
        }
        var logLevel = appConfig.debug ? log.DEBUG : log.INFO;
        log.level(logLevel);
        log.debug('\nProgram Information (debug)');
        log.debug(APP_AUTHOR);
        log.debug("Version: " + packageDotJSON.version);
        log.debug('Command Options:', program.opts());
        log.debug("Working directory: " + WORKING_PATH);
        log.debug("Configuration file: " + configFilePath + "\n");
    }
    else {
        log.info("\nConfiguration file not found (" + configFilePath + ")");
        log.info("Execute " + chalk.yellow('`mdbbl config init`') + " to create one here");
        process.exit(1);
    }
}
function configWrite() {
    log.info("Writing configuration to " + configFilePath);
    var data = JSON.stringify(appConfig, null, 2);
    try {
        fs.writeFileSync(configFilePath, data);
        log.debug('Configuration file successfully written to disk');
    }
    catch (err) {
        log.error('Unable to write to configuration file');
        log.error(err);
        return false;
    }
    return true;
}
function configShow() {
    log.debug('showConfig()');
    configRead();
    log.info('\nModule configuration:');
    console.dir(appConfig);
}
function configSort() {
    function compare(a, b) {
        return a.name > b.name ? 1 : -1;
    }
    configRead();
    if (appConfig) {
        appConfig.modules.sort(compare);
        appConfig.targets.sort(compare);
        if (!configWrite()) {
            process.exit(1);
        }
    }
}
function debugToggle() {
    log.debug('toggleDebug()');
    configRead();
    if (appConfig) {
        log.debug("Toggling Debug configuration parameter to " + !appConfig.debug);
        appConfig.debug = !appConfig.debug;
        if (!configWrite()) {
            process.exit(1);
        }
    }
}
function doDeploy(rootCmd, mod, target) {
    log.debug("doDeploy(" + rootCmd + ", " + mod.name + ", " + target.name + ")");
    var folder = mod.folderPath;
    if (!checkDirectory(folder)) {
        log.error("Specified module folder (" + folder + ") does not exist");
        process.exit(1);
    }
    var cmd = rootCmd + ' ';
    if (mod.debugFlag)
        cmd += '-d ';
    if (mod.makeFlag)
        cmd += '-m ';
    if (target)
        cmd += "-p " + target.platform + " ";
    if (target.formatFlag) {
        cmd += "-f ";
        if (target.formatStr.length > 0)
            cmd += target.formatStr + " ";
    }
    if (target.rotationFlag) {
        cmd += "-r ";
        if (target.rotationValue > -1)
            cmd += target.rotationValue + " ";
    }
    log.debug("Command: " + cmd);
    try {
        log.info(chalk.yellow("Changing to the '" + folder + "' directory"));
        process.chdir(folder);
        log.debug("Current directory: " + process.cwd());
        log.info(chalk.yellow('Executing:') + " " + cmd);
        cp.execSync(cmd, { stdio: 'inherit' });
        log.info(chalk.yellow("Changing back to the '" + WORKING_PATH + "' directory"));
        process.chdir(WORKING_PATH);
    }
    catch (e) {
        log.error(chalk.red(e));
        process.exit(1);
    }
}
function deployModule(modName, targetName) {
    log.debug("deployModule(" + modName + ", " + targetName + ")");
    if (!appConfig)
        configRead();
    var mod = appConfig.modules.find(function (item) { return item.name === modName; });
    if (!mod) {
        log.error("ERROR: Module '" + modName + "' " + CHECK_CONFIG_STRING);
        process.exit(1);
    }
    if (!mod.folderPath) {
        log.error("ERROR: Module path '" + mod.folderPath + "' " + CHECK_CONFIG_STRING);
        process.exit(1);
    }
    var target;
    if (targetName) {
        target = appConfig.targets.find(function (item) { return item.name === targetName; });
        if (!target) {
            log.error("ERROR: Target '" + targetName + "' " + CHECK_CONFIG_STRING);
            process.exit(1);
        }
        if (!target.platform) {
            log.error("ERROR: Target platform '" + target.platform + "' " + CHECK_CONFIG_STRING);
            process.exit(1);
        }
        if (target.rotationFlag && target.rotationValue &&
            !(target.rotationValue == 0 || target.rotationValue == 90 || target.rotationValue == 180 || target.rotationValue == 270)) {
            log.error("ERROR: Invalid Target rotation value (" + target.rotationValue + ")");
            process.exit(1);
        }
    }
    else {
        log.error('ERROR: Missing Target value on command line');
        process.exit(1);
    }
    console.log("Deploying " + modName + " to " + targetName);
    if (mod.isHost) {
        doDeploy('mcconfig', mod, target);
    }
    else {
        doDeploy('mcrun', mod, target);
    }
}
function deployInteractive() {
    return __awaiter(this, void 0, void 0, function () {
        var modPrompt, targetPrompt, modName, targetName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log.debug('Deploying in interactive mode');
                    configRead();
                    if (appConfig.modules.length < 1) {
                        log.error("Module list " + CHECK_CONFIG_STRING);
                        process.exit(1);
                    }
                    if (appConfig.targets.length < 1) {
                        log.error("Module list " + CHECK_CONFIG_STRING);
                        process.exit(1);
                    }
                    modPrompt = new Select({
                        name: 'modName',
                        message: 'Module Selection',
                        choices: appConfig.modules
                    });
                    targetPrompt = new Select({
                        name: 'targetName',
                        message: 'Target Selection',
                        choices: appConfig.targets
                    });
                    modName = '';
                    targetName = '';
                    return [4, modPrompt.run()
                            .then(function (result) {
                            modName = result.toString();
                        })
                            .catch(function (err) {
                            log.error(err);
                            process.exit(1);
                        })];
                case 1:
                    _a.sent();
                    return [4, targetPrompt.run()
                            .then(function (result) {
                            targetName = result.toString();
                        })
                            .catch(function (err) {
                            log.error(err);
                            process.exit(1);
                        })];
                case 2:
                    _a.sent();
                    if (modName.length > 0 && targetName.length > 0) {
                        deployModule(modName, targetName);
                    }
                    return [2];
            }
        });
    });
}
function moduleAdd(modName) {
    return __awaiter(this, void 0, void 0, function () {
        var newMod;
        return __generator(this, function (_a) {
            log.debug("moduleAdd(" + modName + ")");
            configRead();
            newMod = Object.assign({}, config_1.emptyModule);
            newMod.name = modName;
            appConfig.modules.push(newMod);
            configWrite();
            configEdit();
            return [2];
        });
    });
}
function moduleRemove(modName) {
    log.debug("moduleRemove(" + modName + ")");
    configRead();
    appConfig.modules = deleteArrayItem('Module', appConfig.modules, modName);
    configWrite();
}
function moduleShow(modName) {
    log.debug("moduleShow(" + modName + ")");
    showObjectProperties(modName, 'Module');
}
function modulesList() {
    log.debug('modulesList()');
    configRead();
    listArrayNames('Modules', appConfig.modules);
}
function targetAdd(targetName) {
    log.debug('targetAdd()');
    configRead();
    var newTarget = Object.assign({}, config_1.emptyTarget);
    newTarget.name = targetName;
    appConfig.targets.push(newTarget);
    configWrite();
    configEdit();
}
function targetRemove(targetName) {
    log.debug("targetRemove(" + targetName + ")");
    configRead();
    appConfig.targets = deleteArrayItem('Target', appConfig.targets, targetName);
    configWrite();
}
function targetShow(targetName) {
    log.debug("targetShow(" + targetName + ")");
    showObjectProperties(targetName, 'Target');
}
function targetsList() {
    configRead();
    listArrayNames('Targets', appConfig.targets);
}
function wipeDevice(targetName) {
    log.debug("wipeDevice(" + targetName + ")");
    configRead();
    var target = appConfig.targets.find(function (item) { return item.name === targetName; });
    if (!target) {
        log.error("Target '" + targetName + "' " + CHECK_CONFIG_STRING);
        process.exit(1);
    }
    if (!target.wipeCommand) {
        log.error("Target wipe command '" + target.wipeCommand + "' " + CHECK_CONFIG_STRING);
        process.exit(1);
    }
    try {
        console.log("Wiping " + targetName);
        cp.execSync(target.wipeCommand, { stdio: 'inherit' });
    }
    catch (e) {
        log.error(chalk.red(e));
        process.exit(1);
    }
}
console.log(APP_NAME);
configFilePath = path.join(WORKING_PATH, CONFIG_FILE_NAME);
program.version(packageDotJSON.version);
program.option('--debug', 'Output extra information during operation');
var configCmd = program.command('config')
    .description("Work with the module's configuration");
configCmd
    .command('edit')
    .description('Edit the module\'s configuration file')
    .action(configEdit);
configCmd
    .command('show')
    .description('Print the modules config to the console')
    .action(configShow);
configCmd
    .command('sort')
    .description('Sorts the config modules and targets arrays')
    .action(configSort);
program
    .command('debug')
    .description('Toggle the debug configuration setting')
    .action(debugToggle);
program
    .command('deploy [module] [target]')
    .description('Deploy Module to specified Target device')
    .action(function (module, target) {
    if (module) {
        deployModule(module, target);
    }
    else {
        deployInteractive();
    }
});
program
    .command('init')
    .description('Initialize the current folder (create module config file)')
    .action(configInit);
var moduleCmd = program.command('module')
    .description('Work with the modules configuration');
moduleCmd
    .command('add <module>')
    .description('Add an empty module to the configuration file')
    .action(function (module) {
    moduleAdd(module);
});
moduleCmd
    .command('rm <module>')
    .description('Remove a module from the configuration file')
    .action(function (module) {
    moduleRemove(module);
});
moduleCmd
    .command('show <module>')
    .description('Show a module configuration')
    .action(function (module) {
    moduleShow(module);
});
program
    .command('modules')
    .description('List all configured Modules')
    .action(modulesList);
var targetCmd = program.command('target')
    .description('Work with the targets configuration');
targetCmd
    .command('add <target>')
    .description('Add an empty target to the configuration file')
    .action(function (target) {
    targetAdd(target);
});
targetCmd
    .command('rm <target>')
    .description('Remove a target from the configuration file')
    .action(function (target) {
    targetRemove(target);
});
targetCmd
    .command('show <target>')
    .description('Show a target configuration')
    .action(function (target) {
    targetShow(target);
});
program
    .command('targets')
    .description('List all configured Targets')
    .action(targetsList);
program
    .command('wipe <target>')
    .description('Wipes the <target> device')
    .action(function (target) {
    wipeDevice(target);
});
program.parse();
