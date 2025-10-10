export const can = {
    create: {
        product: 'create:product',
    },
    update: {
        product: 'update:product',
    },
    delete: {
        product: 'delete:product',
    },
} as const

export type PermissionKey = (typeof can)[keyof typeof can][keyof (typeof can)['create']]
