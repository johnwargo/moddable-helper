#!/usr/bin/env node
/**********************************************************
 * Moddable Helper
 * by John M. Wargo
 * 
 * Simplifies some of the pain from using the Moddable SDK
 * command-line utilities. 
 **********************************************************/

import { ConfigObject, defaultConfig } from './config';

const chalk = require('chalk');
const fs = require('fs');
const logger = require('cli-logger');
const os = require('os');
const path = require('path');
const program = require('commander');
const shell = require('shelljs');
const cp = require("child_process");

// https://stackoverflow.com/questions/9153571/is-there-a-way-to-get-version-from-package-json-in-nodejs-code
const packageDotJSON = require('./package.json');

// constants
const APP_NAME = '\nModdable Helper (mddbl)';
const APP_AUTHOR = 'by John M. Wargo (https://johnwargo.com)';
const CONFIG_FILE_NAME = '.mddbl';
const CURRENT_PATH = process.cwd();
const EXIT_HEADING = chalk.red('Exiting:');

var appConfig: ConfigObject;
var configFilePath: string;
var log = logger();

function checkFile(filePath: string): boolean {
  // log.debug(`checkFile(${filePath})`);
  log.debug(`Locating ${filePath}`);
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    log.error(`checkFile error: ${err}`);
    return false;
  }
}

function checkDirectory(filePath: string): boolean {
  log.debug(`Locating ${filePath}`);
  // log.debug(`checkDirectory(${filePath})`);
  // does the folder exist?
  if (fs.existsSync(filePath)) {
    // Check to see if it's a folder
    try {
      let stats = fs.statSync(filePath);
      if (stats) {
        return stats.isDirectory;
      } else {
        return false;
      }
    } catch (err) {
      log.error(`checkDirectory error: ${err}`);
      return false;
    }
  } else {
    return false;
  }
}

function deployModule(mod: string, target: string) {
  console.log(`Deploying ${mod} to ${target}`);

}

function wipeDevice(target: string) {
  console.log(`Wiping ${target}`);

}

function listToConsole(listStr: string, theList: string[]) {
  if (theList.length > 0) {
    log.info(`\nConfigured ${listStr}:`);
    theList.sort();
    theList.forEach(value => {
      log.info(`- ${value}`)
    });
  } else {
    log.info(`\nNo ${listStr} configured`);
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
  // build the command string based on execution platform
  var cmdStr = (os.type().indexOf('Win') === 0) ? `start ${configFilePath}` : `open -e ./${configFilePath}`;
  // execute the command
  cp.exec(cmdStr, function (error: any, stdout: any, stderr: any) {
    if (error) {
      log.error('Unable to edit configuration')
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
  log.debug(`Reading configuration from ${configFilePath}`);
  if (fs.existsSync(configFilePath)) {
    const rawData: string = fs.readFileSync(configFilePath);
    appConfig = JSON.parse(rawData);
    // console.dir(appConfig);
    return true;
  } else {
    // Assign the default config to the variable
    appConfig = Object.assign({}, defaultConfig);
    if (writeConfig()) {
      return true;
    };
  }
  return false;
}

function writeConfig(): boolean {
  log.debug(`Writing configuration to ${configFilePath}`);
  // create the pretty version of the config object
  appConfig.modules.sort();
  appConfig.targets.sort();
  const data = JSON.stringify(appConfig, null, 2);
  try {
    // write it to disk
    fs.writeFileSync(configFilePath, data);
    log.debug('Configuration file successfully written to disk');
  } catch (err) {
    log.error('Unable to write to configuration file');
    log.error(err)
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
// ===========================
// Setup the `deploy` command
// ===========================
program
  .command('deploy <module> <target>')
  .description('Deploy <module> to specific <target>')
  .action((mod: string, target: string) => {
    deployModule(mod, target);
  });

// ===========================
// setup the `wipe` command
// ===========================
program
  .command('wipe <target>')
  .description('Wipes the <target> device')
  .action((target: string) => {
    wipeDevice(target);
  });

// ===========================
// Setup the `config` command
// ===========================
const configCmd = program.command('config')
  .description("Work with the module's configuration");
// EDIT
configCmd
  .command('edit')
  .description("Edit the module's configuration file")
  .action(editConfig);
// SORT
configCmd
  .command('sort')
  .description("Sorts the config arrays")
  .action(writeConfig);
// SHOW
configCmd
  .command('show')
  .description("Print the modules config to the console")
  .action(showConfig);

// ===========================
// Setup the `list` command
// ===========================
const listCmd = program.command('list')
  .description('List configuration objects');

listCmd
  .command('modules')
  .description('List all configured modules')
  .action(listModules)

listCmd
  .command('targets')
  .description('List all configured targets')
  .action(listTargets)

configFilePath = path.join(os.homedir(), CONFIG_FILE_NAME);

if (readConfig()) {
  program.parse();
  const options = program.opts();
  if (options.debug) {
    log.level(log.DEBUG);
  } else {
    log.level(log.INFO);
  }
  // write the version number to the console
  log.debug(APP_AUTHOR);
  log.debug(`Version: ${packageDotJSON.version}`);
  // Write the command line options to the console
  log.debug('Command Options:', options);
  log.debug(`Configuration file: ${configFilePath}`);
} else {
  log.info(chalk.red('Unable to locate or create the module\'s configuration file'));
  log.info(`Configuration file: ${configFilePath}`);
  process.exit(1);
}
