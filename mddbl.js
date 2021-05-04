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
var cp = require("child_process");
var packageDotJSON = require('./package.json');
var APP_NAME = '\nModdable Helper (mddbl)';
var APP_AUTHOR = 'by John M. Wargo (https://johnwargo.com)';
var CONFIG_FILE_NAME = 'mddbl.json';
var CHECK_CONFIG_STRING = "please check the module configuration (" + CONFIG_FILE_NAME + ")";
var WORKING_PATH = process.cwd();
var appConfig;
var configFilePath;
var log = logger();
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
function toggleDebug() {
    log.debug('toggleDebug()');
    readConfig();
    if (appConfig) {
        log.debug("Toggling Debug configuration parameter to " + !appConfig.debug);
        appConfig.debug = !appConfig.debug;
        if (!writeConfig()) {
            process.exit(1);
        }
    }
}
function doDeploy(rootCmd, mod, target) {
    log.debug("executeCommand(" + rootCmd + ", " + mod.name + ", " + target.name + ")");
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
    if (mod.platformFlag)
        cmd += "-p " + target.platform + " ";
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
    readConfig();
    var mod = appConfig.modules.find(function (item) { return item.name === modName; });
    if (!mod) {
        log.error("Module '" + modName + "' not defined, " + CHECK_CONFIG_STRING);
        process.exit(1);
    }
    if (!mod.folderPath) {
        log.error("Module path '" + mod.folderPath + "' not defined, " + CHECK_CONFIG_STRING);
        process.exit(1);
    }
    var target = appConfig.targets.find(function (item) { return item.name === targetName; });
    if (!target) {
        log.error("Target '" + targetName + "' not defined, " + CHECK_CONFIG_STRING);
        process.exit(1);
    }
    if (!target.platform) {
        log.error("Target platform '" + target.platform + "' not defined, " + CHECK_CONFIG_STRING);
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
function wipeDevice(targetName) {
    log.debug("wipeDevice(" + targetName + ")");
    readConfig();
    var target = appConfig.targets.find(function (item) { return item.name === targetName; });
    if (!target) {
        log.error("Target '" + targetName + "' not defined, " + CHECK_CONFIG_STRING);
        process.exit(1);
    }
    if (!target.wipeCommand) {
        log.error("Target wipe command '" + target.wipeCommand + "' not defined, " + CHECK_CONFIG_STRING);
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
function listArray(listStr, theList) {
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
function listModules() {
    readConfig();
    listArray('Modules', appConfig.modules);
}
function listTargets() {
    readConfig();
    listArray('Targets', appConfig.targets);
}
function editConfig() {
    log.info('Editing module configuration');
    var cmdStr = (os.type().indexOf('Win') === 0)
        ? "start " + configFilePath
        : "open -e ./" + configFilePath;
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
function initConfig() {
    log.info('Initializing project folder...');
    appConfig = Object.assign({}, config_1.defaultConfig);
    if (writeConfig()) {
        log.info("Successfully created configuration file (" + CONFIG_FILE_NAME + ")");
    }
    else {
        process.exit(1);
    }
}
function readConfig() {
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
function writeConfig() {
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
function showConfig() {
    log.debug('showConfig()');
    readConfig();
    log.info('\nModule configuration:');
    console.dir(appConfig);
}
function sortConfig() {
    function compare(a, b) {
        return a.name > b.name ? 1 : -1;
    }
    readConfig();
    if (appConfig) {
        appConfig.modules.sort(compare);
        appConfig.targets.sort(compare);
        if (!writeConfig()) {
            process.exit(1);
        }
    }
}
console.log(APP_NAME);
configFilePath = path.join(WORKING_PATH, CONFIG_FILE_NAME);
program.version(packageDotJSON.version);
program.option('--debug', 'Output extra information during operation');
program
    .command('debug')
    .description('Toggle the debug configuration setting')
    .action(toggleDebug);
program
    .command('deploy <module> <target>')
    .description('Deploy <module> to specific <target>')
    .action(function (mod, target) {
    deployModule(mod, target);
});
program
    .command('init')
    .description('Initialize the current folder (create module config file')
    .action(initConfig);
program
    .command('wipe <target>')
    .description('Wipes the <target> device')
    .action(function (target) {
    wipeDevice(target);
});
var configCmd = program.command('config')
    .description("Work with the module's configuration");
configCmd
    .command('edit')
    .description('Edit the module\'s configuration file')
    .action(editConfig);
configCmd
    .command('show')
    .description('Print the modules config to the console')
    .action(showConfig);
configCmd
    .command('sort')
    .description('Sorts the config modules and targets arrays')
    .action(sortConfig);
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
program.parse();
