export interface IRPC {
  chainName: string;
  chainId: number;
  rpc: {
    chainId: string;
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    },
    rpcUrls: string[];
    blockExplorerUrls: string[];
  };
}
