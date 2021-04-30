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

const APP_NAME = '\nModdable Helper (mddbl)';
const APP_AUTHOR = 'by John M. Wargo (https://johnwargo.com)';
const CONFIG_FILE_NAME = 'mddbl.json';
const CHECK_CONFIG_STRING = `please check the module configuration (${CONFIG_FILE_NAME})`;
const WORKING_PATH = process.cwd();

var appConfig: ConfigObject;
var configFilePath: string;
var log = logger();

// function checkFile(filePath: string): boolean {
//   log.debug(`Locating ${filePath}`);
//   try {
//     return fs.existsSync(filePath);
//   } catch (err) {
//     log.error(`checkFile error: ${err}`);
//     return false;
//   }
// }

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

function executeCommand(cmd: string, folder: string = '') {
  log.debug(`executeCommand(${cmd})`);
  // does the module folder exist?
  if (checkDirectory(folder)) {
    try {
      if (folder.length > 0) {
        // Change to the module folder
        log.info(`${chalk.yellow('Changing directory:')} ${folder}`);
        process.chdir(folder);
      }
      // execute the command
      log.info(`${chalk.yellow('Executing:')} ${cmd}`);
      cp.execSync(cmd, { stdio: 'inherit' });
      if (folder.length > 0) {
        // switch back to the starting folder
        log.info(`${chalk.yellow('Changing directory:')} ${WORKING_PATH}`);
        process.chdir(WORKING_PATH);
      }
    } catch (e) {
      log.error(chalk.red('Error executing command'));
      log.error(e);
    }
  } else {
    log.error(`Specified module folder (${folder}) does not exist`);
  }
}


function deployModule(modName: string, targetName: string) {
  log.debug(`deployModule(${modName}, ${targetName})`);
  // Does the specified module exist?
  const mod: any = appConfig.modules.find(item => item.name === modName);
  if (!mod) {
    log.error(`Module '${modName}' not defined, ${CHECK_CONFIG_STRING}`);
    return;
  }
  // Does the module have a folder path?
  if (!mod.folderPath) {
    log.error(`Module path '${mod.folderPath}' not defined, ${CHECK_CONFIG_STRING}`);
    return;
  }
  // Does the specified target exist?
  const target: any = appConfig.targets.find(item => item.name === targetName);
  if (!target) {
    log.error(`Target '${targetName}' not defined, ${CHECK_CONFIG_STRING}`);
    return;
  }
  // Does the target have a platform?
  if (!target.platform) {
    log.error(`Target platform '${target.platform}' not defined, ${CHECK_CONFIG_STRING}`);
    return;
  }
  console.log(`Deploying ${modName} to ${targetName}`);
  if (mod.isHost) {
    executeCommand(`mcconfig -d -m -p ${target.platform}`, mod.folderPath);
  } else {
    executeCommand(`mcrun -d -m -p ${target.platform}`, mod.folderPath);
  }
}

function wipeDevice(targetName: string) {
  log.debug(`wipeDevice(${targetName})`);
  // See if we can find the target  
  const target: any = appConfig.targets.find(item => item.name === targetName);
  if (!target) {
    log.error(`Target '${targetName}' not defined, ${CHECK_CONFIG_STRING}`);
    return;
  }
  // IS the wipe command defined?
  if (!target.wipeCommand) {
    log.error(`Target wipe command '${target.wipeCommand}' not defined, ${CHECK_CONFIG_STRING}`);
    return;
  }
  console.log(`Wiping ${targetName}`);
  executeCommand(target.wipeCommand);
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
  log.info('Initializing project folder...');
  // Assign the default config to the variable  
  appConfig = Object.assign({}, defaultConfig);
  // write the object to the file
  if (writeConfig()) {
    log.info(`Successfully created configuration file (${CONFIG_FILE_NAME})`);
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

function writeConfig(): boolean {

  function compare(a: Module | Target, b: Module | Target) {
    return a.name > b.name ? 1 : -1;
  }

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
  log.info('\nModule configuration:');
  log.info(JSON.stringify(appConfig, null, 2));
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
configFilePath = path.join(WORKING_PATH, CONFIG_FILE_NAME);

if (!readConfig()) {

  log.info(`\nConfiguration file not found (${configFilePath})`);
  log.info(`Execute ${chalk.yellow('`mdbbl config init`')} to create one here`);
  process.exit(1);
}

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
log.debug(`Working directory: ${WORKING_PATH}`);
log.debug(`Configuration file: ${configFilePath}`);
