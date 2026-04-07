export const appMessages = {
    common: {
        unknownError: 'Hmm… that didn’t go as planned.',
        refreshAndTry: 'Give it a refresh. Works more often than you think.',
    },

    concurrency: {
        staleData: 'Oops—someone was faster than you. Refresh and try again.',
        missingVersion: 'You’re a step behind. Refresh to catch up.',
    },

    profile: {
        saveSuccess: 'Saved! Easy win.',
        saveFailed: 'Didn’t save… want to try that again?',
        uploadAvatarFailed: 'That photo didn’t vibe. Try another?',
        uploadCoverFailed: 'Cover photo said “maybe later”. Try again.',
        removeAvatarFailed: 'That photo is clinging on. Try again.',
        removeCoverFailed: 'Cover photo isn’t ready to leave yet.',
    },

    product: {
        addFailed: 'That didn’t work… almost had it.',
        updateFailed: 'Update didn’t stick. Give it another shot.',

        duplicateNameCategory: 'This one already exists. Great minds think alike 😄',

        nameRequired: 'No name? Feeling mysterious today? Add one.',
        categoryRequired: 'Pick a category—you got this.',

        variantRequired: 'Almost there… just finish the details.',
        brandRequired: 'Every variant needs a brand. Don’t skip it.',
        storageRequired: 'Storage missing. Tiny detail, big deal.',

        purchasePriceRequired: 'Purchase price is missing. Sneaky one.',
        wholesalePriceRequired: 'Wholesale price? Don’t forget it.',
        priceRequired: 'Set a price—we’re not giving it away 😄',
        mrpRequired: 'MRP is missing. Add it in.',

        variantDuplicate: 'This variant again? You’re repeating yourself 😏',

        permissionDenied: 'Nice try… but not allowed.',
        ownershipDenied: 'Hey… that’s not yours 👀',

        staleUpdate: 'Someone beat you to it. Speed matters 😄',
        missingVersion: 'This one’s outdated. Time to refresh.',

        variantsMissing: 'At least one variant… don’t leave it empty.',
        invalidVariantValue: 'Something looks off. Give it another look.',
    },
} as const

type ProductAction = 'add' | 'update'

type ErrorRule = {
    match: string[]
    message: string
}

const productErrorRules: ErrorRule[] = [
    {
        match: ['conflict'],
        message: appMessages.product.staleUpdate,
    },
    {
        match: ['missing product version token'],
        message: appMessages.product.missingVersion,
    },
    {
        match: ['already have a product with this name', 'product_seller_id_slug_key'],
        message: appMessages.product.duplicateNameCategory,
    },
    {
        match: ['product name is required'],
        message: appMessages.product.nameRequired,
    },
    {
        match: ['product category is required'],
        message: appMessages.product.categoryRequired,
    },
    {
        match: ['permission denied'],
        message: appMessages.product.permissionDenied,
    },
    {
        match: ['you do not own this product'],
        message: appMessages.product.ownershipDenied,
    },
    {
        match: [
            'product_variants_product_id_brand_color_storage_key',
            'duplicate key value violates unique constraint',
        ],
        message: appMessages.product.variantDuplicate,
    },
    {
        match: [
            'invalid input syntax for type numeric',
            'invalid input syntax for type integer',
            'invalid input syntax for type uuid',
            'null value in column',
            'violates not-null constraint',
        ],
        message: appMessages.product.invalidVariantValue,
    },
    {
        match: ['at least one variant is required'],
        message: appMessages.product.variantsMissing,
    },
    {
        match: ['variant brand is required'],
        message: appMessages.product.brandRequired,
    },
    {
        match: ['variant storage is required'],
        message: appMessages.product.storageRequired,
    },
    {
        match: ['variant purchase price is required'],
        message: appMessages.product.purchasePriceRequired,
    },
    {
        match: ['variant wholesale price is required'],
        message: appMessages.product.wholesalePriceRequired,
    },
    {
        match: ['variant price is required'],
        message: appMessages.product.priceRequired,
    },
    {
        match: ['variant mrp is required'],
        message: appMessages.product.mrpRequired,
    },
]

export function getProductErrorMessage(rawMessage: string | undefined, action: ProductAction) {
    const msg = rawMessage?.toLowerCase() ?? ''

    const matchedRule = productErrorRules.find((rule) =>
        rule.match.some((keyword) => msg.includes(keyword))
    )

    if (matchedRule) return matchedRule.message

    return action === 'add' ? appMessages.product.addFailed : appMessages.product.updateFailed
}
