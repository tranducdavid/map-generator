let profileDepth = 0

export function profile<T extends (...args: any[]) => any>(fn: T, customLabel?: string): T {
  const label = customLabel || fn.name || 'Anonymous Function'

  return ((...args: Parameters<T>): ReturnType<T> => {
    const spaces = ' '.repeat(profileDepth * 4)
    profileDepth++

    console.log(spaces + `${label}: Start`)
    console.time(spaces + label)

    const result = fn(...args)

    console.timeEnd(spaces + label)
    profileDepth--

    return result
  }) as T
}
