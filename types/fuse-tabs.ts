export enum TabValue {
  Dashboard = 0,
  Coins = 1,
  NFTs = 2,
}

export type Tab = { label: string; value: TabValue; content: React.ReactNode };
