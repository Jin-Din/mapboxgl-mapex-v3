//作者:Jin
/**
 * promise 捕获返回 error 和 result
 *
 * 返回： [error,result]
 * @param promise
 */
export default async (promise: Promise<any>) => {
  try {
    const v = await promise;
    return [null, v] as const;
  } catch (e) {
    return [e, null] as const;
  }
};
