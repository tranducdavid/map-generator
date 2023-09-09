let profileDepth = 0

export const profile = (fn: (...args: any[]) => any, customLabel?: string) => {
  const label = customLabel || fn.name || 'Anonymous Function'

  return (...args: any[]) => {
    const spaces = ' '.repeat(profileDepth * 4)
    profileDepth++

    console.log(spaces + `${label}: Start`)
    console.time(spaces + label)

    const result = fn(...args)

    console.timeEnd(spaces + label)
    profileDepth--

    return result
  }
}
