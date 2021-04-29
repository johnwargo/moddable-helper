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
var CONFIG_FILE_NAME = '.mddbl';
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
function deployModule(mod, target) {
    console.log("Deploying " + mod + " to " + target);
}
function wipeDevice(target) {
    console.log("Wiping " + target);
}
function listToConsole(listStr, theList) {
    if (theList.length > 0) {
        log.info("\nConfigured " + listStr + ":");
        theList.sort();
        theList.forEach(function (value) {
            log.info("- " + value);
        });
    }
    else {
        log.info("\nNo " + listStr + " configured");
    }
}
function listModules() {
    listToConsole('modules', appConfig.modules);
}
function listTargets() {
    listToConsole('targets', appConfig.targets);
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
            log.info(stderr);
        }
    });
}
function readConfig() {
    log.debug("Reading configuration from " + configFilePath);
    if (fs.existsSync(configFilePath)) {
        var rawData = fs.readFileSync(configFilePath);
        appConfig = JSON.parse(rawData);
        return true;
    }
    else {
        appConfig = Object.assign({}, config_1.defaultConfig);
        if (writeConfig()) {
            return true;
        }
        ;
    }
    return false;
}
function writeConfig() {
    log.debug("Writing configuration to " + configFilePath);
    appConfig.modules.sort();
    appConfig.targets.sort();
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
    log.info('Module configuration:');
    console.log(JSON.stringify(appConfig, null, 2));
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
    .command('edit')
    .description("Edit the module's configuration file")
    .action(editConfig);
configCmd
    .command('show')
    .description("Print the modules config to the console")
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
configFilePath = path.join(os.homedir(), CONFIG_FILE_NAME);
if (readConfig()) {
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
    log.debug("Configuration file: " + configFilePath);
}
else {
    log.info(chalk.red('Unable to locate or create the module\'s configuration file'));
    log.info("Configuration file: " + configFilePath);
    process.exit(1);
}
