import { AxiosInstance } from 'axios'

import { createRecordListRequest } from './record'

export * from './api-axios'
export function createApi(axios: AxiosInstance) {
    return {
        record: createRecordListRequest(axios)
    }
}

export type Api = ReturnType<typeof createApi>
