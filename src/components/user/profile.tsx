'use client'
import { Button, Image, Listbox, ListboxItem, ScrollShadow, User } from '@heroui/react'
import { Dispatch, SetStateAction, useState } from 'react'

import { pageConfig } from '®/config/site'
import { useMediaQuery } from '®/hooks/useMediaQuery'
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '®/ui/drawer'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '®/ui/sheet'

type PreviewProps = {
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
}

export function Profile() {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button isIconOnly radius='full' size='sm' variant='flat' onPress={() => setOpen(true)}>
                <Image alt='Fix iT Rock' height={30} src='/icons/rdrive.png' width={30} />
            </Button>
            <SheetDrawer open={open} setOpen={setOpen} />
        </>
    )
}

const UserDetails = () => (
    <User
        avatarProps={{
            src: '/icons/rdrive.png',
            className: 'w-12 h-12',
        }}
        classNames={{
            base: 'flex justify-start px-2 sm:px-0',
            name: 'text-md',
        }}
        description='Software & Hardware'
        name='Rock Star 💕'
    />
)

const NavLinks = () => (
    <Listbox variant='flat'>
        {pageConfig.user.map((nav) => (
            <ListboxItem
                key={nav.title}
                classNames={{ title: `${nav.title === 'Logout' ? 'text-danger' : ''}` }}
                // color={nav.title === 'Logout' ? 'danger' : 'default'}
                startContent={nav.icon}
                textValue={nav.title}
            >
                {nav.title}
            </ListboxItem>
        ))}
    </Listbox>
)

function SheetDrawer({ open, setOpen }: PreviewProps) {
    const isDesktop = useMediaQuery('(min-width: 640px)')

    return (
        <>
            {isDesktop ? (
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetContent className='flex flex-col gap-0 p-0 sm:max-w-[280px]'>
                        <SheetHeader aria-label='Profile' className='border-b p-2'>
                            <SheetTitle>
                                <UserDetails />
                            </SheetTitle>
                        </SheetHeader>
                        <ScrollShadow hideScrollBar className='flex-1 lg:pr-3'>
                            <NavLinks />
                        </ScrollShadow>
                        <SheetFooter className='flex border-t p-2'>
                            <p className='text-start text-xs text-muted-foreground'>
                                Fix it Rock © 2025
                            </p>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            ) : (
                <Drawer open={open} onOpenChange={setOpen}>
                    <DrawerContent className='p-2'>
                        <DrawerTitle aria-hidden />
                        <DrawerDescription aria-hidden />
                        <div className='w-full space-y-4'>
                            <UserDetails />
                            <NavLinks />
                        </div>
                    </DrawerContent>
                </Drawer>
            )}
        </>
    )
}
