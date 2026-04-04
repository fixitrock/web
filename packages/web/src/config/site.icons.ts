import { Moon, SunIcon } from 'lucide-react'
import { BsApple, BsUsbSymbol } from 'react-icons/bs'
import { FaRupeeSign, FaUnlock } from 'react-icons/fa'
import { GiAutoRepair } from 'react-icons/gi'
import { MdPhonelinkSetup } from 'react-icons/md'
import { RiComputerLine } from 'react-icons/ri'
import { SiGhostery } from 'react-icons/si'

import type { SiteIcon } from './site.types'

export interface SiteIconMap {
    apple: SiteIcon
    dark: SiteIcon
    home: SiteIcon
    light: SiteIcon
    repair: SiteIcon
    rupee: SiteIcon
    system: SiteIcon
    tools: SiteIcon
    unlock: SiteIcon
    usb: SiteIcon
}

export const siteIcons: SiteIconMap = {
    apple: BsApple,
    dark: Moon,
    home: SiGhostery,
    light: SunIcon,
    repair: GiAutoRepair,
    rupee: FaRupeeSign,
    system: RiComputerLine,
    tools: MdPhonelinkSetup,
    unlock: FaUnlock,
    usb: BsUsbSymbol,
} as const
