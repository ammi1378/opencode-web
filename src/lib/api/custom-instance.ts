import Axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

export const AXIOS_INSTANCE = Axios.create({
  timeout: 30000,
  baseURL: 'http://0.0.0.0:56050',
})

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: { baseUrl?: string } & AxiosRequestConfig,
): Promise<T> => {
  const source = Axios.CancelToken.source()

  const mergedConfig = {
    ...config,
    ...options,
    baseURL: AXIOS_INSTANCE.defaults.baseURL,
    cancelToken: source.token,
  }

  const promise = AXIOS_INSTANCE(mergedConfig).then(({ data }) => data)

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled')
  }

  return promise
}

export type ErrorType<Error> = Error
export type BodyType<BodyData> = BodyData
