export interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager';
  region?: string;
  nave?: string;
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
  assignedChurchgoer?: { id: number; name?: string; parish?: string; address?: string } | null;
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
}

export interface Churchgoer {
  id: string;
  name?: string;
  baptismalName?: string;
  phone?: string;
  address?: string;
  parish?: string;
  district?: string;
  ban?: string;
  familyType?: string;
  childrenCount?: number;
  familyTypeOther?: string;
  housingType?: string;
  housingTypeOther?: string;
  pilgrimGender?: string;
  clergyAcceptable?: boolean;
  bedroomType?: string;
  bedCount?: number;
  futonCount?: number;
  bathroomType?: string;
  hasPet?: boolean;
  petType?: string;
  petLocation?: string;
  hasWifi?: boolean;
  hasWasher?: boolean;
  smokingPolicy?: string;
  transportationType?: string;
  breakfastAvailable?: boolean;
  dinnerAvailable?: boolean;
  availableRooms?: number;
  maxCapacity?: number;
  notes?: string;
  createdAt?: string;
  assignedMemberCount?: number;
  assignedMembers?: AssignedMemberSummary[];
}

export interface AssignedMemberSummary {
  id: number;
  name?: string;
  age?: number;
  nation?: string;
  parish?: string;
  phone?: string;
}

export interface ChurchgoerListResponse {
  data: Churchgoer[];
  meta: MemberListMeta;
}

export interface ChurchgoerQuery {
  pageIndex?: number;
  pageSize?: number;
  name?: string;
  parish?: string;
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
