#!/usr/bin/env node
/**********************************************************
 * Moddable Helper
 * by John M. Wargo
 * 
 * Simplifies some of the pain from using the Moddable SDK
 * command-line utilities. 
 **********************************************************/

const chalk = require('chalk');
const fs = require('fs');
const logger = require('cli-logger');
const os = require('os');
const path = require('path');
const program = require('commander');
const shell = require('shelljs');
const cp = require("child_process");

const DEFAULT_CONFIG = {
  editPath: '',
  modules: [],
  targets: []
}

// https://stackoverflow.com/questions/9153571/is-there-a-way-to-get-version-from-package-json-in-nodejs-code
const packageDotJSON = require('./package.json');

// constants
const APP_NAME = '\nModdable Helper (mddbl)';
const APP_AUTHOR = 'by John M. Wargo (https://johnwargo.com)';
const CONFIG_FILE_NAME = '.mddbl';
const CURRENT_PATH = process.cwd();
const EXIT_HEADING = chalk.red('Exiting:');

var log = logger();
var configFilePath: string;

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

function validateConfig(configFile: string): boolean {
  console.debug(`validateConfig(${configFile})`);

  // does the config file exist?

  // if not, create it

  return true;
}

function deployModule(mod: string, target: string) {
  console.log(`Deploying ${mod} to ${target}`);

}

function wipeDevice(target: string) {
  console.log(`Wiping ${target}`);

}

function showConfig() {
  log.info('Displaying module configuration');
  
}

console.log(APP_NAME);
program.version(packageDotJSON.version);
program.option('--debug', 'Output extra information during operation');
// Setup the `deploy` command
program
  .command('deploy <module> <target>')
  .description('Deploy <module> to specific <target>')
  .action((mod: string, target: string) => {
    deployModule(mod, target);
  });
// setup the `wipe` command
program
  .command('wipe <target>')
  .description('Wipes the <target> device')
  .action((target: string) => {
    wipeDevice(target);
  });

// Setup the `config` command
const config = program.command('config')
  .description("Work with the module's configuration");
// EDIT
config
  .command('edit')
  .description("Edit the module's configuration file")
  .action(() => {
    console.log('Edit Configuration');

  });
// SHOW
config
  .command('show')
  .description("Print the modules config to the console")
  .action(showConfig);

configFilePath = path.join(os.homedir(), CONFIG_FILE_NAME);
console.log(configFilePath);
if (validateConfig(configFilePath)) {
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

  // TODO: display help if there's no command-line options
  // program.help();
} else {
  log.info(chalk.red('Unable to locate or create the module\'s configuration file'));
  log.info(`Configuration file: ${configFilePath}`);
  process.exit(1);
}
