export interface User {
  id: string;
  email: string;
  role: 'master' | 'admin' | 'manager';
  region?: string;
  nave?: string;
  isFirstLogin?: boolean;
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
  diocese?: string;
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
  diocese?: string;
  chosenDiocese?: string;
  region?: string;
}

export interface Churchgoer {
  id: string;
  name?: string;
  baptismalName?: string;
  birthDate?: string;
  phone?: string;
  emergencyContact?: string;
  address?: string;
  region?: string;
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
  region?: string;
}

export interface DioceseVolunteer {
  id: string;
  name?: string;
  baptismalName?: string;
  age?: number;
  email?: string;
  address?: string;
  possibleServices?: string[];
  isActive?: boolean;
  intention?: string;
  notes?: string;
  region?: string;
  createdAt?: string;
}

export interface DioceseVolunteerListResponse {
  data: DioceseVolunteer[];
  meta: MemberListMeta;
}

export interface DioceseVolunteerQuery {
  pageIndex?: number;
  pageSize?: number;
  name?: string;
  isActive?: string;
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
