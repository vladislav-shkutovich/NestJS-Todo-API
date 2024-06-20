export const throwMissingEnvVar = (envVarName: string) => {
  throw new Error(`${envVarName} is not defined`)
}
