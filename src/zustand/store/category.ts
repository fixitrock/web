import { create } from 'zustand'
import { Category, CategoryInput } from '@/types/category'

interface CategoryState {
    mode: 'add' | 'edit'
    editingCategory: Category | null
    form: Partial<CategoryInput>
    setMode: (mode: 'add' | 'edit', category?: Category | null) => void
    updateForm: (fields: Partial<CategoryInput>) => void
    resetForm: () => void
}

export const useCategoryStore = create<CategoryState>((set) => ({
    mode: 'add',
    editingCategory: null,
    form: { name: '', description: '', keywords: [], imageUrl: '' },
    setMode: (mode, category = null) =>
        set({
            mode,
            editingCategory: category,
            form: category
                ? {
                      name: category.name,
                      description: category.description,
                      keywords: category.keywords,
                      imageUrl: category.image || '',
                  }
                : { name: '', description: '', keywords: [], imageUrl: '' },
        }),
    updateForm: (fields) => set((state) => ({ form: { ...state.form, ...fields } })),
    resetForm: () =>
        set({
            mode: 'add',
            editingCategory: null,
            form: { name: '', description: '', keywords: [], imageUrl: '' },
        }),
}))
