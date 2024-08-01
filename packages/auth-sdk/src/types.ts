export type pollResponse = {
    code: number;
    data: {
      wallet_address: string;
      user: {
        first_name: string;
        last_name: string;
        primary_contact: string;
        _id: string;
      };
      key: string;
    };
    message: string;
  };