import Command, { flags } from '@oclif/command'
import { exec } from 'child_process'
import * as fs from 'fs'
import { prompt } from 'inquirer'
import { resolve } from 'path'
import { promisify } from 'util'

import { error, success } from '../utils/color'

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
        let targetSourceFileFd: number

        // 备份源文件
        if (sFlags.backup) {
            await this.backup()
        }

        // 打开目标文件
        try {
            targetSourceFileFd = await promisify(fs.open)(Source.targetSourceFile, 'a')
        } catch {
            this.error(error(`can not write to file: ${Source.targetSourceFile}`))

            return this.exit()
        }

        // 读取源文件
        const sourceData = await promisify(fs.readFile)(sourceFile)

        // 写入
        try {
            await promisify(fs.appendFile)(targetSourceFileFd, sourceData)
            this.log(success('add source success'))
        } catch (e) {
            return this.error(e)
        } finally {
            await promisify(fs.close)(targetSourceFileFd)
        }

        if (sFlags.upgrade) {
            await this.updateApt()
        }
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
    private async backup() {
        await promisify(fs.copyFile)(Source.targetSourceFile, Source.backupSourceFile)
        this.log(success('backup success'))
    }

    // 更新软件
    private async updateApt() {
        const proExec = promisify(exec)
        try {
            await proExec('sudo apt update')
            await proExec('sudo apt upgrade -y')
        } catch (e) {
            this.error(e)
        }
    }
}
