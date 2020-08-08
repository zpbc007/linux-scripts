import Command, { flags } from '@oclif/command'
import { readFile } from 'fs'
import Listr from 'listr'
import Path from 'path'
import { promisify } from 'util'

import { Api, createApi, createApiAxios } from '../ddns/api'
import { IRecord } from '../ddns/api/record'
import { getPublicIp } from '../ddns/get-public-ip'
import { IGlobalConfig } from '../ddns/type'
import { error, success, warn } from '../utils/color'

interface ITaskContext {
    publicIp: string
    config: IGlobalConfig | null
    api: Api | null
    targetRecord: IRecord | null
}

const asyncReadFile = promisify(readFile)

export default class Ddns extends Command {
    static description = 'update ip on dnspod'

    static flags = {
        config: flags.string({
            char: 'c',
            description: 'config file dir',
            default: './config.json'
        })
    }

    async run() {
        const { flags: sFlags } = this.parse(Ddns)

        const taskContext: ITaskContext = {
            publicIp: '',
            config: null,
            api: null,
            targetRecord: null
        }

        const tasks = new Listr<ITaskContext>([
            {
                title: 'load config',
                task: async ctx => {
                    const config = await this.loadConfig(sFlags.config)
                    ctx.config = config

                }
            }, {
                title: 'get public ip',
                task: async ctx => {
                    const ip = await getPublicIp()
                    if (!ip) {
                        this.error(error('can not get public ip'))
                        this.exit(1)
                    } else {
                        this.log(success(`get ip: ${ip}`))
                        ctx.publicIp = ip
                    }
                }
            }, {
                title: 'init axios for api',
                task: ctx => {
                    // 实例化 axios
                    const apiAxios = createApiAxios(ctx.config!)
                    ctx.api = createApi(apiAxios)
                }
            }, {
                title: 'get record',
                task: async ctx => {
                    const { api, config, publicIp } = ctx
                    const { domain, subDomain } = config!
                    // 获取记录列表
                    const recordList = await api!.record.getList({
                        domain
                    })
                    // 获取对应的子域名记录 id
                    const targetRecord = recordList.records.find(record => record.name === subDomain)

                    if (!targetRecord) {
                        this.error(error(`can not find the record: ${subDomain}`))
                        return this.exit()
                    }

                    // ip 没变不需要更新
                    if (targetRecord.value === publicIp) {
                        this.warn(warn(`ip not change: ${publicIp}`))
                        return process.exit()
                    }

                    ctx.targetRecord = targetRecord
                }
            }, {
                title: 'modify dnspod record',
                task: ({ targetRecord, publicIp, api, config }) => this.modifyRecord(api!, targetRecord!, config!, publicIp)
            }
        ])

        await tasks.run(taskContext)
            .catch(err => {
                error(err)
                this.exit()
            })
    }

    // 加载 config 文件
    private async loadConfig(path: string) {
        if (!Path.isAbsolute(path)) {
            path = Path.resolve(process.cwd(), path)
        }

        return asyncReadFile(path, { encoding: 'utf-8' }).then(configStr => JSON.parse(configStr) as IGlobalConfig)
    }

    private async modifyRecord(api: Api, oldRecord: IRecord, config: IGlobalConfig, newIp: string) {
        const modifyRes = await api.record.modify({
            domain: config.domain,
            record_id: oldRecord.id,
            sub_domain: oldRecord.name,
            record_type: oldRecord.type,
            record_line_id: oldRecord.line_id,
            value: newIp
        })

        if (modifyRes && modifyRes.record && modifyRes.record.value === newIp) {
            this.log(success(`update success new ip: ${newIp}`))
        } else {
            this.error(error(`modify error: ${JSON.stringify(modifyRes)}`))
        }
    }
}
