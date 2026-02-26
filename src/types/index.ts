export interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager';
  region?: string;
}

export interface Member {
  id: string;
  name: string;
  age?: number;
  nation?: string;
  parish?: string;
  cathedral?: string;
  phone?: string;
  emergencyNum?: string;
  profile?: string;
  qr?: string;
  chosenDiocese?: string;
  region?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MemberListMeta {
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export interface MemberListResponse {
  data: Member[];
  meta: MemberListMeta;
}

export interface MemberQuery {
  pageIndex?: number;
  pageSize?: number;
  name?: string;
  parish?: string;
  cathedral?: string;
  chosenDiocese?: string;
  region?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
