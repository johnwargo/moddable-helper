#!/usr/bin/env node
"use strict";
var chalk = require('chalk');
var fs = require('fs');
var logger = require('cli-logger');
var os = require('os');
var path = require('path');
var program = require('commander');
var shell = require('shelljs');
var cp = require("child_process");
var DEFAULT_CONFIG = {
    editPath: '',
    modules: [],
    targets: []
};
var packageDotJSON = require('./package.json');
var APP_NAME = '\nModdable Helper (mddbl)';
var APP_AUTHOR = 'by John M. Wargo (https://johnwargo.com)';
var CONFIG_FILE_NAME = '.mddbl';
var CURRENT_PATH = process.cwd();
var EXIT_HEADING = chalk.red('Exiting:');
var log = logger();
var configFilePath;
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
function validateConfig(configFile) {
    console.debug("validateConfig(" + configFile + ")");
    return true;
}
function deployModule(mod, target) {
    console.log("Deploying " + mod + " to " + target);
}
function wipeDevice(target) {
    console.log("Wiping " + target);
}
function showConfig() {
    log.info('Displaying module configuration');
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
var config = program.command('config')
    .description("Work with the module's configuration");
config
    .command('edit')
    .description("Edit the module's configuration file")
    .action(function () {
    console.log('Edit Configuration');
});
config
    .command('show')
    .description("Print the modules config to the console")
    .action(showConfig);
configFilePath = path.join(os.homedir(), CONFIG_FILE_NAME);
console.log(configFilePath);
if (validateConfig(configFilePath)) {
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
}
else {
    log.info(chalk.red('Unable to locate or create the module\'s configuration file'));
    log.info("Configuration file: " + configFilePath);
    process.exit(1);
}
