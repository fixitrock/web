const useHidden = (driveItem: { name: string }) => {
    const hiddenItems = process.env.HIDDEN!
    const rgx = new RegExp(`^(${hiddenItems})$`, 'i')

    return rgx.test(driveItem.name)
}

export default useHidden
