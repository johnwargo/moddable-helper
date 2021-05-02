# Moddable Helper

Delivers a command-line interface to simplifying usage of the [Moddable SDK](https://github.com/Moddable-OpenSource/moddable). This repository hosts a node.js module that:

* Delivers a simple set of commands that drive the Moddable SDK, and eliminates some of the repetitive typing required to work with the Moddable SDK command-line tools
* Uses a project configuration file to configure the settings modules and target devices used by the project
* Delivers a mechanism that enables developers to more easily wipe devices using the device's native SDK (without having to remember the command every time)

The module supports the following commands:

* `init` - Create an empty configuration file in the current folder
* `config edit` - Edit the project's configuration file
* `config show` - Display the contents of the configuration file
* `config sort` - Sort the module and target lists by name
* `deploy <module> <target>` - Deploy the selected module (module or host) to the specified target device
* `list modules` - Display the list of modules defined in the `modules` section of the configuration file
* `list targets` - Display the list of targets defined in the `targets` section of the configuration file
* `wipe <target>` - Wipe the selected target device

Detailed instructions for these commands provided below.

## Installation

To install the module, open a terminal window (or command prompt on Windows), and execute the following command:

```shell
npm install -g moddable-helper
```

This installs a `mddbl` command you can use anywhere on the system.

## Background

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
      "description": "",
      "isHost": true,
      "folderPath": "host"
    },
    {
      "name": "hw",
      "description": "",
      "isHost": false,
      "folderPath": "helloworld"
    },
    {
      "name": "hwg",
      "description": "",
      "isHost": false,
      "folderPath": "helloworld-gui"
    }
  ],
  "targets": [
    {
      "name": "mdbl2",
      "description": "Moddable Two",
      "platform": "esp32/moddable_two",
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

> **Note**: The mddbl module uses the module's `isHost` property to determine whether to executs `mcconfig` or `mcrun`.


## Usage



***

You can find information on many different topics on my [personal blog](http://www.johnwargo.com). Learn about all of my publications at [John Wargo Books](http://www.johnwargobooks.com).

If you find this code useful and feel like thanking me for providing it, please consider <a href="https://www.buymeacoffee.com/johnwargo" target="_blank">Buying Me a Coffee</a>, or making a purchase from [my Amazon Wish List](https://amzn.com/w/1WI6AAUKPT5P9).
