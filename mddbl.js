#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./config");
var chalk = require('chalk');
var fs = require('fs');
var logger = require('cli-logger');
var os = require('os');
var path = require('path');
var program = require('commander');
var shell = require('shelljs');
var cp = require("child_process");
var packageDotJSON = require('./package.json');
var APP_NAME = '\nModdable Helper (mddbl)';
var APP_AUTHOR = 'by John M. Wargo (https://johnwargo.com)';
var CONFIG_FILE_NAME = 'mddbl.json';
var CURRENT_PATH = process.cwd();
var EXIT_HEADING = chalk.red('Exiting:');
var appConfig;
var configFilePath;
var log = logger();
function checkFile(filePath) {
    log.debug("Locating " + filePath);
    try {
        return fs.existsSync(filePath);
    }
    catch (err) {
        log.error("checkFile error: " + err);
        return false;
    }
}
function checkDirectory(filePath) {
    log.debug("Locating " + filePath);
    if (fs.existsSync(filePath)) {
        try {
            var stats = fs.statSync(filePath);
            if (stats) {
                return stats.isDirectory;
            }
            else {
                return false;
            }
        }
        catch (err) {
            log.error("checkDirectory error: " + err);
            return false;
        }
    }
    else {
        return false;
    }
}
function executeCommand(folder, cmd) {
    log.debug("executeCommand(" + cmd + ")");
    try {
        log.info(chalk.yellow('Executing:'), cmd);
        cp.execSync(cmd, { stdio: 'inherit' });
    }
    catch (e) {
        log.warn(e);
    }
}
function deployModule(modName, targetName) {
    console.log("Deploying " + modName + " to " + targetName);
    var mod = appConfig.modules.find(function (item) { return item.name === modName; });
    var target = appConfig.targets.find(function (item) { return item.name === targetName; });
    if (mod && target) {
        if (mod.isHost) {
            executeCommand(target.folderPath, "mcconfig");
        }
        else {
            executeCommand(target.folderPath, "mcrun");
        }
    }
    else {
    }
}
function wipeDevice(targetName) {
    console.log("Wiping " + targetName);
}
function listArray(listStr, theList) {
    if (theList.length > 0) {
        log.info("\nConfigured " + listStr + ":");
        for (var item in theList) {
            var outputStr = "- " + theList[item].name;
            if (theList[item].description) {
                outputStr += ": " + theList[item].description;
            }
            log.info(outputStr);
        }
    }
    else {
        log.info("\nNo " + listStr + " configured");
    }
}
function listModules() {
    listArray('Modules', appConfig.modules);
}
function listTargets() {
    listArray('Targets', appConfig.targets);
}
function editConfig() {
    log.info('Editing module configuration');
    var cmdStr = (os.type().indexOf('Win') === 0) ? "start " + configFilePath : "open -e ./" + configFilePath;
    cp.exec(cmdStr, function (error, stdout, stderr) {
        if (error) {
            log.error('Unable to edit configuration');
            log.error(error);
            return;
        }
        if (stdout) {
            log.info(stdout);
        }
        if (stderr) {
            log.error(stderr);
        }
    });
}
function initConfig() {
    log.info('Initializing project folder...');
    appConfig = Object.assign({}, config_1.defaultConfig);
    if (writeConfig()) {
        log.info("Successfully created configuration file (" + CONFIG_FILE_NAME + ")");
    }
}
function readConfig() {
    log.debug('Reading configuration');
    if (fs.existsSync(configFilePath)) {
        var rawData = fs.readFileSync(configFilePath);
        appConfig = JSON.parse(rawData);
        return true;
    }
    return false;
}
function writeConfig() {
    function compare(a, b) {
        return a.name > b.name ? 1 : -1;
    }
    log.debug("Writing configuration to " + configFilePath);
    appConfig.modules.sort(compare);
    appConfig.targets.sort(compare);
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
function showConfig() {
    log.info('\nModule configuration:');
    log.info(JSON.stringify(appConfig, null, 2));
}
console.log(APP_NAME);
program.version(packageDotJSON.version);
program.option('--debug', 'Output extra information during operation');
program
    .command('deploy <module> <target>')
    .description('Deploy <module> to specific <target>')
    .action(function (mod, target) {
    deployModule(mod, target);
});
program
    .command('wipe <target>')
    .description('Wipes the <target> device')
    .action(function (target) {
    wipeDevice(target);
});
var configCmd = program.command('config')
    .description("Work with the module's configuration");
configCmd
    .command('init')
    .description('Initialize the current folder (create module config file')
    .action(initConfig);
configCmd
    .command('edit')
    .description('Edit the module\'s configuration file')
    .action(editConfig);
configCmd
    .command('sort')
    .description('Sorts the config arrays')
    .action(writeConfig);
configCmd
    .command('show')
    .description('Print the modules config to the console')
    .action(showConfig);
var listCmd = program.command('list')
    .description('List configuration objects');
listCmd
    .command('modules')
    .description('List all configured modules')
    .action(listModules);
listCmd
    .command('targets')
    .description('List all configured targets')
    .action(listTargets);
configFilePath = path.join(CURRENT_PATH, CONFIG_FILE_NAME);
if (!readConfig()) {
    log.info("\nConfiguration file not found (" + configFilePath + ")");
    log.info("Execute " + chalk.yellow('`mdbbl config init`') + " to create one here");
    process.exit(1);
}
program.parse();
var options = program.opts();
if (options.debug) {
    log.level(log.DEBUG);
}
else {
    log.level(log.INFO);
}
log.debug(APP_AUTHOR);
log.debug("Version: " + packageDotJSON.version);
log.debug('Command Options:', options);
log.debug("Working directory: " + CURRENT_PATH);
log.debug("Configuration file: " + configFilePath);
