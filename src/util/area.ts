import axios from "axios"

export const getSetting = () => { }

const apiPrefix = '/kong/RdTestAiService-b'

export const api_checkNetArea = (): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios({
        url: `${apiPrefix}/auth/judgment`,
        method: 'get',
      })
      const res = response.data
      if(res.code === 0) {
        if(res.data == 1 || res.data == 2) {
          resolve(true)
        }else {
          resolve(false)
        }
      }else {
        resolve(true)
      }
    } catch (error) {
      resolve(true)
    }
  })
}