export const getUrl = (): string => {
  // Check if we are on localhost
  if (process.env.QORUS_HOST) {
    // Get the protocol
    const protocol = process.env.QORUS_PROTO ?? 'http'
    // Get the port
    const port = process.env.QORUS_PORT ?? (protocol === 'http' ? '8091' : '8092')

    return `${protocol}://${process.env.QORUS_HOST}:${port}/api/latest/`
  } else {
    return 'http://hq.qoretechnologies.com:8091/api/latest/'
  }
}
