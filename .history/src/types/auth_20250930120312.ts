export interface RegisterInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }
  
  export interface LoginInput {
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
      };
      accessToken: string;
      refreshToken: string;
    };
  }
  
  export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
  }