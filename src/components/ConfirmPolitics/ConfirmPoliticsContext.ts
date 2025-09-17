import { createContext, useContext } from "react"

export type ConfirmPoliticsContent = {
  accept: boolean;
  setAccept: (value: boolean) => void;
};

export const ConfirmPoliticsContext = createContext<ConfirmPoliticsContent>({
  accept: false,
  setAccept: () => {},
});

export const useConfirmPolitics = () => useContext(ConfirmPoliticsContext);