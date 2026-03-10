export const can = {
    create: {
        product: 'create:product',
        order: 'create:order',
    },
    update: {
        product: 'update:product',
        order: 'update:order',
    },
    delete: {
        product: 'delete:product',
        order: 'delete:order',
    },
    return: {
        order: 'return:order',
    },
} as const

type Values<T> = T[keyof T]

export type PermissionKey = Values<Values<typeof can>>
