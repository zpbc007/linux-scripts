import Command, { flags } from '@oclif/command'
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
        })
    }

    async run() {
        const { flags: sFlags } = this.parse(Source)
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
        const sourceFile = resolve(__dirname, '../constant/source/', response.sourceFile)
        const targetSourceFile = '/etc/apt/sources.list'
        let targetSourceFileFd: number
        // 备份源文件
        if (sFlags.backup) {
            const backupSourceFile = '/etc/apt/sources.list.backup'
            await promisify(fs.copyFile)(targetSourceFile, backupSourceFile)
            this.log(success('backup success'))
        }

        // 打开目标文件
        try {
            targetSourceFileFd = await promisify(fs.open)(targetSourceFile, 'a')
        } catch {
            this.error(error(`can not write to file: ${targetSourceFile}`))

            return this.exit()
        }

        // 读取源文件
        const sourceData = await promisify(fs.readFile)(sourceFile)

        // 写入
        try {
            await promisify(fs.appendFile)(targetSourceFileFd, sourceData)
            this.log(success('add source success'))
        } catch (e) {
            this.error(e)
        } finally {
            await promisify(fs.close)(targetSourceFileFd)
        }
    }
}
