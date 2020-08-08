import chalk from 'chalk'

const chalkFunc = (colorFunc: (str: string) => string) => (str: string) => colorFunc(str)

export const success = chalkFunc(chalk.blue)
export const error = chalkFunc(chalk.red)
export const warn = chalkFunc(chalk.yellow)
export const info = chalkFunc(chalk.gray)