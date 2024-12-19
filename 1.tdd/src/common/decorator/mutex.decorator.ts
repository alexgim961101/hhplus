import { Mutex } from "async-mutex"

const mutexMap = new Map<string, Mutex>()


const WithMutex = () => {
    return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
        const originalMethod = descriptor.value
        descriptor.value = async function(...args: any[]) {
            const key = args[0]
            if (!mutexMap.has(key)) {
                mutexMap.set(key, new Mutex())
            }
            const mutex = mutexMap.get(key)

            return await mutex.runExclusive(async () => {
                return await originalMethod.apply(this, args)
            })
        }
        return descriptor
    }
}

export default WithMutex