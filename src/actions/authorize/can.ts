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
} as const

export type PermissionKey = (typeof can)[keyof typeof can][keyof (typeof can)['create']]
