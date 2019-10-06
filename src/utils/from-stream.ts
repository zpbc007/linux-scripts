import { Observable } from 'rxjs'
import { Readable } from 'stream'

export const fromStream = <T>(stream: Readable) => {
    stream.pause()

    return new Observable<T>(observer => {
        const dataHandler = (data: any) => observer.next(data)
        const errorHandler = (err: Error) => observer.error(err)
        const endHandler = () => observer.complete()

        stream.addListener('data', dataHandler)
        stream.addListener('error', errorHandler)
        stream.addListener('end', endHandler)

        stream.resume()

        return () => {
            stream.removeListener('data', dataHandler)
            stream.removeListener('error', errorHandler)
            stream.removeListener('end', endHandler)
        }
    })
}
