// src/types/next-auth.d.ts
import { UserRole } from '@prisma/client';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      khcAdvocateId: string;
      khcAdvocateName: string;
      isVerified: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: UserRole;
    khcAdvocateId: string;
    khcAdvocateName: string;
    isVerified: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    khcAdvocateId: string;
    khcAdvocateName: string;
    isVerified: boolean;
  }
}


// import "next-auth"

// declare module "next-auth" {
//   interface User {
//     id: string
//     email: string
//     name: string
//     khcAdvocateId: string
//     accessToken: string
//     refreshToken: string
//   }

//   interface Session {
//     accessToken: string
//     user: {
//       id: string
//       email: string
//       name: string
//       khcAdvocateId: string
//     }
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     accessToken: string
//     refreshToken: string
//     khcAdvocateId: string
//   }
// }

// import "next-auth"
// import "next-auth/jwt"

// declare module "next-auth" {
//   interface User {
//     id: string
//     email: string
//     name: string
//     khcAdvocateId: string
//     accessToken: string
//     refreshToken: string
//   }

//   interface Session {
//     accessToken: string
//     user: {
//       id: string
//       email: string
//       name: string
//       khcAdvocateId: string
//     }
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     accessToken: string
//     refreshToken: string
//     khcAdvocateId: string
//   }
// }