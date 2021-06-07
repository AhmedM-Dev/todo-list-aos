const consoleLoader = (text: string, sleepTime = 100) => {
  const P = ['\\', '|', '/', '-']
  let x = 0
  return setInterval(() => {
    process.stdout.write(`\r${P[x++]} ${text}...`)
    x &= 3
  }, sleepTime)
}

consoleLoader.stop = (intervalId: NodeJS.Timeout) => clearInterval(intervalId)

export default consoleLoader
