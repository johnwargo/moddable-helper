# Moddable Helper

I've been playing around lately with the [Moddable SDK](https://github.com/Moddable-OpenSource/moddable); I think the platform's pretty interesting for a lot of reasons I'll write about later on [my blog](https://johnwargo.com), and they deliver several very capable IoT devices with built-in displays at a great price.

One of the things I noticed when I started working with the Moddable SDK was that I found myself typing the same commands over and over again as I coded projects for the devices. Now, that's not unexpected for command-line based tooling, but when building and deploying for Moddable devices, I kept typing the exact same command-line options over and over again (`-d m -p <device>`) that I decided to make this helper to reduce my typing.

This repository hosts a node.jd module that:

* Let me define options/parameters for my project in a configuration file, then use a simplified command structure to execute the corresponding Moddable SDK commands
* Let me to more easily wipe devices using the device's native SDK (without having to remember the command every time I want to do it)

Let me show you how this works using a real-world example. The folks at Moddable published a book called [IoT Development for ESP32 and ESP8266 with JavaScript](https://github.com/Moddable-OpenSource/iot-product-dev-book) that contains a lot of sample code demonstrating how to use the different APIs in their SDK. Moddable developers often break a project down into multiple parts, a host (the core native application running on the device) plus additional JavaScript modules that run within the host (a dramatic oversimplification, I know, but I'm not here to teach you Moddable development). Developers typically keep their host and module files in different file system folders.

> **Note**: What I show here applies to any Moddable SDK project

Using the book's Chapter 1 [Hello World](https://github.com/Moddable-OpenSource/iot-product-dev-book/tree/master/ch1-gettingstarted) project as an example, to deploy the host to a Moddable Two device, you will open a terminal window, navigate to the project folder, then execute the following commands:

```shell
cd host
mcconfig -d -m -p esp32/moddable_two
```

Then, to deploy the host, you'd execute the following commands:

```shell
cd ../helloworld
mcrun -d -m -p esp32/moddable_two
```



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

***

You can find information on many different topics on my [personal blog](http://www.johnwargo.com). Learn about all of my publications at [John Wargo Books](http://www.johnwargobooks.com).

If you find this code useful and feel like thanking me for providing it, please consider <a href="https://www.buymeacoffee.com/johnwargo" target="_blank">Buying Me a Coffee</a>, or making a purchase from [my Amazon Wish List](https://amzn.com/w/1WI6AAUKPT5P9).
