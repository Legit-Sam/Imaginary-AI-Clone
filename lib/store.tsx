import { createStore } from "zustand/vanilla"
import { StoreApi, useStore } from "zustand"
import React from "react"
import { persist, createJSONStorage } from "zustand/middleware"

const createZustandContext = <TInitial, TStore extends StoreApi<any>>(
  getStore: (initial: TInitial) => TStore
) => {
  const Context = React.createContext(null as any as TStore)

  const Provider = (props: {
    children?: React.ReactNode
    initialValue: TInitial
  }) => {
    const [store] = React.useState(getStore(props.initialValue))

    return <Context.Provider value={store}>{props.children}</Context.Provider>
  }

  return {
    useContext: () => React.useContext(Context),
    Context,
    Provider,
  }
}

// Extend the State type to include height, width, and their respective setters
type State = {
  tags: string[]
  setTags: (tags: string[]) => void
  activeTag: string
  setActiveTag: (tag: string) => void
  activeColor: string
  setActiveColor: (color: string) => void
  generating: boolean
  setGenerating: (generating: boolean) => void
  height: number
  width: number
  setImageHeight: (height: number) => void
  setImageWidth: (width: number) => void
}

const getStore = (initialState: {
  activeTag: string
  activeColor: string
  activeImage: string
}) => {
  return createStore<State>()(
    persist(
      (set) => ({
        tags: [],
        activeTag: initialState.activeTag,
        setTags: (tags) => set({ tags }),
        setActiveTag: (tag) => set({ activeTag: tag }),
        activeColor: initialState.activeColor,
        setActiveColor: (color) => set({ activeColor: color }),
        generating: false,
        setGenerating: (generating) => set({ generating }),
        height: 0,
        width: 0,
        setImageHeight: (height) => set({ height }),
        setImageWidth: (width) => set({ width }),
      }),
      {
        name: "image-storage",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
}

export const ImageStore = createZustandContext(getStore)

export function useImageStore<T>(selector: (state: State) => T) {
  const store = React.useContext(ImageStore.Context)
  if (!store) {
    throw new Error("Missing ImageStore provider")
  }
  return useStore(store, selector)
}
