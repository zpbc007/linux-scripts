zpnas
=====

easy to build nas system

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/zpnas.svg)](https://npmjs.org/package/zpnas)
[![Downloads/week](https://img.shields.io/npm/dw/zpnas.svg)](https://npmjs.org/package/zpnas)
[![License](https://img.shields.io/npm/l/zpnas.svg)](https://github.com/zpbc007/zpnas/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g zpnas
$ zpnas COMMAND
running command...
$ zpnas (-v|--version|version)
zpnas/0.0.0 darwin-x64 node-v12.6.0
$ zpnas --help [COMMAND]
USAGE
  $ zpnas COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`zpnas hello [FILE]`](#zpnas-hello-file)
* [`zpnas help [COMMAND]`](#zpnas-help-command)

## `zpnas hello [FILE]`

describe the command here

```
USAGE
  $ zpnas hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ zpnas hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/zpbc007/zpnas/blob/v0.0.0/src/commands/hello.ts)_

## `zpnas help [COMMAND]`

display help for zpnas

```
USAGE
  $ zpnas help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.1/src/commands/help.ts)_
<!-- commandsstop -->
