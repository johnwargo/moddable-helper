# Moddable Helper

Table of Contents:

<!-- vscode-markdown-toc -->
* [Introduction](#Introduction)
* [Installation](#Installation)
* [Issues & Pull Requests](#IssuesPullRequests)
* [Background](#Background)
* [Usage](#Usage)
	* [Configuration](#Configuration)
		* [Creating the Configuration File](#CreatingtheConfigurationFile)
		* [Configuration Options](#ConfigurationOptions)
		* [Viewing the Configuration File](#ViewingtheConfigurationFile)
		* [Editing the Configuration File](#EditingtheConfigurationFile)
		* [Sorting Module and Target Lists](#SortingModuleandTargetLists)
	* [Deploy](#Deploy)
	* [List Modules or Targets](#ListModulesorTargets)
	* [Wipe Device](#WipeDevice)
* [Planned Features](#PlannedFeatures)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## <a name='Introduction'></a>Introduction

Delivers a command-line interface to simplifying usage of the [Moddable SDK](https://github.com/Moddable-OpenSource/moddable). This repository hosts a node.js module that:

* Delivers a simple set of commands that drive the Moddable SDK, and eliminates some of the repetitive typing required to work with the Moddable SDK command-line tools
* Uses a project configuration file to configure the settings modules and target devices used by the project
* Delivers a mechanism that enables developers to more easily wipe devices using the device's native SDK (without having to remember the command every time)

The module supports the following commands:

* `mddbl init` - Create an empty configuration file in the current folder
* `mddbl config edit` - Edit the project's configuration file
* `mddbl config show` - Display the contents of the configuration file
* `mddbl config sort` - Sort the module and target lists by name
* `mddbl deploy <module> <target>` - Deploy the selected module (module or host) to the specified target device
* `mddbl list modules` - Display the list of modules defined in the `modules` section of the configuration file
* `mddbl list targets` - Display the list of targets defined in the `targets` section of the configuration file
* `mddbl wipe <target>` - Wipe the selected target device
* `mddbl debug` - Toggle the `debug` setting (true to false, and, of course, false to true) in the project's configuration file

Detailed instructions for these commands provided below.

## <a name='Installation'></a>Installation

To install the module, open a terminal window (or command prompt on Windows), and execute the following command:

```shell
npm install -g moddable-helper
```

This installs a `mddbl` command you can use anywhere on the system.

## <a name='IssuesPullRequests'></a>Issues & Pull Requests

If you have an issue with this module, don't email the author, submit an [issue](https://github.com/johnwargo/moddable-helper/issues) in this repository instead.

I built this project for the community, so if you have an enhancement, fix, or change for the project please submit a [Pull Request](https://github.com/johnwargo/moddable-helper/pulls).

## <a name='Background'></a>Background

I've been playing around lately with the Moddable SDK and I think the platform's pretty interesting for a lot of reasons I'll write about later on [my blog](https://johnwargo.com). They deliver several very capable IoT devices with built-in displays at a great price. The real power comes from their SDK which delivers a robust and solid JavaScript API for inexpensive microcontroller devices

One of the things I noticed when I started working with the Moddable SDK was that I found myself typing the same commands over and over again as I coded projects for the devices. Now, that's not unexpected for command-line based tooling, but when building and deploying for Moddable devices, I kept typing the exact same command-line options over and over again (`-d m -p <device>`). I decided to make this helper module to reduce my typing and simplify my work.

Let me show you how this works using a real-world example. 

The folks at Moddable published a book called [IoT Development for ESP32 and ESP8266 with JavaScript](https://github.com/Moddable-OpenSource/iot-product-dev-book) that contains a lot of sample code demonstrating how to use the different APIs in their SDK. Moddable developers often break a project down into multiple parts, a host (the core native application running on the device plus a little JavaScript code to bootstrap the project) plus additional JavaScript modules that run within the host (a dramatic oversimplification, I know, but I'm not here to teach you Moddable development). Developers typically keep their host and module files in different folders within a project folder.

> **Note**: What I show here applies to any Moddable SDK project

Using the book's Chapter 1 [Hello World](https://github.com/Moddable-OpenSource/iot-product-dev-book/tree/master/ch1-gettingstarted) project as an example, to deploy the host to a Moddable Two device, you will open a terminal window, navigate to the project folder, then execute the following commands:

```shell
cd host
mcconfig -d -m -p esp32/moddable_two
```

Next, to deploy the host, execute the following commands:

```shell
cd ../helloworld
mcrun -d -m -p esp32/moddable_two
```

As you can see, I'm switching folders from time to time depending on whether I'm deploying an update to the project's host or an update to the `helloworld` module. I'm also executing two different Moddable SDK commands, each with the exact same command-line parameters. There has to be a better way.

Yes, I know I could open two different terminal windows and execute host or module commands in their own terminal - I'm for simplification here, not opening even more windows.

With this module, you create a configuration file called `mddbl.json` (the module can create it for your automatically using the `mddbl init` command) in the project's root folder, then define all of the options for your project there:

```json
{
  "debug": true,
  "modules": [
    {
      "name": "host",
      "description": "The project's host module",
      "isHost": true,
      "debugFlag": true,
      "makeFlag": true,

      "folderPath": "host"
    },
    {
      "name": "hw",
      "description": "Text-only version of the project",
      "isHost": false,
      "debugFlag": true,
      "makeFlag": true,
      "folderPath": "helloworld"
    },
    {
      "name": "hwg",
      "description": "Hello World Graphical version",
      "isHost": false,
      "debugFlag": true,
      "makeFlag": true,
      "folderPath": "helloworld-gui"
    }
  ],
  "targets": [
    {
      "name": "mdbl2",
      "description": "Moddable Two",
      "platform": "esp32/moddable_two",
      "formatFlag": false,
      "formatStr": "",
      "rotationFlag": false,
      "rotationValue": 0,
      "wipeCommand": "python %IDF_PATH%\\components\\esptool_py\\esptool\\esptool.py erase_flash"
    },
    {
      "name": "m5fire",
      "description": "M5Stack Fire device",
      "platform": "esp32/m5stack_fire",
      "formatFlag": true,
      "formatStr": "gray16",
      "rotationFlag": false,
      "rotationValue": 0,
      "wipeCommand": "python %IDF_PATH%\\components\\esptool_py\\esptool\\esptool.py erase_flash"
    }
  ]
}
```

With that in place, you can open a terminal window, navigate to your project folder, then deploy the project's host using:

```shell  
mddbl deploy host mdbl2
```

The mddbl module switches to the host module's folder (`host` as specified in the module's `folderPath` property), executes the command to deploy the host (`mcconfig -d -m -p esp32/moddable_two`), then switches back to the starting folder.

Next, to deploy one of the project's modules, `helloworld` for example, simply use the following command:

```shell 
mddbl deploy hw mdbl2
```

Moddable Helper switches to the module's folder (`helloworld` as specified in the module's `folderPath` property), executes the command to deploy the host (`mcrun -d -m -p esp32/moddable_two`), then switches back to the starting folder.

> **Note**: The mddbl module uses the module's `isHost` property to determine whether to execute `mcconfig` or `mcrun` to deploy the module.


## <a name='Usage'></a>Usage

### <a name='Configuration'></a>Configuration

To use this module, you must first create the module's configuration file in the Moddable project's root folder. The file must be called `mddbl.json` and the default configuration file contains the following options:

```json
{
    "debug": false,
    "modules": [],
    "targets": [],
}
```

#### <a name='CreatingtheConfigurationFile'></a>Creating the Configuration File

The module can create it for you automatically, simply open a terminal window, navigate to the project folder, and execute the following command:

```shell
mddbl init
```

Moddable Helper will create the default configuration file shown above.

#### <a name='ConfigurationOptions'></a>Configuration Options

The following sections describe the configuration options for the Moddable Helper module.

##### Debug

If you're having trouble with the Moddable Helper, you can enable debug mode through the configuration file. In debug mode, the CLI outputs more information to the console as it runs.

To enable debug mode, set the configuration file's `debug` option to `true` as shown in the following example:

```json
{
    "debug": true,
    "modules": [],
    "targets": [],
}
```

You can also toggle the `debug` setting using the following command:

```shell
mddbl debug
```

##### Modules

Use the `modules` section of the configuration file to configure an array of `module` objects representing each of the JavaScript modules in your Moddable project. The `module` object has the following configuration:

```json
{
    "name": "",
    "description": "",
    "isHost": false,
    "debugFlag": true,
    "makeFlag": true,
    "folderPath": "",
}
```

* `name` - The unique identifier for the module. This is the value you'll use in `mddbl` commands to refer to the module.
* `description` - A description of the module, not used for anything except to remind you about this module's configuration.
* `isHost` - Boolean value indicating whether the module is a Host or Module (controls whether Moddable Helper executes `mcconfig` or `mcrun` to deploy the module).
* `debugFlag` - Enables/disables the `-d` parameter passed to `mcconfig` and `mcrun`; refer to the [Moddable documentation](https://github.com/Moddable-OpenSource/moddable/blob/public/documentation/tools/tools.md#arguments) for details about this parameter.
* `makeFlag` - Enables/disables the `-m` parameter passed to `mcconfig` and `mcrun`; refer to the [Moddable documentation](https://github.com/Moddable-OpenSource/moddable/blob/public/documentation/tools/tools.md#arguments) for details about this parameter.
* `folderPath` - The name of the subfolder hosting the module.

The example configuration file shown above defines three modules:

```json
"modules": [
    {
      "name": "host",
      "description": "The project's host module",
      "isHost": true,
      "debugFlag": true,
      "makeFlag": true,
      "folderPath": "host"
    },
    {
      "name": "hw",
      "description": "Text-only version of the project",
      "isHost": false,
      "debugFlag": true,
      "makeFlag": true,
      "folderPath": "helloworld"
    },
    {
      "name": "hwg",
      "description": "Hello World Graphical version",
      "isHost": false,
      "debugFlag": true,
      "makeFlag": true,
      "folderPath": "helloworld-gui"
    }
],
```

The `host` module refers to the JavaScript Host module code in the project's `host` folder. The `hw` and `hwg` modules refer to JavaScript Modules in the `helloworld` and `helloworld-gui` folders.

##### Targets

Use the `targets` section of the configuration file to configure an array of `target` objects representing each of the Moddable-compatible hardware devices used by your project. The `target` object has the following configuration:

```json
{
    "name": "",
    "description": "",
    "platform": "",
    "wipeCommand": "",
}
```

* `name` - The unique identifier for the device. This is the value you'll use in `mddbl` commands to refer to the device; the Moddable SDK uses a full description to refer to a device (`esp32/moddable_two` for example) and this just gives you a shortcut for the full name.
* `description` - A description of the device, not used for anything except to remind you about this device.
* `platform` - The full Moddable SDK platform identifier for the device (`esp32/moddable_two` for example).
* `formatFlag` - Enables/disables the `-f` parameter passed to `mcconfig` and `mcrun`; refer to the [Moddable documentation](https://github.com/Moddable-OpenSource/moddable/blob/public/documentation/tools/tools.md#arguments) for details about this parameter.
* `formatStr` - With `formatFlag` enabled, specifies the format string passed to the Moddable SDK. Available options are (from the Moddable SDK Docs) `gray16`, `gray256`, `rgb332`, `rgb565be` or `rgb565le`. The Moddable SDK defaults to `rgb565le` if you leave this value empty.
* `rotationFlag` - Enables/disables the `-r` parameter passed to `mcconfig` and `mcrun`; refer to the [Moddable documentation](https://github.com/Moddable-OpenSource/moddable/blob/public/documentation/tools/tools.md#arguments) for details about this parameter.
* `rotationValue` - With `rotationFlag` enabled, specifies the screen rotation value. Supported values are `0`, `90`, `180` or `270`. The Moddable SDK defaults to 0, but there's no way to leave this value blank, so you must ensure a valid value is set for this property.
* `wipeCommand` - The file system command to wipe the device. The command used is specific to the hardware platform, not the Moddable SDK.

> **Note**: On Microsoft Windows, you must double-up file system delimiters; `"python %IDF_PATH%\components\esptool_py\esptool\esptool.py erase_flash"` becomes `"python %IDF_PATH%\\components\\esptool_py\\esptool\\esptool.py erase_flash"`. JavaScript uses the backslash (`\`) when escaping other characters in a string, so to include the backslash in a command string, you must escape it with a backslash first.

The example configuration file shown above defines two Targets devices:

```json
"targets": [
    {
      "name": "mdbl2",
      "description": "Moddable Two",
      "platform": "esp32/moddable_two",
      "formatFlag": false,
      "formatStr": "",
      "rotationFlag": false,
      "rotationValue": 0,
      "wipeCommand": "python %IDF_PATH%\\components\\esptool_py\\esptool\\esptool.py erase_flash"
    },
    {
      "name": "m5fire",
      "description": "M5Stack Fire device",
      "platform": "esp32/m5stack_fire",
      "formatFlag": true,
      "formatStr": "gray16",
      "rotationFlag": false,
      "rotationValue": 0,
      "wipeCommand": "python %IDF_PATH%\\components\\esptool_py\\esptool\\esptool.py erase_flash"
    }
  ]
```

> **Note**: The targets use the same wipe command because the devices are both based on the ESP32 hardware platform.

#### <a name='ViewingtheConfigurationFile'></a>Viewing the Configuration File

To view the contents of the configuration file in the console, execute the following command:

```shell
mddbl config show
```

#### <a name='EditingtheConfigurationFile'></a>Editing the Configuration File

To launch the module's configuration file using your system's default `.json` file editor, execute the following command:

```shell
mdbbl config edit
```

#### <a name='SortingModuleandTargetLists'></a>Sorting Module and Target Lists

For users with a bit of obsessive compulsive disorder (OCD), you can sort the Module and Target lists using the following command:

```shell
mdbbl config sort
```

You know, just because.

### <a name='Deploy'></a>Deploy

To deploy a Host or Module to a connected device, execute the following command in the terminal window pointing to the Moddable project folder:

```shell
mddbl deploy <module> [target]
```

> **Note**: The `target` parameter is optional. If you omit it, then the Moddable SDK will load the module in the emulator for the operating system running the command (`win` for Windows, `mac` for macOS, etc.).

To deploy a project's `host` to the `mdbl2` (Moddable Two) defined in our sample config file, use:

```shell
mddbl deploy host mdbl2
```

To deploy the `helloworld` module to the `m5fire` device defined in our sample config file, use:

```shell
mddbl deploy hw m5fire
```

To deploy the 'host' module to the emulator for the current platform, execute the following:

```shell
mddbl deploy host
```

You can also deploy in interactive mode:

```shell
mddbl deploy
```
When you execute the `deploy` command without specifying a module, Moddable Helper will prompt you to select the Module  from a list of available options (from the project's configuration file):

```text
Moddable Helper (mddbl)
Reading configuration file
? Module Selection ...
> host
  hw
  hwg
```

Next, it will prompt you to select a Target from the list of available options:

```text
Moddable Helper (mddbl)
Reading configuration file
√ Module Selection · host
? Target Selection ...   
> m5fire
  mdbl2
```

And finally, it will trigger deployment using the selected options:

```text
Moddable Helper (mddbl)
Reading configuration file
√ Module Selection · host
√ Target Selection · mdbl2      
Deploying host to mdbl2
```

### <a name='ListModulesorTargets'></a>List Modules or Targets

When you're getting ready to execute the `deploy` or `wipe` commands, you may forget which module and target options are available to you. You can list the modules or targets defined in the project's configuration file using:

```shell
mddbl modules
```

and

```shell
mddbl targets
```

For the configuration file example in this document, the module list output looks the following:

```text
Moddable Helper (mddbl)
Reading configuration file

Configured Modules:
- host - The project's host module
- hw - Text-only version of the project
- hwg - Hello World Graphical version
```

### <a name='WipeDevice'></a>Wipe Device

While troubleshooting deployment or coding issues, you may encounter the need to wipe the device. Most, if not all, hardware platforms Moddable supports offer some mechanism for wiping the memory of the device. Since the device SDK commands needed to do this are obscure and not often executed, the Moddable Helper CLI offers a mechanism for storing the wipe command in the configuration file then invoking it by executing the following command:

```shell
mddbl wipe <target>
```

For example, using the sample configuration file example in this document, to wipe the M5Stack Fire device, use the following command:

```shell
mddbl wipe m5fire
```

## <a name='PlannedFeatures'></a>Planned Features

* Implement a command-line option to add a module to the configuration file
* Implement a command-line option to add a target to the configuration file
* Add support for other `mcconfig` and `mcrun` command-line parameters
* Anything else I come up with as I work with the Moddable SDK

***

You can find information on many different topics on my [personal blog](http://www.johnwargo.com). Learn about all of my publications at [John Wargo Books](http://www.johnwargobooks.com).

If you find this code useful and feel like thanking me for providing it, please consider <a href="https://www.buymeacoffee.com/johnwargo" target="_blank">Buying Me a Coffee</a>, or making a purchase from [my Amazon Wish List](https://amzn.com/w/1WI6AAUKPT5P9).
