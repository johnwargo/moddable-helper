# Changelog

## 0.0.11 - May 20, 2021

* Added a `finally` clause to the `doDeploy` function, ensuring it switches back to the starting folder

## 0.0.10 - May 11, 2021

* Reverted the `deployModule` changes from 0.0.9
* Actually fixed the issue with `deploy`; it now properly processes the deployment when you don't provide a target

## 0.0.9 - May 11, 2021

* Fixed logic error in `deploy` command, didn't fail correctly if a target was not passed to the command
* Refactored (simplified) the `checkDirectory` function

## 0.0.8 - May 10, 2021

* Added required parameter `module` to the `module add` command
* Added required parameter `target` to the `target add` command

## 0.0.7 - May 9, 2021

Mother's Day Edition

* Added `module` commands `add`, `rm`, `show`
* Added `target` commands `add`, `rm`, `show`
* Refactored most function names and grouped related functions

## 0.0.6 - May 6, 2021

* Fixed issue with config edit on macOS

## 0.0.5 - May 5, 2021

* Readme file changes

## 0.0.4 - May 4, 2021

* Added interactive deployment mode

## 0.0.3 - May 4, 2021

* Added the `formatFlag` and `formatStr` configuration options
* Added the `rotationFlag` and `rotationValue` configuration options
* Added the `modules` and `targets` commands
* Removed the `list` commands
* Removed the `platformFlag` configuration option (that didn't last long, did it?)

## 0.0.2 - May 4, 2021

* Added the `platformFlag` configuration option
* Updated the `.npmignore` file to keep some sample files from the install

## 0.0.1 - May 3, 2021

Initial release
