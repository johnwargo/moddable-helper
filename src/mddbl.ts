#!/usr/bin/env node
/**********************************************************
 * Moddable Helper
 * by John M. Wargo
 * 
 * Simplifies some of the pain of using the Moddable SDK
 * command-line utilities. streamlines deploy and wipe 
 * actions.
 **********************************************************/

// TODO: Confirm deletion for `module rm` and `target rm`
// TODO: Automatically pass additional command-line parameters to Moddable SDK
// TODO: Add tests
// TODO: Add GitHub Pages site

// ESP32 Wipe Command: python %IDF_PATH%\components\esptool_py\esptool\esptool.py erase_flash

import { ConfigObject, defaultConfig, emptyModule, emptyTarget, Module, Target } from './config';

const chalk = require('chalk');
const fs = require('fs');
const logger = require('cli-logger');
const os = require('os');
const path = require('path');
const program = require('commander');
const { Select } = require('enquirer');
const cp = require("child_process");

// https://stackoverflow.com/questions/9153571/is-there-a-way-to-get-version-from-package-json-in-nodejs-code
const packageDotJSON = require('./package.json');

const APP_NAME = '\nModdable Helper (mddbl)';
const APP_AUTHOR = 'by John M. Wargo (https://johnwargo.com)';
const CONFIG_FILE_NAME = 'mddbl.json';
const CHECK_CONFIG_STRING = `not defined, please check the module configuration (${CONFIG_FILE_NAME})`;
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
      if (stats) return stats.isDirectory;
    } catch (err) {
      log.error(`checkDirectory error: ${err}`);
    }
  }
  return false;
}

function showObjectProperties(itemName: string, type: string) {
  log.debug(`showObjectValues(${itemName}, ${type})`);
  // Display the contents of a config array object (modules or targets)
  // in the console
  configRead();
  const theArray: any[] = type === 'Module' ? appConfig.modules : appConfig.targets;
  const obj: any = theArray.find(item => item.name === itemName);
  if (!obj) {
    log.error(`${type} '${itemName}' ${CHECK_CONFIG_STRING}`);
    return;
  }
  log.info(`Configuration for the '${obj.name}' ${type}:`);
  console.dir(obj);
}

function listArrayNames(listStr: string, theList: Target[] | Module[]) {
  log.debug('listArray()');
  // Write the array's name property list to the console
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

function deleteArrayItem(typeStr: string, theArray: Module[] | Target[], compareStr: string): any[] {
  // Remove an object from the array
  // initialize the idx to indicate no item found
  var idx = -1;
  // Not loop through the array looking for the item
  for (var i = 0; i < theArray.length; i++) {
    // Force it to stop at the first one
    if (idx < 0) {
      log.debug(`${i}: ${theArray[i].name}`);
      if (theArray[i].name == compareStr) {
        log.debug(`Found match at index ${idx}`);
        idx = i;
      }
    }
  }
  // does the object exist in the array?
  if (idx > -1) {
    // Delete the item
    theArray.splice(idx, 1);
  } else {
    log.error(`${typeStr} '${compareStr}' ${CHECK_CONFIG_STRING}`);
    process.exit(1);
  }
  return theArray;
}

// ================
// Config
// ================
function configEdit() {
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
  // Assign the default config to the variable  
  appConfig = Object.assign({}, defaultConfig);
  // write the object to the file
  if (configWrite()) {
    log.info(`Successfully created configuration file (${CONFIG_FILE_NAME})`);
  } else {
    process.exit(1);
  }
}

function configRead() {
  log.info('Reading configuration file');
  if (fs.existsSync(configFilePath)) {
    try {
      const rawData: string = fs.readFileSync(configFilePath);
      appConfig = JSON.parse(rawData);
    } catch (err) {
      log.error(`readConfig error: ${err}`);
      process.exit(1);
    }
    // get the log level from the config 
    const logLevel = appConfig.debug ? log.DEBUG : log.INFO;
    // set the log level
    log.level(logLevel);
    // dump some program information to the console
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

function configWrite(): boolean {
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

function configShow() {
  // print the module configuration settings to the console
  log.debug('showConfig()');
  configRead();
  log.info('\nModule configuration:');
  // log.info(JSON.stringify(appConfig, null, 2));
  console.dir(appConfig);
}

function configSort() {
  // Function that helps sort the object array
  function compare(a: Module | Target, b: Module | Target) {
    return a.name > b.name ? 1 : -1;
  }

  // Get the config in memory
  configRead();
  if (appConfig) {
    // Sort the modules and targets arrays
    appConfig.modules.sort(compare);
    appConfig.targets.sort(compare);
    // write the changes to disk
    if (!configWrite()) {
      process.exit(1);
    }
  }
}

// ================
// Debug
// ================
function debugToggle() {
  log.debug('toggleDebug()');
  configRead();
  if (appConfig) {
    log.debug(`Toggling Debug configuration parameter to ${!appConfig.debug}`)
    appConfig.debug = !appConfig.debug;
    // write the changes to disk
    if (!configWrite()) {
      process.exit(1);
    }
  }
}

// ================
// Deploy
// ================
function doDeploy(rootCmd: string, mod: Module, target: Target) {
  if (target) {
    log.debug(`doDeploy(${rootCmd}, ${mod.name}, ${target.name})`);
  } else {
    log.debug(`doDeploy(${rootCmd}, ${mod.name})`);
  }

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

  // Do we have a target to process?
  if (target) {
    // then do the target stuff    
    cmd += `-p ${target.platform} `;
    if (target.formatFlag) {
      cmd += `-f `;
      if (target.formatStr.length > 0) cmd += `${target.formatStr} `;
    }
    // Process the rotation flag (`r)
    if (target.rotationFlag) {
      cmd += `-r `;
      if (target.rotationValue > -1) cmd += `${target.rotationValue} `;
    }
  }

  log.debug(`Command: ${cmd}`);
  // Change to the module folder
  log.info(chalk.yellow(`Changing to the '${folder}' directory`));
  process.chdir(folder);
  log.debug(`Current directory: ${process.cwd()}`);
  log.info(`${chalk.yellow('Executing:')} ${cmd}`);
  try {
    // execute the command
    cp.execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    log.error(chalk.red(e));
    process.exit(1);
  }
  finally {
    // switch back to the starting folder
    log.info(chalk.yellow(`Changing back to the '${WORKING_PATH}' directory`));
    process.chdir(WORKING_PATH);
  }
}

function deployModule(modName: string, targetName: string) {
  log.debug(`deployModule(${modName}, ${targetName})`);

  // only read the config if we didn't already read it
  if (!appConfig) configRead();

  // Does the specified module exist?
  const mod: any = appConfig.modules.find(item => item.name === modName);
  if (!mod) {
    log.error(`ERROR: Module '${modName}' ${CHECK_CONFIG_STRING}`);
    process.exit(1);
  }
  // Does the module have a folder path?
  if (!mod.folderPath) {
    log.error(`ERROR: Module path '${mod.folderPath}' ${CHECK_CONFIG_STRING}`);
    process.exit(1);
  }

  var target: any;
  if (targetName) {
    // Does the specified target exist?    
    target = appConfig.targets.find(item => item.name === targetName);
    if (!target) {
      log.error(`ERROR: Target '${targetName}' ${CHECK_CONFIG_STRING}`);
      process.exit(1);
    }
    // Does the target have a platform?
    if (!target.platform) {
      log.error(`ERROR: Target platform '${target.platform}' ${CHECK_CONFIG_STRING}`);
      process.exit(1);
    }

    if (target.rotationFlag && target.rotationValue &&
      !(target.rotationValue == 0 || target.rotationValue == 90 || target.rotationValue == 180 || target.rotationValue == 270)) {
      log.error(`ERROR: Invalid Target rotation value (${target.rotationValue})`);
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
  configRead();

  if (appConfig.modules.length < 1) {
    log.error(`Module list ${CHECK_CONFIG_STRING}`);
    process.exit(1);
  }

  if (appConfig.targets.length < 1) {
    log.error(`Module list ${CHECK_CONFIG_STRING}`);
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

// ================
// Module
// ================
async function moduleAdd(modName: string) {
  log.debug(`moduleAdd(${modName})`);
  configRead();
  const newMod = Object.assign({}, emptyModule);
  newMod.name = modName;
  appConfig.modules.push(newMod);
  configWrite();
  configEdit();
}

function moduleRemove(modName: string) {
  log.debug(`moduleRemove(${modName})`);
  configRead();
  appConfig.modules = deleteArrayItem('Module', appConfig.modules, modName);
  configWrite();
}

function moduleShow(modName: string) {
  log.debug(`moduleShow(${modName})`);
  showObjectProperties(modName, 'Module');
}

// ================
// Modules
// ================
function modulesList() {
  log.debug('modulesList()');
  configRead();
  listArrayNames('Modules', appConfig.modules);
}

// ================
// Target
// ================
function targetAdd(targetName: string) {
  log.debug('targetAdd()');
  configRead();
  const newTarget = Object.assign({}, emptyTarget);
  newTarget.name = targetName;
  appConfig.targets.push(newTarget);
  configWrite();
  configEdit();
}

function targetRemove(targetName: string) {
  log.debug(`targetRemove(${targetName})`);
  configRead();
  appConfig.targets = deleteArrayItem('Target', appConfig.targets, targetName);
  configWrite();
}

function targetShow(targetName: string) {
  log.debug(`targetShow(${targetName})`);
  showObjectProperties(targetName, 'Target');
}

// ================
// Targets
// ================
function targetsList() {
  configRead();
  listArrayNames('Targets', appConfig.targets);
}

// ================
// Wipe
// ================
function wipeDevice(targetName: string) {
  log.debug(`wipeDevice(${targetName})`);
  configRead();
  // See if we can find the target  
  const target: any = appConfig.targets.find(item => item.name === targetName);
  if (!target) {
    log.error(`Target '${targetName}' ${CHECK_CONFIG_STRING}`);
    process.exit(1);
  }
  // Is the wipe command defined?
  if (!target.wipeCommand) {
    log.error(`Target wipe command '${target.wipeCommand}' ${CHECK_CONFIG_STRING}`);
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

// *****************************************
// Start
// *****************************************
console.log(APP_NAME);
configFilePath = path.join(WORKING_PATH, CONFIG_FILE_NAME);
program.version(packageDotJSON.version);
program.option('--debug', 'Output extra information during operation');
// ===========================
// Setup the `config` command
// ===========================
const configCmd = program.command('config')
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

// ===========================
// Setup the `debug` command
// ===========================
program
  .command('debug')
  .description('Toggle the debug configuration setting')
  .action(debugToggle);

// ===========================
// Setup the `deploy` command
// ===========================
program
  .command('deploy [module] [target]')
  .description('Deploy Module to specified Target device')
  .action((module: string, target: string) => {
    // Do we have a module name? 
    if (module) {
      // Then we deploy using the module (if we can)
      deployModule(module, target);
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
  .action(configInit);

// ===========================
// Setup the `module` command
// ===========================
const moduleCmd = program.command('module')
  .description('Work with the modules configuration');
moduleCmd
  .command('add <module>')
  .description('Add an empty module to the configuration file')
  .action((module: string) => {
    moduleAdd(module);
  });
moduleCmd
  .command('rm <module>')
  .description('Remove a module from the configuration file')
  .action((module: string) => {
    moduleRemove(module);
  });
moduleCmd
  .command('show <module>')
  .description('Show a module configuration')
  .action((module: string) => {
    moduleShow(module)
  });

// ===========================
// Setup the `modules` command
// ===========================
program
  .command('modules')
  .description('List all configured Modules')
  .action(modulesList);

// ===========================
// Setup the `target` command
// ===========================
const targetCmd = program.command('target')
  .description('Work with the targets configuration');
targetCmd
  .command('add <target>')
  .description('Add an empty target to the configuration file')
  .action((target: string) => {
    targetAdd(target);
  });
targetCmd
  .command('rm <target>')
  .description('Remove a target from the configuration file')
  .action((target: string) => {
    targetRemove(target);
  });
targetCmd
  .command('show <target>')
  .description('Show a target configuration')
  .action((target: string) => {
    targetShow(target)
  });

// ===========================
// Setup the `targets` command
// ===========================
program
  .command('targets')
  .description('List all configured Targets')
  .action(targetsList);

// ===========================
// setup the `wipe` command
// ===========================
program
  .command('wipe <target>')
  .description('Wipes the <target> device')
  .action((target: string) => {
    wipeDevice(target);
  });

program.parse();