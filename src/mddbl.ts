#!/usr/bin/env node
/**********************************************************
 * Moddable Helper
 * by John M. Wargo
 * 
 * Simplifies some of the pain from using the Moddable SDK
 * command-line utilities. 
 **********************************************************/

// TODO: Implement Add Module
// TODO: Implement Add Target

import { ConfigObject, defaultConfig, emptyModule, emptyTarget, Module, Target } from './config';

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

function executeCommand(folder: string, cmd: string) {
  log.debug(`executeCommand(${cmd})`);
  try {
    log.info(chalk.yellow('Executing:'), cmd);
    cp.execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    log.warn(e);
  }
}


function deployModule(modName: string, targetName: string) {
  console.log(`Deploying ${modName} to ${targetName}`);

  const mod: any = appConfig.modules.find(item => item.name === modName);
  const target: any = appConfig.targets.find(item => item.name === targetName);
  if (mod && target) {
    if (mod.isHost) {
      executeCommand(target.folderPath, `mcconfig`);
    } else {
      executeCommand(target.folderPath, `mcrun`);
    }
  } else {

  }
}

function wipeDevice(targetName: string) {
  console.log(`Wiping ${targetName}`);

}

function listArray(listStr: string, theList: Target[] | Module[]) {
  // Write the array contents to the console
  if (theList.length > 0) {
    log.info(`\nConfigured ${listStr}:`);

    for (let item in theList) {
      let outputStr = `- ${theList[item].name}`;
      if (theList[item].description) {
        outputStr += `: ${theList[item].description}`;
      }
      log.info(outputStr)
    }
  } else {
    log.info(`\nNo ${listStr} configured`);
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
      log.error(stderr);
    }
  });
}

function initConfig() {
  // Assign the default config to the variable
  appConfig = Object.assign({}, defaultConfig);
  if (writeConfig()) {
    log.debug('Successfully wrote configuration to disk');
  }
}

function readConfig() {
  log.debug('Reading configuration');
  if (fs.existsSync(configFilePath)) {
    const rawData: string = fs.readFileSync(configFilePath);
    appConfig = JSON.parse(rawData);
    return true;
  }
  return false;
}

function compare(a: Module | Target, b: Module | Target) {
  return a.name > b.name ? 1 : -1;
}

function writeConfig(): boolean {
  // Save the configuration to disk
  log.debug(`Writing configuration to ${configFilePath}`);
  // Sort the modules and targets arrays
  appConfig.modules.sort(compare);
  appConfig.targets.sort(compare);
  // create the pretty version of the config object
  const data = JSON.stringify(appConfig, null, 2);
  try {
    // write the pretty version of the object to disk
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
  // print the module configuration settings to the console
  log.info('Module configuration:');
  console.log(JSON.stringify(appConfig, null, 2));
}

// *****************************************
// Start
// *****************************************
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

// Look for the config file in the current folder
configFilePath = path.join(process.cwd(), CONFIG_FILE_NAME);

if (readConfig()) {
  program.parse();
  const options = program.opts();
  if (options.debug) {
    log.level(log.DEBUG);
  } else {
    log.level(log.INFO);
  }

  log.debug(APP_AUTHOR);
  log.debug(`Version: ${packageDotJSON.version}`);
  log.debug('Command Options:', options);
  log.debug(`Configuration file: ${configFilePath}`);
} else {
  log.info(`\nConfiguration file not found (${configFilePath})`);
  log.info(`Execute ${chalk.yellow('`mdbbl config init`')} to create one here`);
  process.exit(1);
}
