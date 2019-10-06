import Command, { flags } from '@oclif/command'
import execa from 'execa'
import * as fs from 'fs'
import { prompt } from 'inquirer'
import Listr from 'listr'
import { resolve } from 'path'
import { promisify } from 'util'

import { fromStream } from '../utils/from-stream'

export default class Source extends Command {
    static description = 'replace aliyun source'

    static flags = {
        backup: flags.boolean({
            char: 'b',
            description: 'backup source.list',
            default: false
        }),
        upgrade: flags.boolean({
            char: 'u',
            description: 'update and upgrade apt software',
            default: false
        })
    }

    static targetSourceFile = '/etc/apt/sources.list'
    static backupSourceFile = '/etc/apt/sources.list.backup'

    async run() {
        const { flags: sFlags } = this.parse(Source)
        const sourceFile = await this.getSourceFile()

        const tasks = new Listr<{sourceFileFd: number}>([{
            title: 'backup source file',
            enabled: () => sFlags.backup,
            task: () => this.backup()
        }, {
            title: 'update source file',
            task: () => this.createUpdateSourceFileTask(sourceFile)
        }, {
            title: 'update & upgrade apt',
            enabled: () => sFlags.upgrade,
            task: () => this.createUpdateAptTask()
        }])

        const taskCtx = { sourceFileFd: -1 }
        tasks
            .run(taskCtx)
            .finally(() => {
                if (taskCtx.sourceFileFd !== -1) {
                    return promisify(fs.close)(taskCtx.sourceFileFd)
                }
            })
            .catch(err => {
                if (err) {
                    this.exit()
                }
            })
    }

    // 获取源文件地址
    private async getSourceFile() {
        const response = await prompt([{
            name: 'sourceFile',
            message: 'select a source',
            type: 'list',
            choices: [{
                name: '18.04.aliyun.source'
            }, {
                name: '19.04.aliyun.source'
            }]
        }])
        return resolve(__dirname, '../../source', response.sourceFile)
    }

    // 备份文件
    private backup() {
        return promisify(fs.copyFile)(Source.targetSourceFile, Source.backupSourceFile)
    }

    private createUpdateSourceFileTask(sourceFile: string) {
        return new Listr([{
            title: 'open source file',
            task: async ctx => {
                ctx.sourceFileFd = await promisify(fs.open)(Source.targetSourceFile, 'a')
            }
        }, {
            title: 'write data',
            task: async ctx => {
                // 读取源文件
                const sourceData = await promisify(fs.readFile)(sourceFile)
                await promisify(fs.appendFile)(ctx.sourceFileFd, sourceData)
            }
        }])
    }

    // 更新软件
    private async createUpdateAptTask() {
        return new Listr([{
            title: 'update apt',
            task: (_, task) => {
                const updatePro = execa('sudo', ['apt', 'update'])
                fromStream<string>(updatePro.stdout).subscribe(data => task.title = data)
                return updatePro
            }
        }, {
            title: 'upgrade apt',
            task: (_, task) => {
                const upgradePro = execa('sudo', ['apt', 'upgrade -y'])
                fromStream<string>(upgradePro.stdout).subscribe(data => task.title = data)
                return upgradePro
            }
        }])
    }
}
