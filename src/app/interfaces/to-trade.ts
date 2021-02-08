export interface ToTrade {
  id: string;
  from: number;
  to: number;
  balanceFrom: string;
  balanceTo: string;
  Recipient: number;
  recipient: string;
  tokenFrom: {
    name: string;
    icon: string;
    symbol: string;
    logoURI: string,
    ammount: number;
    address: string;
  };
  tokenTo: {
    name: string;
    icon: string;
    symbol: string;
    logoURI: string,
    ammount: number;
    address: string;
  };
  tokenIntermediate: [
    {
      name: string;
      icon: string;
      symbol: string;
      logoURI: string,
      ammount: number;
    }
  ];
}
