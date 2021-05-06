#!/usr/bin/env node
/**********************************************************
 * Moddable Helper
 * by John M. Wargo
 * 
 * Simplifies some of the pain of using the Moddable SDK
 * command-line utilities. streamlines deploy and wipe 
 * actions.
 **********************************************************/

// TODO: Module Add
// TODO: Module Delete
// TODO: Target Add
// TODO: Target Delete
// TODO: Automatically pass additional command-line parameters to Moddable SDK

// ESP32 Wipe Command: python %IDF_PATH%\components\esptool_py\esptool\esptool.py erase_flash

import { ConfigObject, defaultConfig, emptyModule, emptyTarget, Module, Target } from './config';

const chalk = require('chalk');
const fs = require('fs');
const logger = require('cli-logger');
const os = require('os');
const path = require('path');
const program = require('commander');
const { Select } = require('enquirer');
// const { prompt } = require('enquirer');
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

function toggleDebug() {
  log.debug('toggleDebug()');
  readConfig();
  if (appConfig) {
    log.debug(`Toggling Debug configuration parameter to ${!appConfig.debug}`)
    appConfig.debug = !appConfig.debug;
    // write the changes to disk
    if (!writeConfig()) {
      process.exit(1);
    }
  }
}

function doDeploy(rootCmd: string, mod: Module, target: Target) {
  log.debug(`executeCommand(${rootCmd}, ${mod.name}, ${target.name})`);

  // does the module folder exist?
  const folder = mod.folderPath;
  if (!checkDirectory(folder)) {
    log.error(`Specified module folder (${folder}) does not exist`);
    process.exit(1);
  }

  // Build the command string
  let cmd: string = rootCmd + ' ';
  if (mod.debugFlag) cmd += '-d ';
  if (mod.makeFlag) cmd += '-m ';
  // Target the platform flag (-p)
  if (target) cmd += `-p ${target.platform} `;
  if (target.formatFlag) {
    cmd += `-f `;
    if (target.formatStr.length > 0) cmd += `${target.formatStr} `;
  }
  // Process the rotation flag (`r)
  if (target.rotationFlag) {
    cmd += `-r `;
    if (target.rotationValue > -1) cmd += `${target.rotationValue} `;
  }

  log.debug(`Command: ${cmd}`);

  try {
    // Change to the module folder
    log.info(chalk.yellow(`Changing to the '${folder}' directory`));
    process.chdir(folder);
    log.debug(`Current directory: ${process.cwd()}`);
    // execute the command
    log.info(`${chalk.yellow('Executing:')} ${cmd}`);
    cp.execSync(cmd, { stdio: 'inherit' });
    // switch back to the starting folder
    log.info(chalk.yellow(`Changing back to the '${WORKING_PATH}' directory`));
    process.chdir(WORKING_PATH);
  } catch (e) {
    log.error(chalk.red(e));
    process.exit(1);
  }
}

function deployModule(modName: string, targetName: string = '') {
  log.debug(`deployModule(${modName}, ${targetName})`);

  // only read the config if we didn't already read it
  if (!appConfig) readConfig();

  // Does the specified module exist?
  const mod: any = appConfig.modules.find(item => item.name === modName);
  if (!mod) {
    log.error(`Module '${modName}' not defined, ${CHECK_CONFIG_STRING}`);
    process.exit(1);
  }
  // Does the module have a folder path?
  if (!mod.folderPath) {
    log.error(`Module path '${mod.folderPath}' not defined, ${CHECK_CONFIG_STRING}`);
    process.exit(1);
  }

  var target: any;
  if (targetName.length > 0) {
    // Does the specified target exist?
    target = appConfig.targets.find(item => item.name === targetName);
    if (!target) {
      log.error(`Target '${targetName}' not defined, ${CHECK_CONFIG_STRING}`);
      process.exit(1);
    }
    // Does the target have a platform?
    if (!target.platform) {
      log.error(`Target platform '${target.platform}' not defined, ${CHECK_CONFIG_STRING}`);
      process.exit(1);
    }

    if (target.rotationFlag && target.rotationValue &&
      !(target.rotationValue == 0 || target.rotationValue == 90 || target.rotationValue == 180 || target.rotationValue == 270)) {
      log.error(`Invalid Target rotation value (${target.rotationValue})`);
      process.exit(1);
    }
  }

  // Execute the command
  console.log(`Deploying ${modName} to ${targetName}`);
  if (mod.isHost) {
    doDeploy('mcconfig', mod, target);
  } else {
    doDeploy('mcrun', mod, target);
  }
}

async function deployInteractive() {
  log.debug('Deploying in interactive mode');
  readConfig();

  if (appConfig.modules.length < 1) {
    log.error(`Module list not defined, ${CHECK_CONFIG_STRING}`);
    process.exit(1);
  }

  if (appConfig.targets.length < 1) {
    log.error(`Module list not defined, ${CHECK_CONFIG_STRING}`);
    process.exit(1);
  }

  const modPrompt = new Select({
    name: 'modName',
    message: 'Module Selection',
    choices: appConfig.modules
  });
  const targetPrompt = new Select({
    name: 'targetName',
    message: 'Target Selection',
    choices: appConfig.targets
  });

  var modName: string = '';
  var targetName: string = '';

  await modPrompt.run()
    .then((result: any) => {
      modName = result.toString();
    })
    .catch((err: any) => {
      log.error(err);
      process.exit(1);
    });

  await targetPrompt.run()
    .then((result: any) => {
      targetName = result.toString();
    })
    .catch((err: any) => {
      log.error(err);
      process.exit(1);
    });

  if (modName.length > 0 && targetName.length > 0) {
    deployModule(modName, targetName);
  }
}

function wipeDevice(targetName: string) {
  log.debug(`wipeDevice(${targetName})`);
  readConfig();
  // See if we can find the target  
  const target: any = appConfig.targets.find(item => item.name === targetName);
  if (!target) {
    log.error(`Target '${targetName}' not defined, ${CHECK_CONFIG_STRING}`);
    process.exit(1);
  }
  // Is the wipe command defined?
  if (!target.wipeCommand) {
    log.error(`Target wipe command '${target.wipeCommand}' not defined, ${CHECK_CONFIG_STRING}`);
    process.exit(1);
  }

  try {
    console.log(`Wiping ${targetName}`);
    cp.execSync(target.wipeCommand, { stdio: 'inherit' });
  } catch (e) {
    log.error(chalk.red(e));
    process.exit(1);
  }
}

function listArray(listStr: string, theList: Target[] | Module[]) {
  // Write the array contents to the console
  if (theList.length > 0) {
    log.info(`\nConfigured ${listStr}:`);
    for (let item in theList) {
      let outputStr = `- ${theList[item].name}`;
      if (theList[item].description) {
        outputStr += ` - ${theList[item].description}`;
      }
      log.info(outputStr)
    }
  } else {
    log.info(`\nNo ${listStr} configured`);
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
  console.log(configFilePath);
  // build the command string based on execution platform
  var cmdStr = (os.type().indexOf('Win') === 0)
    ? `start ${CONFIG_FILE_NAME}`
    : `open -e ./${CONFIG_FILE_NAME}`;
  // execute the command
  cp.exec(cmdStr, function (error: any, stdout: any, stderr: any) {
    if (error) {
      log.error('Unable to edit configuration')
      log.error(error);
      process.exit(1);
      // return;
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
  } else {
    process.exit(1);
  }
}

function readConfig() {
  log.info('Reading configuration file');
  if (fs.existsSync(configFilePath)) {
    try {
      const rawData: string = fs.readFileSync(configFilePath);
      appConfig = JSON.parse(rawData);
    } catch (err) {
      log.error(`readConfig error: ${err}`);
      process.exit(1);
      // return;
    }
    // get the log level from the config 
    const logLevel = appConfig.debug ? log.DEBUG : log.INFO;
    log.level(logLevel);

    log.debug('\nProgram Information (debug)');
    log.debug(APP_AUTHOR);
    log.debug(`Version: ${packageDotJSON.version}`);
    log.debug('Command Options:', program.opts());
    log.debug(`Working directory: ${WORKING_PATH}`);
    log.debug(`Configuration file: ${configFilePath}\n`);
  } else {
    log.info(`\nConfiguration file not found (${configFilePath})`);
    log.info(`Execute ${chalk.yellow('`mdbbl config init`')} to create one here`);
    process.exit(1);
  }
}

function writeConfig(): boolean {
  // Save the configuration to disk
  log.info(`Writing configuration to ${configFilePath}`);
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
  log.debug('showConfig()');
  readConfig();
  // print the module configuration settings to the console
  log.info('\nModule configuration:');
  // log.info(JSON.stringify(appConfig, null, 2));
  console.dir(appConfig);
}

function sortConfig() {

  // Function that helps sort the object array
  function compare(a: Module | Target, b: Module | Target) {
    return a.name > b.name ? 1 : -1;
  }

  // Get the config in memory
  readConfig();
  if (appConfig) {
    // Sort the modules and targets arrays
    appConfig.modules.sort(compare);
    appConfig.targets.sort(compare);
    // write the changes to disk
    if (!writeConfig()) {
      process.exit(1);
    }
  }
}

// *****************************************
// Start
// *****************************************
console.log(APP_NAME);
configFilePath = path.join(WORKING_PATH, CONFIG_FILE_NAME);
program.version(packageDotJSON.version);
program.option('--debug', 'Output extra information during operation');
// ===========================
// Setup the `debug` command
// ===========================
program
  .command('debug')
  .description('Toggle the debug configuration setting')
  .action(toggleDebug);
// ===========================
// Setup the `deploy` command
// ===========================
// program
//   .command('deploy')
//   .description('Deploy; interactive mode')
//   .action(deployInteractive);
program
  .command('deploy [module] [target]')
  .description('Deploy Module to specified Target device')
  .action((mod: string, target: string) => {
    // Do we have a module name? 
    if (mod) {
      // Then we deploy using the module (if we can)
      deployModule(mod, target);
    } else {
      // otherwise we go into interactive mode
      deployInteractive();
    }
  });
// ===========================
// Setup the `init` command
// ===========================
program
  .command('init')
  .description('Initialize the current folder (create module config file)')
  .action(initConfig);
// ===========================
// Setup the `modules` command
// ===========================
program
  .command('modules')
  .description('List all configured Modules')
  .action(listModules);
// ===========================
// Setup the `targets` command
// ===========================
program
  .command('targets')
  .description('List all configured Targets')
  .action(listTargets);
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

program.parse();